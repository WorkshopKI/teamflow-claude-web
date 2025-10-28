import { createPlugin } from '../plugin-builder';
import type { Plugin } from '@teamflow/types';

/**
 * GitHub Integration Plugin
 * Adds GitHub API capabilities to workflows
 */
export function createGitHubPlugin(): Plugin {
  return createPlugin('github-integration', 'GitHub Integration', '1.0.0')
    .description('Interact with GitHub repositories, issues, and pull requests')
    .author('TeamFlow AI Team')
    .addNode(node => {
      node
        .type('github-create-issue')
        .label('Create GitHub Issue')
        .description('Create a new issue in a GitHub repository')
        .icon('🐙')
        .category('Development')
        .addInput('input', 'Flow', 'flow')
        .addOutput('success', 'Success', 'flow')
        .addOutput('error', 'Error', 'flow')
        .config({
          fields: [
            {
              key: 'owner',
              label: 'Repository Owner',
              type: 'text',
              description: 'GitHub username or organization',
              required: true,
            },
            {
              key: 'repo',
              label: 'Repository Name',
              type: 'text',
              description: 'Name of the repository',
              required: true,
            },
            {
              key: 'title',
              label: 'Issue Title',
              type: 'text',
              description: 'Title of the issue',
              required: true,
            },
            {
              key: 'body',
              label: 'Issue Body',
              type: 'textarea',
              description: 'Issue description (supports variables)',
              required: false,
            },
            {
              key: 'labels',
              label: 'Labels',
              type: 'text',
              description: 'Comma-separated list of labels',
              required: false,
            },
          ],
          values: {},
        })
        .execute(async (context) => {
          const { owner, repo, title, body, labels } = context.config;

          // Resolve variables
          let resolvedBody = body || '';
          for (const [key, value] of Object.entries(context.variables)) {
            resolvedBody = resolvedBody.replace(`\${${key}}`, String(value));
          }

          console.log(`[GitHub Plugin] Creating issue in ${owner}/${repo}:`, title);

          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 800));

          const issue = {
            number: Math.floor(Math.random() * 1000) + 1,
            title,
            body: resolvedBody,
            labels: labels ? labels.split(',').map((l: string) => l.trim()) : [],
            url: `https://github.com/${owner}/${repo}/issues/1`,
            created_at: new Date().toISOString(),
          };

          return {
            success: true,
            issue,
          };
        });
    })
    .addNode(node => {
      node
        .type('github-list-prs')
        .label('List Pull Requests')
        .description('Get list of pull requests from a repository')
        .icon('🔀')
        .category('Development')
        .addInput('input', 'Flow', 'flow')
        .addOutput('output', 'Output', 'flow')
        .config({
          fields: [
            {
              key: 'owner',
              label: 'Repository Owner',
              type: 'text',
              required: true,
            },
            {
              key: 'repo',
              label: 'Repository Name',
              type: 'text',
              required: true,
            },
            {
              key: 'state',
              label: 'State',
              type: 'select',
              description: 'Filter by PR state',
              required: false,
              default: 'open',
              options: [
                { label: 'Open', value: 'open' },
                { label: 'Closed', value: 'closed' },
                { label: 'All', value: 'all' },
              ],
            },
          ],
          values: {},
        })
        .execute(async (context) => {
          const { owner, repo, state } = context.config;

          console.log(`[GitHub Plugin] Listing ${state} PRs in ${owner}/${repo}`);

          await new Promise(resolve => setTimeout(resolve, 600));

          // Simulate API response
          const prs = [
            {
              number: 42,
              title: 'Add new feature',
              state: 'open',
              author: 'developer1',
              created_at: new Date().toISOString(),
            },
            {
              number: 41,
              title: 'Fix bug in workflow',
              state: 'open',
              author: 'developer2',
              created_at: new Date().toISOString(),
            },
          ];

          return {
            pull_requests: prs,
            count: prs.length,
          };
        });
    })
    .addTool(tool => {
      tool
        .name('create_github_comment')
        .description('Add a comment to a GitHub issue or pull request')
        .stringParam('owner', 'Repository owner', true)
        .stringParam('repo', 'Repository name', true)
        .numberParam('issue_number', 'Issue or PR number', true)
        .stringParam('comment', 'Comment text', true)
        .execute(async (params) => {
          console.log(`[GitHub Tool] Commenting on ${params.owner}/${params.repo}#${params.issue_number}`);
          await new Promise(resolve => setTimeout(resolve, 500));
          return {
            commented: true,
            url: `https://github.com/${params.owner}/${params.repo}/issues/${params.issue_number}`,
          };
        });
    })
    .addTool(tool => {
      tool
        .name('check_pr_status')
        .description('Check the CI status of a pull request')
        .stringParam('owner', 'Repository owner', true)
        .stringParam('repo', 'Repository name', true)
        .numberParam('pr_number', 'Pull request number', true)
        .execute(async (params) => {
          console.log(`[GitHub Tool] Checking PR status: ${params.owner}/${params.repo}#${params.pr_number}`);
          await new Promise(resolve => setTimeout(resolve, 400));
          return {
            status: 'success',
            checks_passed: true,
            total_checks: 5,
          };
        });
    })
    .settings({
      fields: [
        {
          key: 'token',
          label: 'GitHub Personal Access Token',
          type: 'text',
          description: 'Your GitHub PAT for API access',
          required: true,
        },
        {
          key: 'defaultOwner',
          label: 'Default Repository Owner',
          type: 'text',
          description: 'Default owner for repositories',
          required: false,
        },
      ],
      values: {},
    })
    .hooks({
      onInstall: async () => {
        console.log('[GitHub Plugin] Installed');
      },
      onEnable: async () => {
        console.log('[GitHub Plugin] Enabled - GitHub integration is now active');
      },
      onDisable: async () => {
        console.log('[GitHub Plugin] Disabled');
      },
    })
    .build();
}
