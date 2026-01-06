/**
 * Email Testing Helper Utilities
 *
 * This module provides utilities for testing email flows in E2E tests.
 * Supports multiple email providers for automated email verification.
 *
 * Usage:
 * ```typescript
 * import { EmailTester } from './helpers/email-tester'
 *
 * const tester = new EmailTester({
 *   provider: 'gmail',
 *   email: 'test@example.com',
 *   password: 'app-password'
 * })
 *
 * const email = await tester.waitForEmail({
 *   subject: '【Epackage Lab】メールアドレスのご確認',
 *   timeout: 60000
 * })
 *
 * const link = email.extractLink()
 * await page.goto(link)
 * ```
 */

import { ImapFlow } from 'imapflow'
import { gmail } from 'googleapis'

export interface EmailTesterConfig {
  provider: 'gmail' | 'imap' | 'mailosaur' | 'test'
  email: string
  password?: string
  apiKey?: string // For Mailosaur
  imapHost?: string
  imapPort?: number
}

export interface EmailMessage {
  from: string
  to: string
  subject: string
  text: string
  html: string
  date: Date

  /**
   * Extract confirmation/reset URL from email body
   */
  extractLink(): string | null

  /**
   * Extract verification code from email body
   */
  extractCode(): string | null

  /**
   * Get email text content
   */
  getText(): string
}

export interface WaitForEmailOptions {
  subject?: string | RegExp
  from?: string
  timeout?: number
  contains?: string
}

/**
 * Email Tester Class
 *
 * Main class for testing email flows in E2E tests.
 */
export class EmailTester {
  private config: EmailTesterConfig

  constructor(config: EmailTesterConfig) {
    this.config = config
  }

  /**
   * Wait for email matching criteria
   */
  async waitForEmail(options: WaitForEmailOptions = {}): Promise<EmailMessage> {
    const { provider } = this.config
    const timeout = options.timeout || 60000

    switch (provider) {
      case 'gmail':
        return this.waitForGmail(options)
      case 'imap':
        return this.waitForImap(options)
      case 'mailosaur':
        return this.waitForMailosaur(options)
      case 'test':
        return this.waitForTest(options)
      default:
        throw new Error(`Unsupported provider: ${provider}`)
    }
  }

  /**
   * Wait for email via Gmail API
   */
  private async waitForGmail(
    options: WaitForEmailOptions
  ): Promise<EmailMessage> {
    if (!this.config.password) {
      throw new Error('Gmail OAuth2 token required')
    }

    const auth = new gmail.auth.OAuth2({
      // Configure OAuth2 credentials
      // clientId: process.env.GMAIL_CLIENT_ID,
      // clientSecret: process.env.GMAIL_CLIENT_SECRET,
      // redirectUri: process.env.GMAIL_REDIRECT_URI
    })

    auth.setCredentials({
      access_token: this.config.password,
    })

    const gmailClient = gmail.gmail({ version: 'v1', auth })

    const startTime = Date.now()
    const timeout = options.timeout || 60000

    while (Date.now() - startTime < timeout) {
      const response = await gmailClient.users.messages.list({
        userId: 'me',
        q: this.buildGmailQuery(options),
        maxResults: 1,
      })

      if (response.data.messages && response.data.messages.length > 0) {
        const message = await gmailClient.users.messages.get({
          userId: 'me',
          id: response.data.messages[0].id!,
          format: 'full',
        })

        return this.parseGmailMessage(message.data)
      }

      await this.sleep(2000)
    }

    throw new Error(`Email not received within ${timeout}ms`)
  }

  /**
   * Wait for email via IMAP protocol
   */
  private async waitForImap(
    options: WaitForEmailOptions
  ): Promise<EmailMessage> {
    const host = this.config.imapHost || 'imap.gmail.com'
    const port = this.config.imapPort || 993

    const client = new ImapFlow({
      host,
      port,
      secure: true,
      auth: {
        user: this.config.email,
        pass: this.config.password!,
      },
    })

    await client.connect()

    const startTime = Date.now()
    const timeout = options.timeout || 60000

    while (Date.now() - startTime < timeout) {
      const mailbox = await client.mailboxOpen('INBOX')

      // Search for messages matching criteria
      const searchCriteria = this.buildImapSearch(options)
      const messages = await mailbox.search(searchCriteria)

      if (messages.length > 0) {
        const message = await messages[0].fetch()
        client.logout()
        return this.parseImapMessage(message)
      }

      await this.sleep(2000)
    }

    client.logout()
    throw new Error(`Email not received within ${timeout}ms`)
  }

  /**
   * Wait for email via Mailosaur (testing service)
   */
  private async waitForMailosaur(
    options: WaitForEmailOptions
  ): Promise<EmailMessage> {
    if (!this.config.apiKey) {
      throw new Error('Mailosaur API key required')
    }

    const startTime = Date.now()
    const timeout = options.timeout || 60000

    while (Date.now() - startTime < timeout) {
      const response = await fetch(
        `https://mailosaur.com/api/messages?search=${encodeURIComponent(
          this.config.email
        )}`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(
              `${this.config.apiKey}:`
            ).toString('base64')}`,
          },
        }
      )

      const data = await response.json()

      if (data.items && data.items.length > 0) {
        return this.parseMailosaurMessage(data.items[0])
      }

      await this.sleep(2000)
    }

    throw new Error(`Email not received within ${timeout}ms`)
  }

  /**
   * Mock email tester for development
   */
  private async waitForTest(
    options: WaitForEmailOptions
  ): Promise<EmailMessage> {
    // Return mock email for development testing
    return {
      from: 'noreply@epackage-lab.com',
      to: this.config.email,
      subject: '【Epackage Lab】メールアドレスのご確認',
      text: 'Confirm your email: http://localhost:3000/auth/confirm?token=mock-token',
      html: '<a href="http://localhost:3000/auth/confirm?token=mock-token">Confirm</a>',
      date: new Date(),
      extractLink() {
        const match = this.text.match(/https?:\/\/[^\s]+/)
        return match ? match[0] : null
      },
      extractCode() {
        const match = this.text.match(/\d{6}/)
        return match ? match[0] : null
      },
      getText() {
        return this.text
      },
    }
  }

  /**
   * Build Gmail search query
   */
  private buildGmailQuery(options: WaitForEmailOptions): string {
    const parts = [`to:${this.config.email}`]

    if (options.subject) {
      if (typeof options.subject === 'string') {
        parts.push(`subject:${options.subject}`)
      }
    }

    if (options.from) {
      parts.push(`from:${options.from}`)
    }

    return parts.join(' ')
  }

  /**
   * Build IMAP search criteria
   */
  private buildImapSearch(options: WaitForEmailOptions): any {
    // Build IMAP search criteria based on options
    return {
      to: this.config.email,
      seen: false,
    }
  }

  /**
   * Parse Gmail message into EmailMessage format
   */
  private parseGmailMessage(message: any): EmailMessage {
    const headers = message.payload.headers
    const getHeader = (name: string) =>
      headers.find((h: any) => h.name === name)?.value || ''

    const getText = (payload: any): string => {
      if (payload.body?.data) {
        return Buffer.from(payload.body.data, 'base64').toString('utf-8')
      }
      if (payload.parts) {
        return payload.parts.map(getText).join('\n')
      }
      return ''
    }

    const text = getText(message.payload)

    return {
      from: getHeader('From'),
      to: getHeader('To'),
      subject: getHeader('Subject'),
      text,
      html: text,
      date: new Date(parseInt(message.internalDate) || Date.now()),
      extractLink() {
        const match = this.text.match(/https?:\/\/[^\s<>"{}|\\^`\[\]]+/)
        return match ? match[0] : null
      },
      extractCode() {
        const match = this.text.match(/\b\d{4,}\b|\b[A-Z0-9]{8,}\b/)
        return match ? match[0] : null
      },
      getText() {
        return this.text
      },
    }
  }

  /**
   * Parse IMAP message into EmailMessage format
   */
  private parseImapMessage(message: any): EmailMessage {
    const text = message.text || ''
    const html = message.html || text

    return {
      from: message.from || '',
      to: message.to || '',
      subject: message.subject || '',
      text,
      html,
      date: message.date || new Date(),
      extractLink() {
        const match = this.text.match(/https?:\/\/[^\s<>"{}|\\^`\[\]]+/)
        return match ? match[0] : null
      },
      extractCode() {
        const match = this.text.match(/\b\d{4,}\b|\b[A-Z0-9]{8,}\b/)
        return match ? match[0] : null
      },
      getText() {
        return this.text
      },
    }
  }

  /**
   * Parse Mailosaur message into EmailMessage format
   */
  private parseMailosaurMessage(message: any): EmailMessage {
    const text = message.text?.body || ''
    const html = message.html?.body || text

    return {
      from: message.from?.[0]?.email || '',
      to: message.to?.[0]?.email || '',
      subject: message.subject || '',
      text,
      html,
      date: new Date(message.received || Date.now()),
      extractLink() {
        const match = this.text.match(/https?:\/\/[^\s<>"{}|\\^`\[\]]+/)
        return match ? match[0] : null
      },
      extractCode() {
        const match = this.text.match(/\b\d{4,}\b|\b[A-Z0-9]{8,}\b/)
        return match ? match[0] : null
      },
      getText() {
        return this.text
      },
    }
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Clean up test emails
   */
  async cleanup(): Promise<void> {
    // Implementation depends on provider
    // For Gmail: move to trash or delete
    // For IMAP: delete messages
    // For Mailosaur: delete all messages for server
  }
}

/**
 * Supabase Email Testing Utilities
 *
 * Helper functions specifically for Supabase Auth email testing.
 */
export class SupabaseEmailTester extends EmailTester {
  constructor(config: EmailTesterConfig) {
    super(config)
  }

  /**
   * Wait for confirmation email
   */
  async waitForConfirmationEmail(): Promise<string> {
    const email = await this.waitForEmail({
      subject: /メールアドレスのご確認/,
      from: 'noreply@epackage-lab.com',
      timeout: 60000,
    })

    const link = email.extractLink()
    if (!link) {
      throw new Error('Confirmation link not found in email')
    }

    return link
  }

  /**
   * Wait for password reset email
   */
  async waitForPasswordResetEmail(): Promise<string> {
    const email = await this.waitForEmail({
      subject: /パスワードリセットのご案内/,
      from: 'noreply@epackage-lab.com',
      timeout: 60000,
    })

    const link = email.extractLink()
    if (!link) {
      throw new Error('Reset link not found in email')
    }

    return link
  }

  /**
   * Wait for email change confirmation
   */
  async waitForEmailChangeConfirmation(): Promise<string> {
    const email = await this.waitForEmail({
      subject: /メールアドレス変更のご確認/,
      from: 'noreply@epackage-lab.com',
      timeout: 60000,
    })

    const link = email.extractLink()
    if (!link) {
      throw new Error('Confirmation link not found in email')
    }

    return link
  }
}

/**
 * Configuration for different email providers
 */
export const EmailProviderConfigs = {
  gmail: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
    instructions:
      '1. Create OAuth2 credentials in Google Cloud Console\n2. Enable Gmail API\n3. Use OAuth2 playground or implement OAuth flow',
  },

  mailosaur: {
    signupUrl: 'https://mailosaur.com/',
    instructions:
      '1. Sign up for Mailosaur account\n2. Create server\n3. Get API key from settings\n4. Use server email address for testing',
  },

  imap: {
    instructions:
      '1. Enable IMAP access in email settings\n2. Use app-specific password if 2FA enabled\n3. Configure IMAP host and port',
  },
}

/**
 * Default configurations for common providers
 */
export const DefaultConfigs = {
  gmail: {
    provider: 'gmail' as const,
    imapHost: 'imap.gmail.com',
    imapPort: 993,
  },

  outlook: {
    provider: 'imap' as const,
    imapHost: 'outlook.office365.com',
    imapPort: 993,
  },

  yahoo: {
    provider: 'imap' as const,
    imapHost: 'imap.mail.yahoo.com',
    imapPort: 993,
  },
}
