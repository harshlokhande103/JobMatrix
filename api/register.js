// api/register.js
const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { name, email, phone, source } = req.body || {};

    if (!name || !email || !phone) {
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

    // Verify SMTP config (helps surface clear errors)
    await transporter.verify();

    const mailOptions = {
      from: `"JobMatrix Website" <${process.env.SMTP_USER}>`,
      to: process.env.OWNER_EMAIL,
      subject: 'New JobMatrix Registration',
      text: `
New registration from JobMatrix popup:

Name: ${name}
Email: ${email}
Phone: ${phone}
Source: ${source || 'Not provided'}
      `,
      html: `
        <h2>New JobMatrix Registration</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Source:</strong> ${source || 'Not provided'}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.json({ success: true, message: 'Registration email sent to owner' });
  } catch (err) {
    console.error('Error in /api/register:', err);
    return res.status(500).json({ success: false, message: err.message || 'Error sending email' });
  }
};
