import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getConfig, setConfig, isConfigured } from './config.js';
import * as api from './api.js';

const program = new Command();

function printSuccess(message) { console.log(chalk.green('✓') + ' ' + message); }
function printError(message) { console.error(chalk.red('✗') + ' ' + message); }
function printJson(data) { console.log(JSON.stringify(data, null, 2)); }
async function withSpinner(message, fn) {
  const spinner = ora(message).start();
  try { const result = await fn(); spinner.stop(); return result; }
  catch (error) { spinner.stop(); throw error; }
}
function requireAuth() {
  if (!isConfigured()) {
    printError('Not configured.');
    console.log('\nRun: ntropy config set');
    process.exit(1);
  }
}

program
  .name('ntropy')
  .description(chalk.bold('Ntropy CLI') + ' - Transaction classification from your terminal')
  .version('1.0.0');

const configCmd = program.command('config').description('Manage CLI configuration');
configCmd.command('set')
  .description('Set configuration')
  .option('--api-key <key>', 'API key')
  .option('--access-token <token>', 'Access token')
  .action((options) => {
    if (options.apiKey) { setConfig('apiKey', options.apiKey); printSuccess('API key set'); }
    if (options.accessToken) { setConfig('accessToken', options.accessToken); printSuccess('Access token set'); }
  });

configCmd.command('show')
  .description('Show current configuration')
  .action(() => {
    console.log(chalk.bold('\nNtropy CLI Configuration\n'));
    const apiKey = getConfig('apiKey');
    const accessToken = getConfig('accessToken');
    if (apiKey) console.log('API Key: ', chalk.green('*'.repeat(16)));
    if (accessToken) console.log('Access Token: ', chalk.green('*'.repeat(16)));
    console.log('');
  });


const classifyCmd = program.command('classify').description('Manage classify');

classifyCmd.command('consumer')
  .description('Consumer command')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const result = await withSpinner('Processing...', () => api.consumer());
      if (options.json) printJson(result);
      else { printSuccess('Done'); console.log(result); }
    } catch (error) { printError(error.message); process.exit(1); }
  });

classifyCmd.command('business')
  .description('Business command')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const result = await withSpinner('Processing...', () => api.business());
      if (options.json) printJson(result);
      else { printSuccess('Done'); console.log(result); }
    } catch (error) { printError(error.message); process.exit(1); }
  });

classifyCmd.command('batch')
  .description('Batch command')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const result = await withSpinner('Processing...', () => api.batch());
      if (options.json) printJson(result);
      else { printSuccess('Done'); console.log(result); }
    } catch (error) { printError(error.message); process.exit(1); }
  });


const batchCmd = program.command('batch').description('Manage batch');

batchCmd.command('results')
  .description('Results command')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const result = await withSpinner('Processing...', () => api.results());
      if (options.json) printJson(result);
      else { printSuccess('Done'); console.log(result); }
    } catch (error) { printError(error.message); process.exit(1); }
  });



program.parse(process.argv);
if (process.argv.length <= 2) program.help();
