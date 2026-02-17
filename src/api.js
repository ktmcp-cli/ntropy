import axios from 'axios';
import { getConfig } from './config.js';

const BASE_URL = 'https://api.ntropy.network/v3';

function getHeaders() {
  const apiKey = getConfig('apiKey');
  if (!apiKey) throw new Error('API key not configured. Run: ntropy config set --api-key <key>');
  return {
    'X-API-Key': apiKey,
    'Content-Type': 'application/json'
  };
}

function handleApiError(error) {
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;
    if (status === 401) throw new Error('Authentication failed. Check your API key: ntropy config set --api-key <key>');
    if (status === 403) throw new Error('Access forbidden. Check your API permissions.');
    if (status === 404) throw new Error('Resource not found.');
    if (status === 429) throw new Error('Rate limit exceeded. Please wait before retrying.');
    const message = data?.message || data?.detail || JSON.stringify(data);
    throw new Error(`API Error (${status}): ${message}`);
  } else if (error.request) {
    throw new Error('No response from Ntropy API. Check your internet connection.');
  } else {
    throw error;
  }
}

async function apiRequest(method, endpoint, data = null, params = null) {
  const config = {
    method,
    url: `${BASE_URL}${endpoint}`,
    headers: getHeaders()
  };
  if (params) config.params = params;
  if (data) config.data = data;
  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

// Transactions
export async function enrichTransaction(transaction) {
  return await apiRequest('POST', '/transactions', transaction);
}

export async function enrichTransactionsBatch(transactions) {
  return await apiRequest('POST', '/transactions/batch', { transactions });
}

export async function getTransaction(transactionId) {
  return await apiRequest('GET', `/transactions/${transactionId}`);
}

export async function listTransactions({ limit = 20, cursor } = {}) {
  const params = { limit };
  if (cursor) params.cursor = cursor;
  return await apiRequest('GET', '/transactions', null, params);
}

// Accounts
export async function createAccount(account) {
  return await apiRequest('POST', '/account-holders', account);
}

export async function getAccount(accountId) {
  return await apiRequest('GET', `/account-holders/${accountId}`);
}

export async function listAccounts({ limit = 20, cursor } = {}) {
  const params = { limit };
  if (cursor) params.cursor = cursor;
  return await apiRequest('GET', '/account-holders', null, params);
}

export async function deleteAccount(accountId) {
  return await apiRequest('DELETE', `/account-holders/${accountId}`);
}

// Reports
export async function getAccountReport(accountId, { period } = {}) {
  const params = {};
  if (period) params.period = period;
  return await apiRequest('GET', `/account-holders/${accountId}/reports`, null, params);
}

export async function getAccountMetrics(accountId) {
  return await apiRequest('GET', `/account-holders/${accountId}/metrics`);
}

// Labels / Models
export async function listLabels() {
  return await apiRequest('GET', '/labels');
}
