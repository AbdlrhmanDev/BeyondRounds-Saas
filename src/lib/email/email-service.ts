// @ts-ignore - nodemailer types will be available after npm install
// @ts-ignore - nodemailer types
import nodemailer from 'nodemailer'

interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

interface EmailTemplate {
  subject: string
  html: string
  text: string
}

interface EmailData {
  to: string
  template: EmailTemplate
  data?: Record<string, any>
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null
  private isConfigured = false

  constructor() {
    this.initializeTransporter()
  }

  private initializeTransporter() {
    const config = this.getEmailConfig()
    
    if (!config) {
      console.warn('⚠️ Email service not configured. Set SMTP environment variables to enable email notifications.')
      return
    }

    try {
      this.transporter = nodemailer.createTransporter(config)
      this.isConfigured = true
      console.log('✅ Email service initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error)
    }
  }

  private getEmailConfig(): EmailConfig | null {
    const host = process.env.SMTP_HOST
    const port = process.env.SMTP_PORT
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS

    if (!host || !port || !user || !pass) {
      return null
    }

    return {
      host,
      port: parseInt(port),
      secure: port === '465',
      auth: { user, pass }
    }
  }

  async sendEmail({ to, template, data = {} }: EmailData): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      console.warn('⚠️ Email service not configured, skipping email send')
      return false
    }

    try {
      // Replace template variables
      const processedTemplate = this.processTemplate(template, data)

      const mailOptions = {
        from: process.env.FROM_EMAIL || process.env.SMTP_USER,
        to,
        subject: processedTemplate.subject,
        html: processedTemplate.html,
        text: processedTemplate.text
      }

      const result = await this.transporter.sendMail(mailOptions)
      console.log(`✅ Email sent successfully to ${to}:`, result.messageId)
      return true
    } catch (error) {
      console.error(`❌ Failed to send email to ${to}:`, error)
      return false
    }
  }

  private processTemplate(template: EmailTemplate, data: Record<string, any>): EmailTemplate {
    const processString = (str: string): string => {
      return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return data[key] || match
      })
    }

    return {
      subject: processString(template.subject),
      html: processString(template.html),
      text: processString(template.text)
    }
  }

  // Email Templates
  static getTemplates() {
    return {
      verificationApproved: {
        subject: '🎉 Your Verification Has Been Approved - BeyondRounds',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to BeyondRounds!</h1>
            </div>
            <div style="padding: 30px; background: #f8f9fa;">
              <h2 style="color: #333; margin-bottom: 20px;">Your verification has been approved! 🎉</h2>
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                Hi {{firstName}},
              </p>
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                Great news! Your identity verification has been approved and you now have full access to all BeyondRounds features.
              </p>
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #333; margin-bottom: 15px;">What's next?</h3>
                <ul style="color: #666; line-height: 1.6;">
                  <li>Complete your profile to get better matches</li>
                  <li>Set your availability preferences</li>
                  <li>Wait for your first weekly match (Thursdays at 4 PM)</li>
                </ul>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{appUrl}}/dashboard" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Go to Dashboard
                </a>
              </div>
              <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
                If you have any questions, feel free to reach out to our support team.
              </p>
            </div>
          </div>
        `,
        text: `
          Welcome to BeyondRounds!
          
          Hi {{firstName}},
          
          Great news! Your identity verification has been approved and you now have full access to all BeyondRounds features.
          
          What's next?
          - Complete your profile to get better matches
          - Set your availability preferences  
          - Wait for your first weekly match (Thursdays at 4 PM)
          
          Go to your dashboard: {{appUrl}}/dashboard
          
          If you have any questions, feel free to reach out to our support team.
        `
      },

      verificationRejected: {
        subject: 'Verification Update - BeyondRounds',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #f8f9fa; padding: 30px;">
              <h2 style="color: #333; margin-bottom: 20px;">Verification Update</h2>
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                Hi {{firstName}},
              </p>
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                We've reviewed your verification documents, but unfortunately we couldn't approve them at this time.
              </p>
              <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="color: #856404; margin: 0;">
                  <strong>Reason:</strong> {{rejectionReason}}
                </p>
              </div>
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #333; margin-bottom: 15px;">What you can do:</h3>
                <ul style="color: #666; line-height: 1.6;">
                  <li>Review the requirements and upload new documents</li>
                  <li>Ensure documents are clear and readable</li>
                  <li>Make sure all required documents are included</li>
                </ul>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{appUrl}}/onboarding/verification" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Upload New Documents
                </a>
              </div>
            </div>
          </div>
        `,
        text: `
          Verification Update
          
          Hi {{firstName}},
          
          We've reviewed your verification documents, but unfortunately we couldn't approve them at this time.
          
          Reason: {{rejectionReason}}
          
          What you can do:
          - Review the requirements and upload new documents
          - Ensure documents are clear and readable
          - Make sure all required documents are included
          
          Upload new documents: {{appUrl}}/onboarding/verification
        `
      },

      weeklyMatch: {
        subject: '🎉 You\'ve Been Matched! - BeyondRounds',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">You've Been Matched! 🎉</h1>
            </div>
            <div style="padding: 30px; background: #f8f9fa;">
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                Hi {{firstName}},
              </p>
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                Exciting news! You've been matched with {{memberCount}} other medical professionals in your weekly group.
              </p>
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #333; margin-bottom: 15px;">Your Group: {{groupName}}</h3>
                <p style="color: #666; margin-bottom: 15px;">Group Members:</p>
                <ul style="color: #666; line-height: 1.6;">
                  {{memberList}}
                </ul>
                <p style="color: #999; font-size: 14px; margin-top: 15px;">
                  Compatibility Score: {{compatibilityScore}}%
                </p>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{appUrl}}/messages" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Start Chatting
                </a>
              </div>
              <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
                Your group chat is ready! Head over to start building meaningful connections.
              </p>
            </div>
          </div>
        `,
        text: `
          You've Been Matched! 🎉
          
          Hi {{firstName}},
          
          Exciting news! You've been matched with {{memberCount}} other medical professionals in your weekly group.
          
          Your Group: {{groupName}}
          Group Members:
          {{memberList}}
          
          Compatibility Score: {{compatibilityScore}}%
          
          Start chatting: {{appUrl}}/messages
          
          Your group chat is ready! Head over to start building meaningful connections.
        `
      },

      welcomeEmail: {
        subject: 'Welcome to BeyondRounds - Your Medical Professional Network',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to BeyondRounds!</h1>
            </div>
            <div style="padding: 30px; background: #f8f9fa;">
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                Hi {{firstName}},
              </p>
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                Welcome to BeyondRounds! We're excited to help you build meaningful connections with fellow medical professionals.
              </p>
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #333; margin-bottom: 15px;">Getting Started:</h3>
                <ol style="color: #666; line-height: 1.6;">
                  <li>Complete your profile setup</li>
                  <li>Upload verification documents</li>
                  <li>Set your availability preferences</li>
                  <li>Wait for your first weekly match</li>
                </ol>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{appUrl}}/onboarding" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Complete Setup
                </a>
              </div>
              <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
                Questions? Contact our support team anytime.
              </p>
            </div>
          </div>
        `,
        text: `
          Welcome to BeyondRounds!
          
          Hi {{firstName}},
          
          Welcome to BeyondRounds! We're excited to help you build meaningful connections with fellow medical professionals.
          
          Getting Started:
          1. Complete your profile setup
          2. Upload verification documents
          3. Set your availability preferences
          4. Wait for your first weekly match
          
          Complete setup: {{appUrl}}/onboarding
          
          Questions? Contact our support team anytime.
        `
      }
    }
  }
}

export const emailService = new EmailService()
export default EmailService
