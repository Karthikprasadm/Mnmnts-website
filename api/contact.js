// Contact Form Endpoint for Vercel Serverless Functions
const { setCORSHeaders, handleOptions } = require('./utils/cors');
const { successResponse, errorResponse } = require('./utils/response');
const { createRateLimiter } = require('./utils/rateLimit');

// Rate limiter for contact endpoint (more restrictive to prevent spam)
const contactRateLimiter = createRateLimiter({
  windowMs: 60000, // 1 minute
  max: 5, // 5 contact requests per minute
  message: 'Too many contact requests. Please try again in a minute.'
});

module.exports = async (req, res) => {
  setCORSHeaders(req, res);

  if (req.method === 'OPTIONS') {
    handleOptions(req, res);
    return;
  }

  // Apply rate limiting
  contactRateLimiter(req, res, () => {});
  
  // Check if rate limit was exceeded (429 status set)
  if (res.statusCode === 429) {
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return errorResponse(res, 'Method not allowed. Only POST requests are supported.', 405);
  }

  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return errorResponse(res, 'Missing required fields: name, email, and message are required.', 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse(res, 'Invalid email address format.', 400);
    }

    // Validate field lengths
    if (name.trim().length < 2 || name.trim().length > 100) {
      return errorResponse(res, 'Name must be between 2 and 100 characters.', 400);
    }

    if (message.trim().length < 10 || message.trim().length > 5000) {
      return errorResponse(res, 'Message must be between 10 and 5000 characters.', 400);
    }

    if (subject && subject.trim().length > 200) {
      return errorResponse(res, 'Subject must be less than 200 characters.', 400);
    }

    // Sanitize inputs
    const sanitizedName = name.trim().substring(0, 100);
    const sanitizedEmail = email.trim().toLowerCase().substring(0, 254);
    const sanitizedSubject = subject ? subject.trim().substring(0, 200) : '';
    const sanitizedMessage = message.trim().substring(0, 5000);

    // TODO: Implement email sending here
    // Options:
    // 1. Use nodemailer with SMTP (Gmail, SendGrid, etc.)
    // 2. Use a service like Resend, SendGrid, or Mailgun
    // 3. Store in database and send via cron job
    
    // For now, log the contact form submission (in production, you'd send an email)
    console.log('📧 Contact Form Submission:');
    console.log('Name:', sanitizedName);
    console.log('Email:', sanitizedEmail);
    console.log('Subject:', sanitizedSubject || '(No subject)');
    console.log('Message:', sanitizedMessage);
    console.log('Timestamp:', new Date().toISOString());
    console.log('---');

    // In production, you would send an email here
    // Example with nodemailer:
    // const nodemailer = require('nodemailer');
    // const transporter = nodemailer.createTransport({
    //   host: process.env.SMTP_HOST,
    //   port: process.env.SMTP_PORT,
    //   secure: true,
    //   auth: {
    //     user: process.env.SMTP_USER,
    //     pass: process.env.SMTP_PASS
    //   }
    // });
    // await transporter.sendMail({
    //   from: process.env.CONTACT_FROM_EMAIL,
    //   to: process.env.CONTACT_TO_EMAIL,
    //   subject: `Contact Form: ${sanitizedSubject || 'No Subject'}`,
    //   text: `Name: ${sanitizedName}\nEmail: ${sanitizedEmail}\n\nMessage:\n${sanitizedMessage}`,
    //   html: `<p><strong>Name:</strong> ${sanitizedName}</p><p><strong>Email:</strong> ${sanitizedEmail}</p><p><strong>Message:</strong></p><p>${sanitizedMessage.replace(/\n/g, '<br>')}</p>`
    // });

    return successResponse(res, {
      message: 'Message sent successfully! I\'ll get back to you soon.'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return errorResponse(res, 
      process.env.NODE_ENV === 'production'
        ? 'Failed to send message. Please try again later.'
        : `Internal server error: ${error.message}`,
      500
    );
  }
};
