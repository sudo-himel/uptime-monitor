import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Security Check: prevents random people from triggering your email
  const { secret } = req.query;
  if (secret !== process.env.CRON_SECRET) {
      return res.status(401).send('Unauthorized');
  }

  const TARGET_URL = 'https://digitalshopbd.com';

  try {
    // 1. Check the website
    const response = await fetch(TARGET_URL);
    
    if (!response.ok) {
      throw new Error(`Status Code: ${response.status}`);
    }

    // Site is UP
    return res.status(200).send('Site is Online');

  } catch (error) {
    // Site is DOWN - Prepare Email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    try {
      await transporter.sendMail({
        from: `"Uptime Bot" <${process.env.EMAIL_USER}>`,
        to: process.env.ALERT_EMAIL,
        subject: `🚨 DOWN: digitalshopbd.com`,
        text: `Server unreachable.\nError: ${error.message}`,
      });
      console.log("Alert email sent.");
    } catch (mailError) {
      console.error("Email failed:", mailError);
    }

    return res.status(200).send('Site Down - Alert Sent');
  }
}