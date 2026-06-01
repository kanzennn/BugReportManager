import nodemailer from 'nodemailer'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function isConfigured(): boolean {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
}

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export async function sendInvitationEmail({
  to,
  inviterName,
  appName,
  role,
  invitationLink,
}: {
  to: string
  inviterName: string
  appName: string
  role: string
  invitationLink: string
}): Promise<void> {
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#18181b;border:1px solid #27272a;border-radius:12px;overflow:hidden;">
        <tr>
          <td style="background:#4f46e5;padding:24px 32px;">
            <p style="margin:0;font-size:20px;font-weight:700;color:#fff;">BugReport Manager</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <h2 style="margin:0 0 8px;font-size:18px;font-weight:600;color:#f4f4f5;">
              You've been invited to <span style="color:#818cf8;">${esc(appName)}</span>
            </h2>
            <p style="margin:0 0 24px;font-size:14px;color:#a1a1aa;">
              <strong style="color:#d4d4d8;">${esc(inviterName)}</strong> has invited you to collaborate on
              <strong style="color:#d4d4d8;">${esc(appName)}</strong> as a <strong style="color:#d4d4d8;">${esc(roleLabel)}</strong>.
            </p>
            <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
              <tr>
                <td style="background:#27272a;border-radius:6px;padding:8px 12px;font-size:13px;color:#a1a1aa;">
                  Role: <strong style="color:#818cf8;">${esc(roleLabel)}</strong>
                </td>
              </tr>
            </table>
            <a href="${esc(invitationLink)}"
               style="display:inline-block;background:#4f46e5;color:#fff;font-size:14px;font-weight:600;padding:12px 24px;border-radius:8px;text-decoration:none;">
              Accept Invitation →
            </a>
            <p style="margin:24px 0 0;font-size:12px;color:#52525b;">
              This invitation expires in 7 days. If you did not expect this email, you can safely ignore it.
            </p>
            <p style="margin:8px 0 0;font-size:12px;color:#3f3f46;word-break:break-all;">
              ${esc(invitationLink)}
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  if (!isConfigured()) {
    console.log(`\n[DEV] Invitation email (SMTP not configured)\nTo: ${to}\nLink: ${invitationLink}\n`)
    return
  }

  await createTransport().sendMail({
    from: process.env.SMTP_FROM ?? `"BugReport Manager" <${process.env.SMTP_USER}>`,
    to,
    subject: `${inviterName} invited you to ${appName} on BugReport Manager`,
    html,
  })
}

export async function sendPasswordResetEmail({ to, resetToken }: { to: string; resetToken: string }): Promise<void> {
  const resetLink = `${BASE_URL}/reset-password?token=${resetToken}`
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#18181b;border:1px solid #27272a;border-radius:12px;overflow:hidden;">
        <tr><td style="background:#4f46e5;padding:24px 32px;">
          <p style="margin:0;font-size:20px;font-weight:700;color:#fff;">BugReport Manager</p>
        </td></tr>
        <tr><td style="padding:32px;">
          <h2 style="margin:0 0 8px;font-size:18px;font-weight:600;color:#f4f4f5;">Reset your password</h2>
          <p style="margin:0 0 24px;font-size:14px;color:#a1a1aa;">
            Click the button below to set a new password. This link expires in <strong style="color:#d4d4d8;">1 hour</strong>.
          </p>
          <a href="${resetLink}"
             style="display:inline-block;background:#4f46e5;color:#fff;font-size:14px;font-weight:600;padding:12px 24px;border-radius:8px;text-decoration:none;">
            Reset password →
          </a>
          <p style="margin:24px 0 0;font-size:12px;color:#52525b;">
            If you did not request a password reset, you can safely ignore this email.
          </p>
          <p style="margin:8px 0 0;font-size:12px;color:#3f3f46;word-break:break-all;">${resetLink}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  if (!isConfigured()) {
    console.log(`\n[DEV] Password reset email (SMTP not configured)\nTo: ${to}\nLink: ${resetLink}\n`)
    return
  }

  await createTransport().sendMail({
    from: process.env.SMTP_FROM ?? `"BugReport Manager" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Reset your BugReport Manager password',
    html,
  })
}

export async function sendBugStatusEmail({
  to,
  bugTitle,
  newStatus,
  bugId,
}: {
  to: string
  bugTitle: string
  newStatus: string
  bugId: string
}): Promise<void> {
  const STATUS_LABEL: Record<string, string> = {
    IN_PROGRESS: 'In Progress',
    RESOLVED: 'Resolved',
    CLOSED: 'Closed',
    OPEN: 'Reopened',
  }
  const STATUS_COLOR: Record<string, string> = {
    IN_PROGRESS: '#ca8a04',
    RESOLVED: '#16a34a',
    CLOSED: '#52525b',
    OPEN: '#dc2626',
  }
  const label = STATUS_LABEL[newStatus] ?? newStatus
  const color = STATUS_COLOR[newStatus] ?? '#4f46e5'
  const bugLink = `${BASE_URL}/dashboard/bugs/${bugId}`

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#18181b;border:1px solid #27272a;border-radius:12px;overflow:hidden;">
        <tr><td style="background:#4f46e5;padding:24px 32px;">
          <p style="margin:0;font-size:20px;font-weight:700;color:#fff;">BugReport Manager</p>
        </td></tr>
        <tr><td style="padding:32px;">
          <h2 style="margin:0 0 8px;font-size:18px;font-weight:600;color:#f4f4f5;">Bug report status updated</h2>
          <p style="margin:0 0 16px;font-size:14px;color:#a1a1aa;">
            Your bug report <strong style="color:#d4d4d8;">"${esc(bugTitle)}"</strong> has been updated.
          </p>
          <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
            <tr>
              <td style="background:#27272a;border-radius:6px;padding:8px 12px;font-size:13px;color:#a1a1aa;">
                New status: <strong style="color:${esc(color)};">${esc(label)}</strong>
              </td>
            </tr>
          </table>
          <a href="${esc(bugLink)}"
             style="display:inline-block;background:#4f46e5;color:#fff;font-size:14px;font-weight:600;padding:12px 24px;border-radius:8px;text-decoration:none;">
            View bug report →
          </a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  if (!isConfigured()) {
    console.log(`\n[DEV] Bug status email (SMTP not configured)\nTo: ${to}\nBug: ${bugTitle} → ${label}\n`)
    return
  }

  await createTransport().sendMail({
    from: process.env.SMTP_FROM ?? `"BugReport Manager" <${process.env.SMTP_USER}>`,
    to,
    subject: `Bug report "${bugTitle}" is now ${label}`,
    html,
  })
}
