import { createPlugin } from '../plugin-builder';
import type { Plugin } from '@teamflow/types';

/**
 * Slack Integration Plugin
 * Adds Slack messaging capabilities to workflows
 */
export function createSlackPlugin(): Plugin {
  return createPlugin('slack-integration', 'Slack Integration', '1.0.0')
    .description('Send messages and notifications to Slack channels')
    .author('TeamFlow AI Team')
    .addNode(node => {
      node
        .type('slack-message')
        .label('Send Slack Message')
        .description('Send a message to a Slack channel')
        .icon('💬')
        .category('Communication')
        .addInput('input', 'Flow', 'flow')
        .addOutput('success', 'Success', 'flow')
        .addOutput('error', 'Error', 'flow')
        .config({
          fields: [
            {
              key: 'channel',
              label: 'Channel',
              type: 'text',
              description: 'Slack channel name or ID',
              required: true,
            },
            {
              key: 'message',
              label: 'Message',
              type: 'textarea',
              description: 'Message text (supports variables)',
              required: true,
            },
            {
              key: 'username',
              label: 'Bot Username',
              type: 'text',
              description: 'Display name for the bot',
              required: false,
              default: 'TeamFlow Bot',
            },
            {
              key: 'icon_emoji',
              label: 'Bot Icon',
              type: 'text',
              description: 'Emoji to use as bot icon',
              required: false,
              default: ':robot_face:',
            },
          ],
          values: {},
        })
        .execute(async (context) => {
          const { channel, message, username, icon_emoji } = context.config;

          // Resolve variables in message
          let resolvedMessage = message;
          for (const [key, value] of Object.entries(context.variables)) {
            resolvedMessage = resolvedMessage.replace(`\${${key}}`, String(value));
          }

          try {
            // In a real implementation, this would call the Slack API
            // For now, we'll simulate it
            console.log(`[Slack Plugin] Sending message to ${channel}:`, resolvedMessage);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));

            return {
              success: true,
              channel,
              message: resolvedMessage,
              timestamp: new Date().toISOString(),
            };
          } catch (error) {
            throw new Error(`Failed to send Slack message: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        });
    })
    .addNode(node => {
      node
        .type('slack-reaction')
        .label('Add Slack Reaction')
        .description('Add a reaction emoji to a Slack message')
        .icon('👍')
        .category('Communication')
        .addInput('input', 'Flow', 'flow')
        .addOutput('success', 'Success', 'flow')
        .addOutput('error', 'Error', 'flow')
        .config({
          fields: [
            {
              key: 'channel',
              label: 'Channel',
              type: 'text',
              description: 'Slack channel name or ID',
              required: true,
            },
            {
              key: 'timestamp',
              label: 'Message Timestamp',
              type: 'text',
              description: 'Timestamp of the message to react to',
              required: true,
            },
            {
              key: 'emoji',
              label: 'Emoji',
              type: 'text',
              description: 'Emoji name (without colons)',
              required: true,
              default: 'thumbsup',
            },
          ],
          values: {},
        })
        .execute(async (context) => {
          const { channel, timestamp, emoji } = context.config;

          console.log(`[Slack Plugin] Adding reaction :${emoji}: to message in ${channel}`);

          await new Promise(resolve => setTimeout(resolve, 300));

          return {
            success: true,
            channel,
            timestamp,
            emoji,
          };
        });
    })
    .addTool(tool => {
      tool
        .name('send_slack_notification')
        .description('Send a quick notification to a Slack channel')
        .stringParam('channel', 'Slack channel name or ID', true)
        .stringParam('message', 'Notification message', true)
        .execute(async (params) => {
          console.log(`[Slack Tool] Notification to ${params.channel}:`, params.message);
          await new Promise(resolve => setTimeout(resolve, 300));
          return { sent: true, channel: params.channel };
        });
    })
    .settings({
      fields: [
        {
          key: 'webhookUrl',
          label: 'Slack Webhook URL',
          type: 'text',
          description: 'Your Slack incoming webhook URL',
          required: true,
        },
        {
          key: 'defaultChannel',
          label: 'Default Channel',
          type: 'text',
          description: 'Default channel for messages',
          required: false,
          default: '#general',
        },
      ],
      values: {},
    })
    .hooks({
      onInstall: async () => {
        console.log('[Slack Plugin] Installed');
      },
      onEnable: async () => {
        console.log('[Slack Plugin] Enabled');
      },
      onDisable: async () => {
        console.log('[Slack Plugin] Disabled');
      },
      onUninstall: async () => {
        console.log('[Slack Plugin] Uninstalled');
      },
    })
    .build();
}
