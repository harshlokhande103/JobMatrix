// server.js

const express = require('express');
const path = require('path');
const cors = require('cors');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

app.use('/images', express.static(path.join(__dirname, 'images')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/about.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'about.html'));
});

app.get('/contact.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'contact.html'));
});

app.get('/Untitled video - Made with Clipchamp.mp4', (req, res) => {
  res.sendFile(path.join(__dirname, 'Untitled video - Made with Clipchamp.mp4'));
});

// POST /api/register  -> popup form se data aayega
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, phone, source } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false, // 587 ke liye false; 465 use karoge to true
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Email content
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

    // send email
    await transporter.sendMail(mailOptions);

    return res.json({ success: true, message: 'Registration email sent to owner' });
  } catch (err) {
    console.error('Error in /api/register:', err);
    return res.status(500).json({ success: false, message: 'Error sending email' });
  }
});

// POST /api/contact  -> contact page form
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, message, source } = req.body || {};

    if (!name || !email || !phone || !message) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

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
    return res.status(500).json({ success: false, message: 'Error sending email' });
  }
});

// server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`JobMatrix server running on port ${PORT}`);
});
