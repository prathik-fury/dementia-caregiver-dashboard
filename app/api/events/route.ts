import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { timingSafeEqual } from 'node:crypto';
import { z } from './validation';
export const runtime='nodejs';
export const dynamic='force-dynamic';
let pool:Pool|undefined;
function db(){if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL not configured');return pool??=new Pool({connectionString:process.env.DATABASE_URL,max:3,ssl:{rejectUnauthorized:false}})}
const fail=(message:string,status:number)=>NextResponse.json({error:message},{status,headers:{'Cache-Control':'no-store'}});
export async function GET(){
 try{
  const client=db();
  const [devices,events]=await Promise.all([
   client.query('SELECT id,name,patient_name,created_at FROM devices ORDER BY created_at ASC'),
   client.query('SELECT id,device_id,event_type,confidence,detail,created_at FROM events ORDER BY created_at DESC LIMIT 100')
  ]);
  return NextResponse.json({devices:devices.rows,events:events.rows},{headers:{'Cache-Control':'no-store'}});
 }catch(e){console.error('GET events failed',e);return fail('Database unavailable',503)}
}
export async function POST(req:NextRequest){
 const supplied=req.headers.get('x-device-key')||'';
 const secret=process.env.DEVICE_API_KEY||'';
 if(secret.length<32||supplied.length!==secret.length||!timingSafeEqual(Buffer.from(supplied),Buffer.from(secret)))return fail('Unauthorized device',401);
 let raw:unknown;try{raw=await req.json()}catch{return fail('Invalid JSON',400)}
 const event=z(raw);if(!event)return fail('Invalid event',400);
 try{
  const client=db();
  const deviceId=process.env.DEVICE_ID||'esp32-01';
  await client.query('INSERT INTO events(device_id,event_type,confidence,detail) VALUES($1,$2,$3,$4)',[deviceId,event.event_type,event.confidence,event.detail]);
  return NextResponse.json({ok:true},{status:201,headers:{'Cache-Control':'no-store'}});
 }catch(e){console.error('POST events failed',e);return fail('Could not save event',503)}
}
