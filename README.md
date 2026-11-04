# CareConnect | Dementia Caregiver Dashboard

Responsive Next.js caregiver dashboard with an immediately usable **demo mode**, optional Supabase email sign-in, authenticated live event history, and an ESP32 event-ingestion API.

## Quick start (Vercel)

1. Unzip and upload the project to a GitHub repository (the repository root should contain `package.json`).
2. Vercel > Add New > Project > Import repository > Deploy. Framework is Next.js.
3. Open the deployed URL. With no environment variables it runs **DEMO MODE** with simulated events and functional filters, patient selection, and test-event buttons.

## Local development

```bash
npm install
npm run dev
```

## Activate real data with Supabase

1. Create a Supabase project. Enable Email OTP / Magic Link under Authentication; configure the redirect URL to your Vercel domain in Supabase Auth URL Configuration.
2. Run `supabase-schema.sql` in Supabase SQL Editor.
3. Add Vercel environment variables from `.env.example`. **Never** prefix the service role key with `NEXT_PUBLIC_` and never commit `.env.local`.
4. Redeploy. Sign in with your email; use Supabase Auth Users to find your user UUID.
5. Generate a random ESP32 device key (`openssl rand -hex 32`) and SHA-256 hash (`echo -n 'KEY' | sha256sum`). Add the device record using the SQL insert example at the end of the schema file. Store the raw key privately in ESP32 firmware, NOT the website.
6. ESP32 sends HTTPS POST to `https://YOUR-VERCEL-DOMAIN/api/events`, header `x-device-key: YOUR_SECRET_KEY`, header `content-type: application/json`, and JSON:

```json
{"event_type":"shouting","confidence":0.82,"detail":"AI acoustic event (prototype)"}
```

Supported event_type: `normal_speech`, `background_noise`, `shouting`, `screaming`, `movement`, `emergency`, `device_online`, `device_offline`.

7. Dashboard fetches authenticated events every 10 seconds. Device status is estimated from recent event timestamps, not a confirmed hardware heartbeat. To show online state accurately, send `device_online` heartbeat events regularly (e.g., every 30 seconds).

## Important limitations

- **Prototype, not a medical-grade system.** Synthetic-data accuracy is not evidence of real-world shouting/screaming detection accuracy.
- Demo events are clearly marked simulated. Do not use demo mode for patient care.
- The dashboard is NOT an emergency response service; it has no SMS/push notification integration. Alerts appear in the browser only while the dashboard is open.
- Do not include sensitive patient details in device event `detail` or send audio recordings to this API. Events are metadata only.
- Do not rely on a single AI prediction for safety-critical decisions. Add thresholds, smoothing, false-alarm handling, device disconnect notifications, and real-world validation.
- For a production deployment, add request rate limiting, key rotation, audit logs, device provisioning, and caregiver onboarding.
- ESP32 microphone integration is pending; microphone-free inference output is not a real audio test.
