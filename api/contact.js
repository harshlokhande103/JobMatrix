// api/contact.js
const nodemailer = require('nodemailer');

// Helper to read raw request body when req.body is undefined
async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const body = await readJsonBody(req);
    const { name, email, phone, message, source } = body || {};

    if (!name || !email || !phone || !message) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.verify();

    const mailOptions = {
      from: `"JobMatrix Website" <${process.env.SMTP_USER}>`,
      to: process.env.OWNER_EMAIL,
      subject: 'New Contact Message - JobMatrix',
      text: `
New contact message from JobMatrix:

Name: ${name}
Email: ${email}
Phone: ${phone}
Message: ${message}
Source: ${source || 'Contact Form'}
      `,
      html: `
        <h2>New Contact Message - JobMatrix</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong><br/>${(message || '').replace(/\n/g, '<br/>')}</p>
        <p><strong>Source:</strong> ${source || 'Contact Form'}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.json({ success: true, message: 'Contact message emailed to owner' });
  } catch (err) {
    console.error('Error in /api/contact:', err);
    return res.status(500).json({ success: false, message: err.message || 'Error sending email' });
  }
};
