import { createPlugin } from '../plugin-builder';
import type { Plugin } from '@teamflow/types';

/**
 * Email/SMTP Integration Plugin
 * Send emails and manage email communications
 */
export function createEmailPlugin(): Plugin {
  return createPlugin('email-integration', 'Email Integration', '1.0.0')
    .description('Send emails, templates, and manage email communications')
    .author('TeamFlow AI Team')
    .addNode(node => {
      node
        .type('send-email')
        .label('Send Email')
        .description('Send an email via SMTP')
        .icon('📧')
        .category('Communication')
        .addInput('input', 'Flow', 'flow')
        .addOutput('success', 'Success', 'flow')
        .addOutput('error', 'Error', 'flow')
        .config({
          fields: [
            {
              key: 'to',
              label: 'To',
              type: 'text',
              description: 'Recipient email address',
              required: true,
            },
            {
              key: 'cc',
              label: 'CC',
              type: 'text',
              description: 'CC email addresses (comma-separated)',
              required: false,
            },
            {
              key: 'subject',
              label: 'Subject',
              type: 'text',
              description: 'Email subject (supports variables)',
              required: true,
            },
            {
              key: 'body',
              label: 'Body',
              type: 'textarea',
              description: 'Email body (supports variables and HTML)',
              required: true,
            },
            {
              key: 'bodyType',
              label: 'Body Type',
              type: 'select',
              description: 'Email body format',
              required: false,
              default: 'plain',
              options: [
                { label: 'Plain Text', value: 'plain' },
                { label: 'HTML', value: 'html' },
              ],
            },
            {
              key: 'attachments',
              label: 'Attachments',
              type: 'text',
              description: 'File URLs (comma-separated)',
              required: false,
            },
          ],
          values: {},
        })
        .execute(async (context) => {
          const { to, cc, subject, body, bodyType, attachments } = context.config;

          // Resolve variables in subject and body
          let resolvedSubject = subject;
          let resolvedBody = body;
          for (const [key, value] of Object.entries(context.variables)) {
            resolvedSubject = resolvedSubject.replace(`\${${key}}`, String(value));
            resolvedBody = resolvedBody.replace(`\${${key}}`, String(value));
          }

          console.log(`[Email Plugin] Sending email to ${to}`);
          console.log(`Subject: ${resolvedSubject}`);

          // Simulate email sending
          await new Promise(resolve => setTimeout(resolve, 800));

          const attachmentList = attachments ? attachments.split(',').map((a: string) => a.trim()) : [];

          return {
            success: true,
            messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            to,
            cc: cc || undefined,
            subject: resolvedSubject,
            bodyType,
            attachmentCount: attachmentList.length,
            sentAt: new Date().toISOString(),
          };
        });
    })
    .addNode(node => {
      node
        .type('email-template')
        .label('Email Template')
        .description('Use a pre-defined email template')
        .icon('📋')
        .category('Communication')
        .addInput('input', 'Flow', 'flow')
        .addOutput('output', 'Output', 'flow')
        .config({
          fields: [
            {
              key: 'template',
              label: 'Template',
              type: 'select',
              description: 'Select email template',
              required: true,
              options: [
                { label: 'Welcome Email', value: 'welcome' },
                { label: 'Password Reset', value: 'password_reset' },
                { label: 'Task Notification', value: 'task_notification' },
                { label: 'Weekly Report', value: 'weekly_report' },
              ],
            },
            {
              key: 'recipient',
              label: 'Recipient',
              type: 'text',
              description: 'Email address',
              required: true,
            },
            {
              key: 'data',
              label: 'Template Data',
              type: 'text',
              description: 'Variable name containing template data',
              required: false,
            },
          ],
          values: {},
        })
        .execute(async (context) => {
          const { template, recipient, data } = context.config;

          const templateData = data ? context.variables[data] : {};

          // Template definitions
          const templates: Record<string, { subject: string; body: string }> = {
            welcome: {
              subject: 'Welcome to TeamFlow AI!',
              body: `Hi ${templateData.name || 'there'},\n\nWelcome to TeamFlow AI! We're excited to have you on board.`,
            },
            password_reset: {
              subject: 'Password Reset Request',
              body: `Hi ${templateData.name || 'there'},\n\nClick here to reset your password: ${templateData.resetLink || '[link]'}`,
            },
            task_notification: {
              subject: 'New Task Assigned',
              body: `Hi ${templateData.assignee || 'there'},\n\nYou have been assigned a new task: ${templateData.taskTitle || '[task]'}`,
            },
            weekly_report: {
              subject: 'Weekly Report',
              body: `Weekly Summary:\n\nTasks Completed: ${templateData.completedCount || 0}\nTasks In Progress: ${templateData.inProgressCount || 0}`,
            },
          };

          const selectedTemplate = templates[template];

          console.log(`[Email Plugin] Using template: ${template}`);

          await new Promise(resolve => setTimeout(resolve, 500));

          return {
            template,
            recipient,
            subject: selectedTemplate.subject,
            body: selectedTemplate.body,
            ready: true,
          };
        });
    })
    .addNode(node => {
      node
        .type('validate-email')
        .label('Validate Email')
        .description('Check if an email address is valid')
        .icon('✅')
        .category('Utility')
        .addInput('input', 'Flow', 'flow')
        .addOutput('valid', 'Valid', 'flow')
        .addOutput('invalid', 'Invalid', 'flow')
        .config({
          fields: [
            {
              key: 'email',
              label: 'Email Address',
              type: 'text',
              description: 'Email address to validate (supports variables)',
              required: true,
            },
          ],
          values: {},
        })
        .execute(async (context) => {
          let email = context.config.email;

          // Resolve variables
          for (const [key, value] of Object.entries(context.variables)) {
            email = email.replace(`\${${key}}`, String(value));
          }

          // Simple email validation regex
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          const isValid = emailRegex.test(email);

          console.log(`[Email Plugin] Validating email: ${email} - ${isValid ? 'Valid' : 'Invalid'}`);

          return {
            email,
            valid: isValid,
            domain: isValid ? email.split('@')[1] : null,
          };
        });
    })
    .addTool(tool => {
      tool
        .name('send_quick_email')
        .description('Send a quick email notification')
        .stringParam('to', 'Recipient email address', true)
        .stringParam('subject', 'Email subject', true)
        .stringParam('body', 'Email body', true)
        .execute(async (params) => {
          console.log(`[Email Tool] Quick email to ${params.to}`);
          await new Promise(resolve => setTimeout(resolve, 600));
          return {
            sent: true,
            to: params.to,
            messageId: `msg_${Date.now()}`,
          };
        });
    })
    .settings({
      fields: [
        {
          key: 'smtpHost',
          label: 'SMTP Host',
          type: 'text',
          description: 'SMTP server hostname',
          required: true,
        },
        {
          key: 'smtpPort',
          label: 'SMTP Port',
          type: 'number',
          description: 'SMTP server port',
          required: true,
          default: 587,
        },
        {
          key: 'smtpUser',
          label: 'SMTP Username',
          type: 'text',
          description: 'SMTP authentication username',
          required: true,
        },
        {
          key: 'smtpPassword',
          label: 'SMTP Password',
          type: 'text',
          description: 'SMTP authentication password',
          required: true,
        },
        {
          key: 'fromEmail',
          label: 'From Email',
          type: 'text',
          description: 'Default sender email address',
          required: true,
        },
        {
          key: 'fromName',
          label: 'From Name',
          type: 'text',
          description: 'Default sender name',
          required: false,
          default: 'TeamFlow AI',
        },
      ],
      values: {},
    })
    .hooks({
      onInstall: async () => {
        console.log('[Email Plugin] Installed - Configure SMTP settings to start sending emails');
      },
      onEnable: async () => {
        console.log('[Email Plugin] Enabled - Email sending is now available');
      },
      onDisable: async () => {
        console.log('[Email Plugin] Disabled');
      },
    })
    .build();
}
