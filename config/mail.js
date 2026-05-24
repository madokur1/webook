const nodemailer = require('nodemailer');

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || '"Dred\'s Transient" <no-reply@dreds.com>';

let transporter = null;

if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });
} else {
  console.warn('SMTP configuration is incomplete. Email delivery is disabled.');
}

const sendMail = async (options) => {
  if (!transporter) {
    throw new Error('Email transporter is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS.');
  }

  const mailOptions = {
    from: SMTP_FROM,
    ...options
  };

  return transporter.sendMail(mailOptions);
};

module.exports = {
  sendMail,
  SMTP_FROM
};
