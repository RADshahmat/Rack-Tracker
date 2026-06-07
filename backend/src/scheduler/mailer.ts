import nodemailer from 'nodemailer';
import { EmptyRack } from '../modules/warnings/warning.types';

const createTransport = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'localhost',
        port: parseInt(process.env.SMTP_PORT || '1025'),
        secure: false,          // MailHog doesn't use TLS
        ignoreTLS: true,
    });
};

export const sendWarningEmail = async (emptyRacks: EmptyRack[]): Promise<void> => {
    if (!process.env.SMTP_HOST) {
        console.log('[Mailer] SMTP_HOST not set — skipping email');
        return;
    }

    const transport = createTransport();

    const rackList = emptyRacks
        .map((r) => `  - ${r.tag}: ${r.name} (${r.location || 'No location'})`)
        .join('\n');

    await transport.sendMail({
        from: process.env.SMTP_FROM || 'rack-tracker@rack.local',
        to: process.env.SMTP_TO || 'admin@rack.local',
        subject: `[Rack Tracker] ${emptyRacks.length} empty rack(s) detected`,
        text: `
The following racks have no equipment assigned:

${rackList}

Please assign equipment or resolve these warnings in the Rack Tracker dashboard.

Sent by Rack Tracker Scheduler at ${new Date().toISOString()}
        `.trim(),
    });

    console.log(`[Mailer] Warning email sent for ${emptyRacks.length} empty rack(s)`);
};