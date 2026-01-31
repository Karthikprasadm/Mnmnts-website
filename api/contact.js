// Contact Form Endpoint for Vercel Serverless Functions
const nodemailer = require('nodemailer');
const { setCORSHeaders, handleOptions } = require('./utils/cors');
const { successResponse, errorResponse } = require('./utils/response');
const { createRateLimiter } = require('./utils/rateLimit');

function escapeHtml(s) {
  if (typeof s !== 'string') return '';
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

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

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const toEmail = process.env.CONTACT_TO_EMAIL || 'prasadmkarthik@gmail.com';
    const fromEmail = process.env.CONTACT_FROM_EMAIL || toEmail;

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
      return errorResponse(res, 'Contact form is not configured.', 503);
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(smtpPort),
      secure: smtpPort === '465',
      auth: { user: smtpUser, pass: smtpPass }
    });

    const emailSubject = `Contact form: ${sanitizedSubject || '(No subject)'}`;
    const textBody = [
      `Name: ${sanitizedName}`,
      `Email: ${sanitizedEmail}`,
      `Subject: ${sanitizedSubject || '(No subject)'}`,
      '',
      'Message:',
      sanitizedMessage
    ].join('\n');
    const htmlBody = [
      `<p><strong>Name:</strong> ${escapeHtml(sanitizedName)}</p>`,
      `<p><strong>Email:</strong> <a href="mailto:${escapeHtml(sanitizedEmail)}">${escapeHtml(sanitizedEmail)}</a></p>`,
      `<p><strong>Subject:</strong> ${escapeHtml(sanitizedSubject || '(No subject)')}</p>`,
      '<p><strong>Message:</strong></p>',
      `<p>${escapeHtml(sanitizedMessage).replace(/\n/g, '<br>')}</p>`
    ].join('');

    await transporter.sendMail({
      from: fromEmail,
      to: toEmail,
      replyTo: sanitizedEmail,
      subject: emailSubject,
      text: textBody,
      html: htmlBody
    });

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
