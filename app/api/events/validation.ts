export type EventPayload={event_type:'normal_speech'|'background_noise'|'shouting'|'screaming'|'movement'|'emergency'|'device_online'|'device_offline';confidence:number|null;detail:string};
const types=['normal_speech','background_noise','shouting','screaming','movement','emergency','device_online','device_offline'];
export function z(value:unknown):EventPayload|null{
 if(!value || typeof value!=='object'||Array.isArray(value))return null;
 const x=value as Record<string,unknown>;
 if(typeof x.event_type!=='string'||!types.includes(x.event_type))return null;
 if(x.confidence!==undefined && x.confidence!==null && (typeof x.confidence!=='number'||!Number.isFinite(x.confidence)||x.confidence<0||x.confidence>1))return null;
 if(x.detail!==undefined && (typeof x.detail!=='string'||x.detail.length>500))return null;
 return {event_type:x.event_type as EventPayload['event_type'],confidence:typeof x.confidence==='number'?x.confidence:null,detail:typeof x.detail==='string'?x.detail:''};
}
