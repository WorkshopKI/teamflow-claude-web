import { createPlugin } from '../plugin-builder';
import type { Plugin } from '@teamflow/types';

/**
 * Calendar/Scheduling Plugin
 * Create events, manage schedules, and handle time-based operations
 */
export function createCalendarPlugin(): Plugin {
  return createPlugin('calendar-scheduling', 'Calendar & Scheduling', '1.0.0')
    .description('Create calendar events, schedule meetings, and manage time-based workflows')
    .author('TeamFlow AI Team')
    .addNode(node => {
      node
        .type('create-event')
        .label('Create Calendar Event')
        .description('Create a new calendar event')
        .icon('📅')
        .category('Scheduling')
        .addInput('input', 'Flow', 'flow')
        .addOutput('success', 'Success', 'flow')
        .addOutput('conflict', 'Conflict', 'flow')
        .config({
          fields: [
            {
              key: 'title',
              label: 'Event Title',
              type: 'text',
              description: 'Title of the event (supports variables)',
              required: true,
            },
            {
              key: 'description',
              label: 'Description',
              type: 'textarea',
              description: 'Event description',
              required: false,
            },
            {
              key: 'startDate',
              label: 'Start Date',
              type: 'text',
              description: 'Start date/time (ISO format or variable)',
              required: true,
            },
            {
              key: 'duration',
              label: 'Duration (minutes)',
              type: 'number',
              description: 'Event duration in minutes',
              required: true,
              default: 60,
            },
            {
              key: 'attendees',
              label: 'Attendees',
              type: 'text',
              description: 'Email addresses (comma-separated)',
              required: false,
            },
            {
              key: 'location',
              label: 'Location',
              type: 'text',
              description: 'Meeting location or video call link',
              required: false,
            },
            {
              key: 'reminder',
              label: 'Reminder (minutes before)',
              type: 'number',
              description: 'Minutes before event to send reminder',
              required: false,
              default: 15,
            },
          ],
          values: {},
        })
        .execute(async (context) => {
          const { title, description, startDate, duration, attendees, location, reminder } = context.config;

          // Resolve variables
          let resolvedTitle = title;
          let resolvedStartDate = startDate;
          for (const [key, value] of Object.entries(context.variables)) {
            resolvedTitle = resolvedTitle.replace(`\${${key}}`, String(value));
            resolvedStartDate = resolvedStartDate.replace(`\${${key}}`, String(value));
          }

          // Parse start date
          const start = new Date(resolvedStartDate);
          if (isNaN(start.getTime())) {
            throw new Error(`Invalid start date: ${resolvedStartDate}`);
          }

          // Calculate end date
          const end = new Date(start.getTime() + duration * 60 * 1000);

          const attendeeList = attendees ? attendees.split(',').map((a: string) => a.trim()) : [];

          console.log(`[Calendar Plugin] Creating event: ${resolvedTitle}`);
          console.log(`Start: ${start.toISOString()}, Duration: ${duration} minutes`);

          // Simulate event creation
          await new Promise(resolve => setTimeout(resolve, 700));

          const event = {
            id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: resolvedTitle,
            description,
            start: start.toISOString(),
            end: end.toISOString(),
            duration,
            attendees: attendeeList,
            location,
            reminder,
            createdAt: new Date().toISOString(),
          };

          return {
            success: true,
            event,
            conflict: false,
          };
        });
    })
    .addNode(node => {
      node
        .type('check-availability')
        .label('Check Availability')
        .description('Check if time slot is available')
        .icon('🕐')
        .category('Scheduling')
        .addInput('input', 'Input', 'flow')
        .addOutput('available', 'Available', 'flow')
        .addOutput('busy', 'Busy', 'flow')
        .config({
          fields: [
            {
              key: 'startDate',
              label: 'Start Date/Time',
              type: 'text',
              description: 'Start of time slot (ISO format)',
              required: true,
            },
            {
              key: 'endDate',
              label: 'End Date/Time',
              type: 'text',
              description: 'End of time slot (ISO format)',
              required: true,
            },
            {
              key: 'attendee',
              label: 'Attendee Email',
              type: 'text',
              description: 'Email of person to check',
              required: false,
            },
          ],
          values: {},
        })
        .execute(async (context) => {
          const { startDate, endDate, attendee } = context.config;

          // Resolve variables
          let resolvedStart = startDate;
          let resolvedEnd = endDate;
          for (const [key, value] of Object.entries(context.variables)) {
            resolvedStart = resolvedStart.replace(`\${${key}}`, String(value));
            resolvedEnd = resolvedEnd.replace(`\${${key}}`, String(value));
          }

          const start = new Date(resolvedStart);
          const end = new Date(resolvedEnd);

          if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new Error('Invalid date format');
          }

          console.log(`[Calendar Plugin] Checking availability from ${start.toISOString()} to ${end.toISOString()}`);

          // Simulate availability check
          await new Promise(resolve => setTimeout(resolve, 500));

          // Random availability for demo (70% chance available)
          const available = Math.random() > 0.3;

          return {
            available,
            start: start.toISOString(),
            end: end.toISOString(),
            attendee: attendee || 'current_user',
            durationMinutes: Math.floor((end.getTime() - start.getTime()) / 60000),
          };
        });
    })
    .addNode(node => {
      node
        .type('find-next-available')
        .label('Find Next Available Slot')
        .description('Find next available time slot')
        .icon('🔍')
        .category('Scheduling')
        .addInput('input', 'Input', 'flow')
        .addOutput('output', 'Output', 'flow')
        .config({
          fields: [
            {
              key: 'duration',
              label: 'Meeting Duration (minutes)',
              type: 'number',
              description: 'Required duration in minutes',
              required: true,
              default: 30,
            },
            {
              key: 'searchDays',
              label: 'Search Days Ahead',
              type: 'number',
              description: 'Number of days to search',
              required: false,
              default: 7,
            },
            {
              key: 'workingHoursStart',
              label: 'Working Hours Start',
              type: 'number',
              description: 'Start hour (0-23)',
              required: false,
              default: 9,
            },
            {
              key: 'workingHoursEnd',
              label: 'Working Hours End',
              type: 'number',
              description: 'End hour (0-23)',
              required: false,
              default: 17,
            },
          ],
          values: {},
        })
        .execute(async (context) => {
          const { duration, searchDays, workingHoursStart, workingHoursEnd } = context.config;

          console.log(`[Calendar Plugin] Finding next ${duration}-minute slot within ${searchDays} days`);

          // Simulate search
          await new Promise(resolve => setTimeout(resolve, 800));

          // Create a next available slot (2 days from now at 10 AM)
          const now = new Date();
          const nextSlot = new Date(now);
          nextSlot.setDate(nextSlot.getDate() + 2);
          nextSlot.setHours(workingHoursStart || 9, 0, 0, 0);

          const endSlot = new Date(nextSlot.getTime() + duration * 60 * 1000);

          return {
            found: true,
            slot: {
              start: nextSlot.toISOString(),
              end: endSlot.toISOString(),
              duration,
            },
            searchedDays: searchDays,
            workingHours: {
              start: workingHoursStart || 9,
              end: workingHoursEnd || 17,
            },
          };
        });
    })
    .addNode(node => {
      node
        .type('schedule-recurring')
        .label('Schedule Recurring Event')
        .description('Create a recurring calendar event')
        .icon('🔁')
        .category('Scheduling')
        .addInput('input', 'Flow', 'flow')
        .addOutput('output', 'Output', 'flow')
        .config({
          fields: [
            {
              key: 'title',
              label: 'Event Title',
              type: 'text',
              description: 'Title of recurring event',
              required: true,
            },
            {
              key: 'startDate',
              label: 'Start Date',
              type: 'text',
              description: 'First occurrence date (ISO format)',
              required: true,
            },
            {
              key: 'recurrence',
              label: 'Recurrence Pattern',
              type: 'select',
              description: 'How often to repeat',
              required: true,
              options: [
                { label: 'Daily', value: 'daily' },
                { label: 'Weekly', value: 'weekly' },
                { label: 'Biweekly', value: 'biweekly' },
                { label: 'Monthly', value: 'monthly' },
              ],
            },
            {
              key: 'occurrences',
              label: 'Number of Occurrences',
              type: 'number',
              description: 'How many times to repeat',
              required: false,
              default: 10,
            },
            {
              key: 'duration',
              label: 'Duration (minutes)',
              type: 'number',
              description: 'Event duration',
              required: true,
              default: 30,
            },
          ],
          values: {},
        })
        .execute(async (context) => {
          const { title, startDate, recurrence, occurrences, duration } = context.config;

          const start = new Date(startDate);
          if (isNaN(start.getTime())) {
            throw new Error(`Invalid start date: ${startDate}`);
          }

          console.log(`[Calendar Plugin] Creating ${recurrence} recurring event: ${title}`);
          console.log(`${occurrences} occurrences starting ${start.toISOString()}`);

          // Calculate all occurrence dates
          const events = [];
          const currentDate = new Date(start);

          for (let i = 0; i < occurrences; i++) {
            events.push({
              occurrence: i + 1,
              start: new Date(currentDate).toISOString(),
              end: new Date(currentDate.getTime() + duration * 60 * 1000).toISOString(),
            });

            // Increment based on recurrence pattern
            switch (recurrence) {
              case 'daily':
                currentDate.setDate(currentDate.getDate() + 1);
                break;
              case 'weekly':
                currentDate.setDate(currentDate.getDate() + 7);
                break;
              case 'biweekly':
                currentDate.setDate(currentDate.getDate() + 14);
                break;
              case 'monthly':
                currentDate.setMonth(currentDate.getMonth() + 1);
                break;
            }
          }

          await new Promise(resolve => setTimeout(resolve, 900));

          return {
            success: true,
            title,
            recurrence,
            occurrences: events.length,
            events,
            seriesId: `series_${Date.now()}`,
          };
        });
    })
    .addTool(tool => {
      tool
        .name('create_quick_meeting')
        .description('Quickly schedule a meeting')
        .stringParam('title', 'Meeting title', true)
        .stringParam('datetime', 'Meeting date/time (ISO format)', true)
        .numberParam('duration', 'Duration in minutes', false, 60)
        .execute(async (params) => {
          console.log(`[Calendar Tool] Quick meeting: ${params.title} at ${params.datetime}`);
          await new Promise(resolve => setTimeout(resolve, 500));
          return {
            created: true,
            eventId: `evt_${Date.now()}`,
            title: params.title,
          };
        });
    })
    .settings({
      fields: [
        {
          key: 'calendarProvider',
          label: 'Calendar Provider',
          type: 'select',
          description: 'Calendar service to use',
          required: true,
          options: [
            { label: 'Google Calendar', value: 'google' },
            { label: 'Microsoft Outlook', value: 'outlook' },
            { label: 'CalDAV', value: 'caldav' },
          ],
        },
        {
          key: 'apiKey',
          label: 'API Key',
          type: 'text',
          description: 'Calendar API key or OAuth token',
          required: true,
        },
        {
          key: 'defaultCalendar',
          label: 'Default Calendar',
          type: 'text',
          description: 'Default calendar ID',
          required: false,
        },
        {
          key: 'timezone',
          label: 'Timezone',
          type: 'text',
          description: 'Default timezone (e.g., America/New_York)',
          required: false,
          default: 'UTC',
        },
      ],
      values: {},
    })
    .hooks({
      onInstall: async () => {
        console.log('[Calendar Plugin] Installed - Configure your calendar provider to start scheduling');
      },
      onEnable: async () => {
        console.log('[Calendar Plugin] Enabled - Calendar scheduling is now available');
      },
      onDisable: async () => {
        console.log('[Calendar Plugin] Disabled');
      },
    })
    .build();
}
