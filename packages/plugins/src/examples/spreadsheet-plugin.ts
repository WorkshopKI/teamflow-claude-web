import { createPlugin } from '../plugin-builder';
import type { Plugin } from '@teamflow/types';

/**
 * Spreadsheet/CSV Plugin
 * Parse, create, and manipulate CSV and spreadsheet data
 */
export function createSpreadsheetPlugin(): Plugin {
  return createPlugin('spreadsheet-csv', 'Spreadsheet & CSV', '1.0.0')
    .description('Parse CSV files, create spreadsheets, and manipulate tabular data')
    .author('TeamFlow AI Team')
    .addNode(node => {
      node
        .type('parse-csv')
        .label('Parse CSV')
        .description('Parse CSV string into array of objects')
        .icon('📄')
        .category('Data')
        .addInput('input', 'Input', 'flow')
        .addOutput('output', 'Output', 'flow')
        .config({
          fields: [
            {
              key: 'csvVariable',
              label: 'CSV Variable',
              type: 'text',
              description: 'Variable containing CSV string',
              required: true,
            },
            {
              key: 'delimiter',
              label: 'Delimiter',
              type: 'select',
              description: 'CSV delimiter character',
              required: false,
              default: ',',
              options: [
                { label: 'Comma (,)', value: ',' },
                { label: 'Semicolon (;)', value: ';' },
                { label: 'Tab', value: '\t' },
                { label: 'Pipe (|)', value: '|' },
              ],
            },
            {
              key: 'hasHeader',
              label: 'Has Header Row',
              type: 'boolean',
              description: 'First row contains column names',
              required: false,
            },
            {
              key: 'outputVariable',
              label: 'Output Variable',
              type: 'text',
              description: 'Variable name for parsed data',
              required: true,
              default: 'csvData',
            },
          ],
          values: {},
        })
        .execute(async (context) => {
          const { csvVariable, delimiter, hasHeader, outputVariable } = context.config;

          const csvString = context.variables[csvVariable];
          if (typeof csvString !== 'string') {
            throw new Error(`Variable ${csvVariable} is not a string`);
          }

          // Parse CSV (simple implementation)
          const lines = csvString.trim().split('\n');
          const headers = hasHeader ? lines[0].split(delimiter).map((h: string) => h.trim()) : null;
          const dataLines = hasHeader ? lines.slice(1) : lines;

          const parsed = dataLines.map((line: string) => {
            const values = line.split(delimiter).map((v: string) => v.trim());

            if (headers) {
              const obj: Record<string, any> = {};
              headers.forEach((header, i) => {
                obj[header] = values[i] || '';
              });
              return obj;
            } else {
              return values;
            }
          });

          context.variables[outputVariable] = parsed;

          console.log(`[Spreadsheet Plugin] Parsed ${parsed.length} rows from CSV`);

          return {
            rowCount: parsed.length,
            columnCount: headers ? headers.length : parsed[0]?.length || 0,
            headers: headers || undefined,
            output_variable: outputVariable,
          };
        });
    })
    .addNode(node => {
      node
        .type('create-csv')
        .label('Create CSV')
        .description('Convert array of objects to CSV string')
        .icon('📝')
        .category('Data')
        .addInput('input', 'Input', 'flow')
        .addOutput('output', 'Output', 'flow')
        .config({
          fields: [
            {
              key: 'dataVariable',
              label: 'Data Variable',
              type: 'text',
              description: 'Variable containing array of objects',
              required: true,
            },
            {
              key: 'delimiter',
              label: 'Delimiter',
              type: 'select',
              description: 'CSV delimiter character',
              required: false,
              default: ',',
              options: [
                { label: 'Comma (,)', value: ',' },
                { label: 'Semicolon (;)', value: ';' },
                { label: 'Tab', value: '\t' },
                { label: 'Pipe (|)', value: '|' },
              ],
            },
            {
              key: 'includeHeader',
              label: 'Include Header',
              type: 'boolean',
              description: 'Include column names as first row',
              required: false,
            },
            {
              key: 'outputVariable',
              label: 'Output Variable',
              type: 'text',
              description: 'Variable name for CSV string',
              required: true,
              default: 'csvOutput',
            },
          ],
          values: {},
        })
        .execute(async (context) => {
          const { dataVariable, delimiter, includeHeader, outputVariable } = context.config;

          const data = context.variables[dataVariable];
          if (!Array.isArray(data)) {
            throw new Error(`Variable ${dataVariable} is not an array`);
          }

          if (data.length === 0) {
            context.variables[outputVariable] = '';
            return { rowCount: 0, output_variable: outputVariable };
          }

          // Get headers from first object
          const headers = Object.keys(data[0]);
          const rows: string[] = [];

          // Add header row if requested
          if (includeHeader) {
            rows.push(headers.join(delimiter));
          }

          // Add data rows
          for (const row of data) {
            const values = headers.map(header => {
              const value = row[header];
              // Escape delimiter if present in value
              const stringValue = String(value);
              return stringValue.includes(delimiter) ? `"${stringValue}"` : stringValue;
            });
            rows.push(values.join(delimiter));
          }

          const csv = rows.join('\n');
          context.variables[outputVariable] = csv;

          console.log(`[Spreadsheet Plugin] Created CSV with ${data.length} rows`);

          return {
            rowCount: data.length,
            columnCount: headers.length,
            output_variable: outputVariable,
            size_bytes: csv.length,
          };
        });
    })
    .addNode(node => {
      node
        .type('spreadsheet-lookup')
        .label('Spreadsheet Lookup')
        .description('Find row in spreadsheet by column value')
        .icon('🔍')
        .category('Data')
        .addInput('input', 'Input', 'flow')
        .addOutput('found', 'Found', 'flow')
        .addOutput('not_found', 'Not Found', 'flow')
        .config({
          fields: [
            {
              key: 'dataVariable',
              label: 'Data Variable',
              type: 'text',
              description: 'Variable containing array of objects',
              required: true,
            },
            {
              key: 'lookupColumn',
              label: 'Lookup Column',
              type: 'text',
              description: 'Column name to search in',
              required: true,
            },
            {
              key: 'lookupValue',
              label: 'Lookup Value',
              type: 'text',
              description: 'Value to search for (supports variables)',
              required: true,
            },
            {
              key: 'outputVariable',
              label: 'Output Variable',
              type: 'text',
              description: 'Variable name for found row',
              required: true,
              default: 'foundRow',
            },
          ],
          values: {},
        })
        .execute(async (context) => {
          const { dataVariable, lookupColumn, lookupValue, outputVariable } = context.config;

          const data = context.variables[dataVariable];
          if (!Array.isArray(data)) {
            throw new Error(`Variable ${dataVariable} is not an array`);
          }

          // Resolve lookup value
          let resolvedValue = lookupValue;
          for (const [key, value] of Object.entries(context.variables)) {
            resolvedValue = resolvedValue.replace(`\${${key}}`, String(value));
          }

          // Find matching row
          const found = data.find(row => String(row[lookupColumn]) === resolvedValue);

          if (found) {
            context.variables[outputVariable] = found;
            console.log(`[Spreadsheet Plugin] Found row for ${lookupColumn} = ${resolvedValue}`);
            return {
              found: true,
              row: found,
              output_variable: outputVariable,
            };
          } else {
            console.log(`[Spreadsheet Plugin] No row found for ${lookupColumn} = ${resolvedValue}`);
            return {
              found: false,
              lookupColumn,
              lookupValue: resolvedValue,
            };
          }
        });
    })
    .addNode(node => {
      node
        .type('spreadsheet-sort')
        .label('Sort Spreadsheet')
        .description('Sort spreadsheet data by column')
        .icon('🔄')
        .category('Data')
        .addInput('input', 'Input', 'flow')
        .addOutput('output', 'Output', 'flow')
        .config({
          fields: [
            {
              key: 'dataVariable',
              label: 'Data Variable',
              type: 'text',
              description: 'Variable containing array of objects',
              required: true,
            },
            {
              key: 'sortColumn',
              label: 'Sort Column',
              type: 'text',
              description: 'Column name to sort by',
              required: true,
            },
            {
              key: 'sortOrder',
              label: 'Sort Order',
              type: 'select',
              description: 'Ascending or descending',
              required: false,
              default: 'asc',
              options: [
                { label: 'Ascending', value: 'asc' },
                { label: 'Descending', value: 'desc' },
              ],
            },
            {
              key: 'outputVariable',
              label: 'Output Variable',
              type: 'text',
              description: 'Variable name for sorted data',
              required: true,
              default: 'sortedData',
            },
          ],
          values: {},
        })
        .execute(async (context) => {
          const { dataVariable, sortColumn, sortOrder, outputVariable } = context.config;

          const data = context.variables[dataVariable];
          if (!Array.isArray(data)) {
            throw new Error(`Variable ${dataVariable} is not an array`);
          }

          // Sort the data
          const sorted = [...data].sort((a, b) => {
            const aVal = a[sortColumn];
            const bVal = b[sortColumn];

            if (typeof aVal === 'number' && typeof bVal === 'number') {
              return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
            }

            const aStr = String(aVal);
            const bStr = String(bVal);

            if (sortOrder === 'asc') {
              return aStr.localeCompare(bStr);
            } else {
              return bStr.localeCompare(aStr);
            }
          });

          context.variables[outputVariable] = sorted;

          console.log(`[Spreadsheet Plugin] Sorted ${sorted.length} rows by ${sortColumn} (${sortOrder})`);

          return {
            rowCount: sorted.length,
            sortColumn,
            sortOrder,
            output_variable: outputVariable,
          };
        });
    })
    .addTool(tool => {
      tool
        .name('csv_row_count')
        .description('Count rows in a CSV variable')
        .stringParam('variable_name', 'Name of variable containing CSV data', true)
        .execute(async (params) => {
          console.log(`[Spreadsheet Tool] Counting rows in variable: ${params.variable_name}`);
          // In real implementation, would access the actual variable
          await new Promise(resolve => setTimeout(resolve, 200));
          return {
            variable: params.variable_name,
            rowCount: 0, // Would be actual count
          };
        });
    })
    .settings({
      fields: [
        {
          key: 'defaultDelimiter',
          label: 'Default Delimiter',
          type: 'select',
          description: 'Default CSV delimiter',
          required: false,
          default: ',',
          options: [
            { label: 'Comma (,)', value: ',' },
            { label: 'Semicolon (;)', value: ';' },
            { label: 'Tab', value: '\t' },
            { label: 'Pipe (|)', value: '|' },
          ],
        },
        {
          key: 'maxFileSize',
          label: 'Max File Size (MB)',
          type: 'number',
          description: 'Maximum CSV file size to process',
          required: false,
          default: 10,
        },
      ],
      values: {},
    })
    .hooks({
      onInstall: async () => {
        console.log('[Spreadsheet Plugin] Installed - Ready to work with CSV and tabular data');
      },
      onEnable: async () => {
        console.log('[Spreadsheet Plugin] Enabled');
      },
    })
    .build();
}
