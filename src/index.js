import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getConfig, setConfig, isConfigured } from './config.js';
import {
  enrichTransaction, enrichTransactionsBatch, getTransaction, listTransactions,
  createAccount, getAccount, listAccounts, deleteAccount,
  getAccountReport, getAccountMetrics,
  listLabels
} from './api.js';

const program = new Command();

function printSuccess(message) { console.log(chalk.green('✓') + ' ' + message); }
function printError(message) { console.error(chalk.red('✗') + ' ' + message); }
function printJson(data) { console.log(JSON.stringify(data, null, 2)); }

function printTable(data, columns) {
  if (!data || data.length === 0) { console.log(chalk.yellow('No results found.')); return; }
  const widths = {};
  columns.forEach(col => {
    widths[col.key] = col.label.length;
    data.forEach(row => {
      const val = String(col.format ? col.format(row[col.key], row) : (row[col.key] ?? ''));
      if (val.length > widths[col.key]) widths[col.key] = val.length;
    });
    widths[col.key] = Math.min(widths[col.key], 40);
  });
  const header = columns.map(col => col.label.padEnd(widths[col.key])).join('  ');
  console.log(chalk.bold(chalk.cyan(header)));
  console.log(chalk.dim('─'.repeat(header.length)));
  data.forEach(row => {
    const line = columns.map(col => {
      const val = String(col.format ? col.format(row[col.key], row) : (row[col.key] ?? ''));
      return val.substring(0, widths[col.key]).padEnd(widths[col.key]);
    }).join('  ');
    console.log(line);
  });
  console.log(chalk.dim(`\n${data.length} result(s)`));
}

async function withSpinner(message, fn) {
  const spinner = ora(message).start();
  try {
    const result = await fn();
    spinner.stop();
    return result;
  } catch (error) {
    spinner.stop();
    throw error;
  }
}

function requireAuth() {
  if (!isConfigured()) {
    printError('Ntropy API key not configured.');
    console.log('\nRun: ' + chalk.cyan('ntropy config set --api-key <key>'));
    console.log('Get your key at: ' + chalk.cyan('https://ntropy.network'));
    process.exit(1);
  }
}

program
  .name('ntropy')
  .description(chalk.bold('Ntropy CLI') + ' - Financial transaction enrichment from your terminal')
  .version('1.0.0');

// ============================================================
// CONFIG
// ============================================================

const configCmd = program.command('config').description('Manage CLI configuration');

configCmd
  .command('set')
  .description('Set configuration values')
  .option('--api-key <key>', 'Ntropy API key')
  .action((options) => {
    if (options.apiKey) {
      setConfig('apiKey', options.apiKey);
      printSuccess('API key saved');
    } else {
      printError('No options provided. Use --api-key');
    }
  });

configCmd
  .command('show')
  .description('Show current configuration')
  .action(() => {
    const apiKey = getConfig('apiKey');
    console.log(chalk.bold('\nNtropy CLI Configuration\n'));
    console.log('API Key: ', apiKey ? chalk.green(apiKey.substring(0, 10) + '...') : chalk.red('not set'));
    console.log('');
  });

// ============================================================
// TRANSACTIONS
// ============================================================

const txCmd = program.command('transactions').description('Enrich and manage transactions');

txCmd
  .command('enrich')
  .description('Enrich a single transaction')
  .requiredOption('--id <id>', 'Transaction ID')
  .requiredOption('--description <desc>', 'Transaction description')
  .requiredOption('--amount <amount>', 'Transaction amount (positive=credit, negative=debit)', parseFloat)
  .requiredOption('--date <date>', 'Transaction date (YYYY-MM-DD)')
  .requiredOption('--account-holder-id <id>', 'Account holder ID')
  .option('--entry-type <type>', 'Entry type (debit|credit)', 'debit')
  .option('--currency <currency>', 'ISO 4217 currency code', 'USD')
  .option('--country <country>', 'ISO 3166-1 alpha-2 country code')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    const tx = {
      id: options.id,
      description: options.description,
      date: options.date,
      amount: options.amount,
      entry_type: options.entryType,
      currency: options.currency,
      account_holder_id: options.accountHolderId,
      ...(options.country && { country: options.country })
    };
    try {
      const result = await withSpinner('Enriching transaction...', () => enrichTransaction(tx));
      if (options.json) { printJson(result); return; }
      console.log(chalk.bold('\nEnriched Transaction\n'));
      console.log('ID:           ', chalk.cyan(result.id));
      console.log('Description:  ', result.description);
      console.log('Amount:       ', chalk.bold(`${result.currency} ${result.amount}`));
      console.log('Date:         ', result.date);
      if (result.merchant?.name) console.log('Merchant:     ', chalk.green(result.merchant.name));
      if (result.labels?.length) console.log('Labels:       ', result.labels.join(', '));
      if (result.location?.country) console.log('Country:      ', result.location.country);
      console.log('');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

txCmd
  .command('enrich-batch')
  .description('Enrich transactions from a JSON file')
  .requiredOption('--file <path>', 'Path to JSON file with array of transactions')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    let transactions;
    try {
      const { readFileSync } = await import('fs');
      transactions = JSON.parse(readFileSync(options.file, 'utf8'));
    } catch (e) {
      printError('Failed to read/parse file: ' + e.message);
      process.exit(1);
    }
    try {
      const result = await withSpinner(`Enriching ${transactions.length} transactions...`, () =>
        enrichTransactionsBatch(transactions)
      );
      if (options.json) { printJson(result); return; }
      printSuccess(`Batch submitted. Job ID: ${result.id || result.batch_id || 'unknown'}`);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

txCmd
  .command('list')
  .description('List transactions')
  .option('--limit <n>', 'Max results', '20')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const result = await withSpinner('Fetching transactions...', () =>
        listTransactions({ limit: parseInt(options.limit) })
      );
      const txs = result.transactions || result.data || result || [];
      if (options.json) { printJson(txs); return; }
      const arr = Array.isArray(txs) ? txs : [];
      printTable(arr, [
        { key: 'id', label: 'ID', format: (v) => v?.substring(0, 12) + '...' },
        { key: 'description', label: 'Description', format: (v) => v?.substring(0, 30) || '' },
        { key: 'amount', label: 'Amount', format: (v, row) => `${row.currency || ''} ${v || ''}` },
        { key: 'date', label: 'Date' }
      ]);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

txCmd
  .command('get <transaction-id>')
  .description('Get a specific transaction')
  .option('--json', 'Output as JSON')
  .action(async (transactionId, options) => {
    requireAuth();
    try {
      const tx = await withSpinner('Fetching transaction...', () => getTransaction(transactionId));
      if (!tx) { printError('Transaction not found'); process.exit(1); }
      if (options.json) { printJson(tx); return; }
      console.log(chalk.bold('\nTransaction Details\n'));
      console.log('ID:           ', chalk.cyan(tx.id));
      console.log('Description:  ', tx.description);
      console.log('Amount:       ', `${tx.currency} ${tx.amount}`);
      console.log('Date:         ', tx.date);
      if (tx.merchant?.name) console.log('Merchant:     ', chalk.green(tx.merchant.name));
      if (tx.labels?.length) console.log('Labels:       ', tx.labels.join(', '));
      console.log('');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// ACCOUNT HOLDERS
// ============================================================

const accountsCmd = program.command('accounts').description('Manage account holders');

accountsCmd
  .command('create')
  .description('Create a new account holder')
  .requiredOption('--id <id>', 'Account holder ID')
  .option('--type <type>', 'Account type (consumer|business)', 'consumer')
  .option('--name <name>', 'Account holder name')
  .option('--currency <currency>', 'Currency code', 'USD')
  .option('--country <country>', 'Country code')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    const account = {
      id: options.id,
      type: options.type,
      currency: options.currency,
      ...(options.name && { name: options.name }),
      ...(options.country && { country: options.country })
    };
    try {
      const result = await withSpinner('Creating account holder...', () => createAccount(account));
      if (options.json) { printJson(result); return; }
      printSuccess(`Account holder created: ${result.id}`);
      console.log('Type:     ', result.type);
      if (result.name) console.log('Name:     ', result.name);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

accountsCmd
  .command('list')
  .description('List all account holders')
  .option('--limit <n>', 'Max results', '20')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const result = await withSpinner('Fetching account holders...', () =>
        listAccounts({ limit: parseInt(options.limit) })
      );
      const accounts = result.account_holders || result.data || result || [];
      if (options.json) { printJson(accounts); return; }
      const arr = Array.isArray(accounts) ? accounts : [];
      printTable(arr, [
        { key: 'id', label: 'ID' },
        { key: 'type', label: 'Type' },
        { key: 'name', label: 'Name', format: (v) => v || '' },
        { key: 'currency', label: 'Currency', format: (v) => v || '' }
      ]);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

accountsCmd
  .command('get <account-id>')
  .description('Get a specific account holder')
  .option('--json', 'Output as JSON')
  .action(async (accountId, options) => {
    requireAuth();
    try {
      const account = await withSpinner('Fetching account holder...', () => getAccount(accountId));
      if (!account) { printError('Account not found'); process.exit(1); }
      if (options.json) { printJson(account); return; }
      console.log(chalk.bold('\nAccount Holder Details\n'));
      console.log('ID:       ', chalk.cyan(account.id));
      console.log('Type:     ', account.type);
      if (account.name) console.log('Name:     ', account.name);
      if (account.currency) console.log('Currency: ', account.currency);
      if (account.country) console.log('Country:  ', account.country);
      console.log('');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

accountsCmd
  .command('delete <account-id>')
  .description('Delete an account holder')
  .action(async (accountId) => {
    requireAuth();
    try {
      await withSpinner('Deleting account holder...', () => deleteAccount(accountId));
      printSuccess(`Account holder deleted: ${accountId}`);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// REPORTS
// ============================================================

const reportsCmd = program.command('reports').description('View financial reports and metrics');

reportsCmd
  .command('get <account-id>')
  .description('Get spending report for an account holder')
  .option('--period <period>', 'Reporting period (e.g. 2024-01)')
  .option('--json', 'Output as JSON')
  .action(async (accountId, options) => {
    requireAuth();
    try {
      const report = await withSpinner('Fetching report...', () =>
        getAccountReport(accountId, { period: options.period })
      );
      if (options.json) { printJson(report); return; }
      console.log(chalk.bold('\nAccount Report\n'));
      console.log('Account: ', chalk.cyan(accountId));
      if (options.period) console.log('Period:  ', options.period);
      console.log('');
      if (report) console.log(JSON.stringify(report, null, 2));
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

reportsCmd
  .command('metrics <account-id>')
  .description('Get financial metrics for an account holder')
  .option('--json', 'Output as JSON')
  .action(async (accountId, options) => {
    requireAuth();
    try {
      const metrics = await withSpinner('Fetching metrics...', () => getAccountMetrics(accountId));
      if (options.json) { printJson(metrics); return; }
      console.log(chalk.bold('\nAccount Metrics\n'));
      console.log('Account: ', chalk.cyan(accountId));
      console.log('');
      if (metrics) console.log(JSON.stringify(metrics, null, 2));
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// LABELS
// ============================================================

const labelsCmd = program.command('labels').description('View available transaction labels');

labelsCmd
  .command('list')
  .description('List all available labels')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const labels = await withSpinner('Fetching labels...', () => listLabels());
      if (options.json) { printJson(labels); return; }
      const arr = Array.isArray(labels) ? labels : (labels?.labels || []);
      if (arr.length === 0) { console.log(chalk.yellow('No labels found.')); return; }
      console.log(chalk.bold(chalk.cyan('Label')));
      console.log(chalk.dim('─'.repeat(40)));
      arr.forEach(l => console.log(typeof l === 'string' ? l : l.id || l.name || JSON.stringify(l)));
      console.log(chalk.dim(`\n${arr.length} result(s)`));
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

program.parse(process.argv);
if (process.argv.length <= 2) program.help();
