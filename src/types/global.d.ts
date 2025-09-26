
// Global type declarations for BeyondRounds
declare module 'nodemailer' {
  export interface Transporter {
    sendMail(mailOptions: any): Promise<any>
    verify(): Promise<boolean>
  }
  
  export interface EmailConfig {
    host: string
    port: number
    secure: boolean
    auth: {
      user: string
      pass: string
    }
  }
  
  export function createTransporter(config: EmailConfig): Transporter
}

declare module '@/lib/email/email-service' {
  export const emailService: {
    sendEmail(data: any): Promise<boolean>
    getTemplates(): any
  }
}

// Extend global types
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SMTP_HOST?: string
      SMTP_PORT?: string
      SMTP_USER?: string
      SMTP_PASS?: string
      FROM_EMAIL?: string
      CRON_SECRET?: string
    }
  }
}

export {}
