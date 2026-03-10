import nodemailer from 'nodemailer';

// ─── Email is 100% OPTIONAL ───────────────────────────────────────
// If SMTP credentials are not set, emails are silently skipped.
// The app works perfectly without email — QR pass is shown on-screen.
const SMTP_CONFIGURED = !!(process.env.SMTP_USER && process.env.SMTP_PASS);

const transporter = SMTP_CONFIGURED
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

/** Check if email sending is available */
export const isEmailConfigured = (): boolean => SMTP_CONFIGURED;

interface EventPassEmailData {
  to: string;
  participantName: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  registrationId: string;
  qrCode: string;
}

export const sendEventPassEmail = async (
  data: EventPassEmailData
): Promise<void> => {
  const { to, participantName, eventTitle, eventDate, eventVenue, registrationId, qrCode } = data;

  const qrImageBuffer = Buffer.from(qrCode.split(',')[1] || '', 'base64');

  const mailOptions = {
    from: `"BEC Vortex Event Hub" <${process.env.SMTP_USER}>`,
    to,
    subject: `🎫 Event Pass - ${eventTitle}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f0c29, #302b63, #24243e); color: white; border-radius: 16px; overflow: hidden;">
        <div style="padding: 40px 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; background: linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">BEC Vortex</h1>
          <p style="color: #a5b4fc; font-size: 14px; margin-top: 4px;">Event Hub Pass</p>
        </div>
        <div style="background: rgba(255,255,255,0.08); backdrop-filter: blur(10px); margin: 0 20px; border-radius: 16px; padding: 30px; border: 1px solid rgba(255,255,255,0.1);">
          <h2 style="color: #e0e7ff; margin: 0 0 20px; font-size: 22px;">${eventTitle}</h2>
          <div style="display: grid; gap: 12px; margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
              <span style="color: #94a3b8;">Participant</span>
              <span style="color: #e2e8f0; font-weight: 600;">${participantName}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
              <span style="color: #94a3b8;">Date</span>
              <span style="color: #e2e8f0; font-weight: 600;">${eventDate}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
              <span style="color: #94a3b8;">Venue</span>
              <span style="color: #e2e8f0; font-weight: 600;">${eventVenue}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
              <span style="color: #94a3b8;">Registration ID</span>
              <span style="color: #a78bfa; font-weight: 600; font-family: monospace;">${registrationId}</span>
            </div>
          </div>
          <div style="text-align: center; padding: 20px; background: white; border-radius: 12px;">
            <img src="cid:qrcode" alt="QR Code" style="width: 200px; height: 200px;" />
          </div>
          <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 16px;">Present this QR code at the event venue for entry</p>
        </div>
        <div style="text-align: center; padding: 24px; color: #64748b; font-size: 12px;">
          <p>BEC Vortex Event Hub — Your Campus, Your Events</p>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: 'qrcode.png',
        content: qrImageBuffer,
        cid: 'qrcode',
      },
    ],
  };

  if (!transporter) {
    console.log(`📧 Email skipped (SMTP not configured) — QR pass shown on-screen for ${to}`);
    return;
  }

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Event pass email sent to ${to}`);
  } catch (error) {
    console.error('❌ Email send error (non-blocking):', error);
    // Don't throw — email failure shouldn't block registration
  }
};

export const sendEventNotificationEmail = async (
  to: string,
  eventTitle: string,
  message: string
): Promise<void> => {
  const mailOptions = {
    from: `"BEC Vortex Event Hub" <${process.env.SMTP_USER}>`,
    to,
    subject: `📢 ${eventTitle} — Event Update`,
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: white; padding: 40px; border-radius: 16px;">
        <h1 style="color: #a78bfa;">BEC Vortex</h1>
        <h2 style="color: #e2e8f0;">${eventTitle}</h2>
        <p style="color: #cbd5e1; line-height: 1.6;">${message}</p>
        <a href="${process.env.CLIENT_URL}/events" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">View Events</a>
      </div>
    `,
  };

  if (!transporter) {
    console.log(`📧 Notification email skipped (SMTP not configured) for ${to}`);
    return;
  }

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email notification error (non-blocking):', error);
  }
};
