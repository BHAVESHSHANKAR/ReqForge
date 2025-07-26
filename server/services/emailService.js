const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Email transporter error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

class EmailService {
  // Send workspace invitation email
  static async sendWorkspaceInvitation({ 
    recipientEmail, 
    recipientName, 
    inviterName, 
    workspaceName, 
    invitationLink 
  }) {
    try {
      const mailOptions = {
        from: `"ReqForge - API Knight" <${process.env.EMAIL_FROM}>`,
        to: recipientEmail,
        subject: `🚀 You're invited to collaborate on "${workspaceName}" - ReqForge`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>ReqForge Workspace Invitation</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f9fafb; }
              .container { max-width: 600px; margin: 0 auto; background-color: white; }
              .header { background: linear-gradient(135deg, #000000 0%, #333333 100%); padding: 40px 30px; text-align: center; }
              .logo { color: white; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
              .subtitle { color: #e5e7eb; font-size: 16px; }
              .content { padding: 40px 30px; }
              .invitation-card { background-color: #f9fafb; border: 2px solid #e5e7eb; border-radius: 12px; padding: 30px; margin: 20px 0; text-align: center; }
              .workspace-name { font-size: 24px; font-weight: bold; color: #000000; margin-bottom: 10px; }
              .inviter { color: #6b7280; font-size: 16px; margin-bottom: 20px; }
              .cta-button { display: inline-block; background-color: #000000; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; }
              .cta-button:hover { background-color: #333333; }
              .features { margin: 30px 0; }
              .feature { display: flex; align-items: center; margin: 15px 0; }
              .feature-icon { width: 20px; height: 20px; background-color: #000000; border-radius: 50%; margin-right: 15px; }
              .footer { background-color: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
              .link { color: #000000; text-decoration: none; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">ReqForge</div>
                <div class="subtitle">API Knight Collaboration Platform</div>
              </div>
              
              <div class="content">
                <h1 style="color: #000000; font-size: 28px; margin-bottom: 20px;">You're Invited to Collaborate! 🎉</h1>
                
                <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                  Hi ${recipientName || 'there'},
                </p>
                
                <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                  <strong>${inviterName}</strong> has invited you to collaborate on their ReqForge workspace. 
                  Join the team and start building amazing APIs together!
                </p>
                
                <div class="invitation-card">
                  <div class="workspace-name">${workspaceName}</div>
                  <div class="inviter">Invited by ${inviterName}</div>
                  
                  <a href="${invitationLink}" class="cta-button">
                    🚀 Join Workspace
                  </a>
                </div>
                
                <div class="features">
                  <h3 style="color: #000000; margin-bottom: 20px;">What you can do with API Knight:</h3>
                  <div class="feature">
                    <div class="feature-icon"></div>
                    <span>Collaborate on API testing and documentation</span>
                  </div>
                  <div class="feature">
                    <div class="feature-icon"></div>
                    <span>Share API collections and test results</span>
                  </div>
                  <div class="feature">
                    <div class="feature-icon"></div>
                    <span>Real-time collaboration with team members</span>
                  </div>
                  <div class="feature">
                    <div class="feature-icon"></div>
                    <span>Generate beautiful API documentation</span>
                  </div>
                </div>
                
                <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                  If you don't have a ReqForge account yet, clicking the button above will help you create one.
                </p>
              </div>
              
              <div class="footer">
                <p>This invitation was sent by ${inviterName} via ReqForge API Knight.</p>
                <p>
                  <a href="#" class="link">ReqForge</a> • 
                  <a href="#" class="link">Privacy Policy</a> • 
                  <a href="#" class="link">Terms of Service</a>
                </p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      const result = await transporter.sendMail(mailOptions);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending invitation email:', error);
      return { success: false, error: error.message };
    }
  }

  // Send welcome email after successful account creation
  static async sendWelcomeEmail({ recipientEmail, recipientName }) {
    try {
      const mailOptions = {
        from: `"ReqForge Team" <${process.env.EMAIL_FROM}>`,
        to: recipientEmail,
        subject: `🎉 Welcome to ReqForge - Your API Testing Journey Begins!`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to ReqForge</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f9fafb; }
              .container { max-width: 600px; margin: 0 auto; background-color: white; }
              .header { background: linear-gradient(135deg, #000000 0%, #333333 100%); padding: 40px 30px; text-align: center; }
              .logo { color: white; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
              .subtitle { color: #e5e7eb; font-size: 16px; }
              .content { padding: 40px 30px; }
              .welcome-card { background-color: #f9fafb; border: 2px solid #e5e7eb; border-radius: 12px; padding: 30px; margin: 20px 0; text-align: center; }
              .cta-button { display: inline-block; background-color: #000000; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; }
              .steps { margin: 30px 0; }
              .step { background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 15px 0; }
              .step-number { display: inline-block; background-color: #000000; color: white; width: 30px; height: 30px; border-radius: 50%; text-align: center; line-height: 30px; font-weight: bold; margin-right: 15px; }
              .footer { background-color: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
              .link { color: #000000; text-decoration: none; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">ReqForge</div>
                <div class="subtitle">API Testing & Documentation Platform</div>
              </div>
              
              <div class="content">
                <h1 style="color: #000000; font-size: 28px; margin-bottom: 20px;">Welcome to ReqForge! 🚀</h1>
                
                <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                  Hi ${recipientName},
                </p>
                
                <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                  Congratulations! Your ReqForge account has been successfully created. 
                  You're now ready to start testing APIs and generating documentation like a pro.
                </p>
                
                <div class="welcome-card">
                  <h2 style="color: #000000; margin-bottom: 15px;">🎉 Account Created Successfully!</h2>
                  <p style="color: #6b7280; margin-bottom: 20px;">
                    Welcome to the community of developers building better APIs
                  </p>
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" class="cta-button">
                    🚀 Go to Dashboard
                  </a>
                </div>
                
                <div class="steps">
                  <h3 style="color: #000000; margin-bottom: 20px;">Get started in 3 easy steps:</h3>
                  
                  <div class="step">
                    <span class="step-number">1</span>
                    <strong>Create your first workspace</strong> - Organize your API projects
                  </div>
                  
                  <div class="step">
                    <span class="step-number">2</span>
                    <strong>Test your APIs</strong> - Use our Postman-like interface
                  </div>
                  
                  <div class="step">
                    <span class="step-number">3</span>
                    <strong>Generate documentation</strong> - Share with your team automatically
                  </div>
                </div>
                
                <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-top: 30px;">
                  Need help getting started? Check out our documentation or reach out to our support team.
                </p>
              </div>
              
              <div class="footer">
                <p>Thanks for joining ReqForge! We're excited to see what you'll build.</p>
                <p>
                  <a href="#" class="link">Documentation</a> • 
                  <a href="#" class="link">Support</a> • 
                  <a href="#" class="link">Community</a>
                </p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      const result = await transporter.sendMail(mailOptions);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = EmailService;