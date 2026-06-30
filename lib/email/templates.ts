/**
 * Email template utilities
 * Returns HTML email templates for contractor notifications
 */

const BRAND_COLOR = '#FF6B35'
const SECONDARY_COLOR = '#004E89'
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://cargoplus.com'

function emailWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
    }
    .container {
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, ${BRAND_COLOR} 0%, ${SECONDARY_COLOR} 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .content {
      background: #f9f9f9;
      padding: 30px 20px;
      border: 1px solid #e0e0e0;
    }
    .content p {
      margin: 16px 0;
      color: #555;
    }
    .cta-button {
      display: inline-block;
      background: ${BRAND_COLOR};
      color: white;
      padding: 12px 32px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
      text-align: center;
      border: none;
      cursor: pointer;
    }
    .cta-button:hover {
      background: ${SECONDARY_COLOR};
    }
    .footer {
      background: #f0f0f0;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #999;
      border-radius: 0 0 8px 8px;
      border: 1px solid #e0e0e0;
      border-top: none;
    }
    .footer a {
      color: ${BRAND_COLOR};
      text-decoration: none;
    }
    .footer p {
      margin: 8px 0;
    }
    .highlight {
      color: ${BRAND_COLOR};
      font-weight: 600;
    }
    .section {
      margin: 20px 0;
      padding: 15px;
      background: white;
      border-radius: 6px;
      border-left: 4px solid ${BRAND_COLOR};
    }
  </style>
</head>
<body>
  <div class="container">
    ${content}
  </div>
</body>
</html>
  `
}

/**
 * Confirmation email sent when contractor signs up
 */
export function confirmationEmailTemplate(
  contractorName: string,
  companyName: string
): string {
  return emailWrapper(`
    <div class="header">
      <h1>Welcome to Cargoplus!</h1>
    </div>

    <div class="content">
      <p>Hi <span class="highlight">${escapeHtml(contractorName)}</span>,</p>

      <p>Thank you for applying to join the Cargoplus contractor network! We're excited to review your application for <span class="highlight">${escapeHtml(companyName)}</span>.</p>

      <div class="section">
        <p><strong>What happens next?</strong></p>
        <p>Our team will carefully review your application and verify your credentials. We typically complete this process within <span class="highlight">24 hours</span>.</p>
      </div>

      <p>In the meantime, you can log in to your contractor dashboard to track your application status:</p>

      <center>
        <a href="${BASE_URL}/contractor/dashboard" class="cta-button">View Your Application</a>
      </center>

      <p>If you have any questions, please don't hesitate to reach out to our support team.</p>

      <p>Best regards,<br><span class="highlight">The Cargoplus Team</span></p>
    </div>

    <div class="footer">
      <p>&copy; 2024 Cargoplus. All rights reserved.</p>
      <p>
        <a href="${BASE_URL}/privacy">Privacy Policy</a> |
        <a href="${BASE_URL}/contact">Contact Us</a>
      </p>
    </div>
  `)
}

/**
 * Approval email sent when contractor is approved
 */
export function approvalEmailTemplate(
  contractorName: string,
  companyName: string
): string {
  return emailWrapper(`
    <div class="header">
      <h1>You're Approved! 🎉</h1>
    </div>

    <div class="content">
      <p>Hi <span class="highlight">${escapeHtml(contractorName)}</span>,</p>

      <p>Great news! Your application for <span class="highlight">${escapeHtml(companyName)}</span> has been <span class="highlight">approved</span>.</p>

      <div class="section">
        <p><strong>Welcome to the Cargoplus Network!</strong></p>
        <p>You can now access your full contractor dashboard and start exploring available projects. Your profile is now visible to customers on our platform.</p>
      </div>

      <p>Get started now:</p>

      <center>
        <a href="${BASE_URL}/contractor/dashboard" class="cta-button">Access Your Dashboard</a>
      </center>

      <div class="section">
        <p><strong>Next Steps:</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Complete your company profile</li>
          <li>Upload project photos and certifications</li>
          <li>Set your service areas and rates</li>
          <li>Start bidding on projects</li>
        </ul>
      </div>

      <p>If you have any questions about using the platform, check out our <a href="${BASE_URL}/contractor/help" style="color: ${BRAND_COLOR}; text-decoration: none;">help documentation</a> or contact our support team.</p>

      <p>Best regards,<br><span class="highlight">The Cargoplus Team</span></p>
    </div>

    <div class="footer">
      <p>&copy; 2024 Cargoplus. All rights reserved.</p>
      <p>
        <a href="${BASE_URL}/privacy">Privacy Policy</a> |
        <a href="${BASE_URL}/contact">Contact Us</a>
      </p>
    </div>
  `)
}

/**
 * Rejection email sent when contractor is rejected
 */
export function rejectionEmailTemplate(
  contractorName: string,
  companyName: string,
  rejectionReason?: string
): string {
  return emailWrapper(`
    <div class="header">
      <h1>Application Status Update</h1>
    </div>

    <div class="content">
      <p>Hi <span class="highlight">${escapeHtml(contractorName)}</span>,</p>

      <p>Thank you for applying to join the Cargoplus contractor network. After careful review of your application for <span class="highlight">${escapeHtml(companyName)}</span>, we're unable to approve it at this time.</p>

      ${rejectionReason ? `
      <div class="section">
        <p><strong>Feedback:</strong></p>
        <p>${escapeHtml(rejectionReason)}</p>
      </div>
      ` : ''}

      <p>We encourage you to reach out to our support team if you'd like to discuss your application or if you have any questions about our requirements.</p>

      <center>
        <a href="${BASE_URL}/contact" class="cta-button">Contact Support</a>
      </center>

      <div class="section">
        <p><strong>Want to apply again?</strong></p>
        <p>You're welcome to reapply in the future. If you address the feedback above, we'd be happy to reconsider your application.</p>
      </div>

      <p>Best regards,<br><span class="highlight">The Cargoplus Team</span></p>
    </div>

    <div class="footer">
      <p>&copy; 2024 Cargoplus. All rights reserved.</p>
      <p>
        <a href="${BASE_URL}/privacy">Privacy Policy</a> |
        <a href="${BASE_URL}/contact">Contact Us</a>
      </p>
    </div>
  `)
}

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (char) => map[char])
}
