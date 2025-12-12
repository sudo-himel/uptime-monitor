import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  const TARGET_URL = 'https://digitalshopbd.com';

  try {
    console.log(`Checking ${TARGET_URL}...`);
    
    // 1. Check the website status
    const response = await fetch(TARGET_URL);
    
    // If status is NOT ok (e.g., 404 or 500), or if connection fails
    if (!response.ok) {
      throw new Error(`Status Code: ${response.status} ${response.statusText}`);
    }

    // If we get here, the site is up
    console.log("Site is UP.");
    return res.status(200).json({ status: 'Online', code: response.status });

  } catch (error) {
    console.error("Site is DOWN. Sending email...");
    
    // 2. Prepare the email transporter (using Gmail)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // We will set this in Vercel later
        pass: process.env.EMAIL_PASS, // We will set this in Vercel later
      },
    });

    // 3. Send the email
    try {
      await transporter.sendMail({
        from: `"Uptime Bot" <${process.env.EMAIL_USER}>`,
        to: process.env.ALERT_EMAIL, // The person receiving the alert
        subject: `🚨 ALERT: digitalshopbd.com is DOWN!`,
        text: `The server is not running or unreachable.\n\nError Details: ${error.message}\nTime: ${new Date().toLocaleString()}`,
      });
      console.log("Email sent successfully.");
    } catch (mailError) {
      console.error("Failed to send email:", mailError);
    }

    return res.status(200).json({ status: 'Down', error: error.message });
  }
}