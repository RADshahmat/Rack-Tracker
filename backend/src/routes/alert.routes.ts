import { Router, Request, Response } from 'express';
import { AlertManagerPayload } from '../modules/alerts/alert.types';

const router = Router();

// Public — AlertManager POSTs here, no auth
// ⚠️ Only accept from internal network (Docker bridge)
// Not exposed to the public internet in production
router.post('/webhook', (req: Request, res: Response) => {
    const payload = req.body as AlertManagerPayload;

    // Log to stdout — visible in `docker compose logs backend`
    console.log('─────────────────────────────────────────');
    console.log(`[AlertManager] Status: ${payload.status.toUpperCase()}`);
    console.log(`[AlertManager] Receiver: ${payload.receiver}`);
    console.log(`[AlertManager] Group: ${JSON.stringify(payload.groupLabels)}`);
    console.log(`[AlertManager] Alerts: ${payload.alerts.length}`);

    payload.alerts.forEach((alert, i) => {
        console.log(`\n  [${i + 1}] ${alert.labels.alertname}`);
        console.log(`      Status:   ${alert.status}`);
        console.log(`      Severity: ${alert.labels.severity}`);
        console.log(`      Summary:  ${alert.annotations.summary}`);
        console.log(`      Description: ${alert.annotations.description}`);
        console.log(`      Started:  ${alert.startsAt}`);
        if (alert.status === 'resolved') {
            console.log(`      Resolved: ${alert.endsAt}`);
        }
    });

    console.log('─────────────────────────────────────────');

    // Always return 200 — AlertManager retries on non-2xx
    res.status(200).json({ success: true, message: 'Alert received' });
});

export default router;