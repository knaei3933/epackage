import http from 'node:http';
import { timingSafeEqual } from 'node:crypto';
import nodemailer from 'nodemailer';

const port = Number(process.env.PORT || 8788);
const host = process.env.HOST || '127.0.0.1';
const relayKey = process.env.EMAIL_RELAY_API_KEY;
const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER;
const smtpPassword = process.env.SMTP_PASSWORD;
const fromEmail = process.env.FROM_EMAIL || smtpUser;
const appUrl = (process.env.APP_URL || 'https://www.package-lab.com').replace(/\/+$/, '');

if (!relayKey || !smtpHost || !smtpUser || !smtpPassword) {
  console.error('email relay configuration incomplete');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: { user: smtpUser, pass: smtpPassword },
  tls: { rejectUnauthorized: false },
});

const safeEqual = (left, right) => {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
};

const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const rows = (values) => values
  .filter(([, value]) => value !== undefined && value !== null && value !== '')
  .map(([label, value]) => `
    <tr><th>${escapeHtml(label)}</th><td style="white-space:pre-wrap;">${escapeHtml(value)}</td></tr>
  `)
  .join('');

const send = (to, subject, text, html, replyTo) => transporter.sendMail({
  from: fromEmail,
  to,
  subject,
  text,
  html,
  ...(replyTo ? { replyTo } : {}),
});

const server = http.createServer(async (request, response) => {
  if (request.method === 'GET' && request.url === '/health') {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  if (request.method !== 'POST' || request.url !== '/send') {
    response.writeHead(404, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ error: 'not_found' }));
    return;
  }

  const authorization = request.headers.authorization || '';
  const expected = `Bearer ${relayKey}`;
  if (authorization.length !== expected.length || !safeEqual(authorization, expected)) {
    response.writeHead(401, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ error: 'unauthorized' }));
    return;
  }

  let body = '';
  let tooLarge = false;
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 65536) {
      tooLarge = true;
      break;
    }
  }
  if (tooLarge) {
    response.writeHead(413, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ error: 'request_too_large' }));
    return;
  }

  let payload;
  try {
    payload = JSON.parse(body);
  } catch {
    response.writeHead(400, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ error: 'invalid_json' }));
    return;
  }

  const { leadId, intent, routeFamily, requirements, contact, appUrl } = payload;
  if (
    typeof leadId !== 'string' ||
    typeof intent !== 'string' ||
    typeof routeFamily !== 'string' ||
    typeof requirements !== 'object' ||
    typeof contact !== 'object'
  ) {
    response.writeHead(400, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ error: 'invalid_payload' }));
    return;
  }

  const valueRows = [
    ['リード ID', leadId],
    ['相談種別', intent],
    ['ページ', routeFamily],
    ['内容・用途', requirements.contentsDescription],
    ['数量', requirements.quantityDescription],
    ['サイズ・状態', requirements.sizeSpecState],
    ['素材・印刷', requirements.materialPrintingNeeds],
    ['希望時期', requirements.deadlineText],
  ];

  const staffRows = [
    ...valueRows,
    ['連絡方法', contact.channel],
    ['メールアドレス', contact.email],
    ['電話番号', contact.phone],
    ['会社名', contact.companyName],
    ['お名前', contact.contactName],
    ['希望連絡方法', contact.preferredChannel],
    ['連絡可能時間', contact.contactWindow],
  ];
  const staffUrl = `${appUrl}/admin/leads`;

  const adminText = [
    '新しいチャット相談リードが保存されました。',
    ...staffRows.map(([label, value]) => value ? `${label}: ${value}` : ''),
    staffUrl,
  ].filter(Boolean).join('\n');
  const adminHtml = `<p>新しいチャット相談リードが保存されました。</p><table>${rows(staffRows)}</table><p><a href="${staffUrl}">管理画面で確認</a></p>`;

  const customerText = [
    'お問い合わせありがとうございます。',
    '担当者が確認のうえ、ご希望の連絡方法にてご連絡いたします。',
    ...valueRows.slice(3).map(([label, value]) => value ? `${label}: ${value}` : ''),
  ].join('\n');
  const customerHtml = `<p>お問い合わせありがとうございます。</p><p>担当者が確認のうえ、ご希望の連絡方法にてご連絡いたします。</p><table>${rows(valueRows.slice(3))}</table>`;

  const [adminResult, customerResult] = await Promise.allSettled([
    send(process.env.ADMIN_EMAIL, '【Epackage Lab】新しいチャット相談リード', adminText, adminHtml, contact.email),
    contact.channel === 'email' && contact.email
      ? send(contact.email, '【Epackage Lab】相談内容を受け付けました', customerText, customerHtml)
      : Promise.resolve(null),
  ]);

  const adminOk = adminResult.status === 'fulfilled';
  const customerAttempted = Boolean(contact.channel === 'email' && contact.email);
  const customerOk = customerResult.status === 'fulfilled';

  console.log(JSON.stringify({
    event: 'lead_email_relay',
    leadId,
    adminSent: adminOk,
    customerAttempted,
    customerSent: !customerAttempted || customerOk,
  }));

  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify({
    accepted: adminOk && (!customerAttempted || customerOk),
    adminSent: adminOk,
    customerAttempted,
    customerSent: !customerAttempted || customerOk,
  }));
});

server.listen(port, host, () => {
  console.log(`email relay listening on http://${host}:${port}`);
});
