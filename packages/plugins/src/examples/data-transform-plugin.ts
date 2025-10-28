import { createPlugin } from '../plugin-builder';
import type { Plugin } from '@teamflow/types';

/**
 * Data Transformation Plugin
 * Adds data manipulation and transformation nodes
 */
export function createDataTransformPlugin(): Plugin {
  return createPlugin('data-transform', 'Data Transformation', '1.0.0')
    .description('Transform, filter, and manipulate data in workflows')
    .author('TeamFlow AI Team')
    .addNode(node => {
      node
        .type('filter-array')
        .label('Filter Array')
        .description('Filter array items based on a condition')
        .icon('🔍')
        .category('Data')
        .addInput('input', 'Input', 'flow')
        .addOutput('output', 'Filtered', 'flow')
        .config({
          fields: [
            {
              key: 'arrayVariable',
              label: 'Array Variable',
              type: 'text',
              description: 'Name of the variable containing the array',
              required: true,
            },
            {
              key: 'filterKey',
              label: 'Property to Filter',
              type: 'text',
              description: 'Object property to filter by',
              required: true,
            },
            {
              key: 'operator',
              label: 'Operator',
              type: 'select',
              description: 'Comparison operator',
              required: true,
              default: 'equals',
              options: [
                { label: 'Equals', value: 'equals' },
                { label: 'Not Equals', value: 'not_equals' },
                { label: 'Greater Than', value: 'gt' },
                { label: 'Less Than', value: 'lt' },
                { label: 'Contains', value: 'contains' },
              ],
            },
            {
              key: 'filterValue',
              label: 'Filter Value',
              type: 'text',
              description: 'Value to compare against',
              required: true,
            },
            {
              key: 'outputVariable',
              label: 'Output Variable',
              type: 'text',
              description: 'Variable name for filtered result',
              required: true,
              default: 'filteredArray',
            },
          ],
          values: {},
        })
        .execute(async (context) => {
          const { arrayVariable, filterKey, operator, filterValue, outputVariable } = context.config;

          const array = context.variables[arrayVariable];
          if (!Array.isArray(array)) {
            throw new Error(`Variable ${arrayVariable} is not an array`);
          }

          const filtered = array.filter(item => {
            const value = item[filterKey];

            switch (operator) {
              case 'equals':
                return value == filterValue;
              case 'not_equals':
                return value != filterValue;
              case 'gt':
                return value > filterValue;
              case 'lt':
                return value < filterValue;
              case 'contains':
                return String(value).includes(filterValue);
              default:
                return false;
            }
          });

          // Update context variables
          context.variables[outputVariable] = filtered;

          return {
            original_count: array.length,
            filtered_count: filtered.length,
            output_variable: outputVariable,
          };
        });
    })
    .addNode(node => {
      node
        .type('map-array')
        .label('Map Array')
        .description('Transform each item in an array')
        .icon('🔄')
        .category('Data')
        .addInput('input', 'Input', 'flow')
        .addOutput('output', 'Mapped', 'flow')
        .config({
          fields: [
            {
              key: 'arrayVariable',
              label: 'Array Variable',
              type: 'text',
              description: 'Name of the variable containing the array',
              required: true,
            },
            {
              key: 'properties',
              label: 'Properties to Extract',
              type: 'text',
              description: 'Comma-separated list of properties to extract',
              required: true,
            },
            {
              key: 'outputVariable',
              label: 'Output Variable',
              type: 'text',
              description: 'Variable name for mapped result',
              required: true,
              default: 'mappedArray',
            },
          ],
          values: {},
        })
        .execute(async (context) => {
          const { arrayVariable, properties, outputVariable } = context.config;

          const array = context.variables[arrayVariable];
          if (!Array.isArray(array)) {
            throw new Error(`Variable ${arrayVariable} is not an array`);
          }

          const props = properties.split(',').map((p: string) => p.trim());

          const mapped = array.map(item => {
            const result: Record<string, any> = {};
            for (const prop of props) {
              result[prop] = item[prop];
            }
            return result;
          });

          context.variables[outputVariable] = mapped;

          return {
            count: mapped.length,
            properties: props,
            output_variable: outputVariable,
          };
        });
    })
    .addNode(node => {
      node
        .type('aggregate-data')
        .label('Aggregate Data')
        .description('Calculate sum, average, min, max from array')
        .icon('📊')
        .category('Data')
        .addInput('input', 'Input', 'flow')
        .addOutput('output', 'Result', 'flow')
        .config({
          fields: [
            {
              key: 'arrayVariable',
              label: 'Array Variable',
              type: 'text',
              description: 'Name of the variable containing the array',
              required: true,
            },
            {
              key: 'property',
              label: 'Property to Aggregate',
              type: 'text',
              description: 'Numeric property to aggregate',
              required: true,
            },
            {
              key: 'operations',
              label: 'Operations',
              type: 'text',
              description: 'Comma-separated: sum, avg, min, max, count',
              required: true,
              default: 'sum,avg',
            },
            {
              key: 'outputVariable',
              label: 'Output Variable',
              type: 'text',
              description: 'Variable name for results',
              required: true,
              default: 'aggregateResult',
            },
          ],
          values: {},
        })
        .execute(async (context) => {
          const { arrayVariable, property, operations, outputVariable } = context.config;

          const array = context.variables[arrayVariable];
          if (!Array.isArray(array)) {
            throw new Error(`Variable ${arrayVariable} is not an array`);
          }

          const values = array.map(item => Number(item[property])).filter(v => !isNaN(v));
          const ops = operations.split(',').map((o: string) => o.trim());

          const result: Record<string, number> = {};

          for (const op of ops) {
            switch (op) {
              case 'sum':
                result.sum = values.reduce((a, b) => a + b, 0);
                break;
              case 'avg':
                result.avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
                break;
              case 'min':
                result.min = values.length > 0 ? Math.min(...values) : 0;
                break;
              case 'max':
                result.max = values.length > 0 ? Math.max(...values) : 0;
                break;
              case 'count':
                result.count = values.length;
                break;
            }
          }

          context.variables[outputVariable] = result;

          return {
            ...result,
            operations: ops,
            values_count: values.length,
          };
        });
    })
    .addNode(node => {
      node
        .type('json-parse')
        .label('Parse JSON')
        .description('Parse JSON string into object')
        .icon('📝')
        .category('Data')
        .addInput('input', 'Input', 'flow')
        .addOutput('success', 'Success', 'flow')
        .addOutput('error', 'Error', 'flow')
        .config({
          fields: [
            {
              key: 'jsonVariable',
              label: 'JSON Variable',
              type: 'text',
              description: 'Variable containing JSON string',
              required: true,
            },
            {
              key: 'outputVariable',
              label: 'Output Variable',
              type: 'text',
              description: 'Variable name for parsed object',
              required: true,
              default: 'parsedData',
            },
          ],
          values: {},
        })
        .execute(async (context) => {
          const { jsonVariable, outputVariable } = context.config;

          const jsonStr = context.variables[jsonVariable];
          if (typeof jsonStr !== 'string') {
            throw new Error(`Variable ${jsonVariable} is not a string`);
          }

          try {
            const parsed = JSON.parse(jsonStr);
            context.variables[outputVariable] = parsed;

            return {
              success: true,
              type: Array.isArray(parsed) ? 'array' : typeof parsed,
              output_variable: outputVariable,
            };
          } catch (error) {
            throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : 'Invalid JSON'}`);
          }
        });
    })
    .build();
}
