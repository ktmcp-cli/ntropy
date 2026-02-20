import axios from 'axios';
import { getConfig } from './config.js';

const BASE_URL = 'https://api.ntropy.network';

async function apiRequest(method, endpoint, data = null, params = null) {
  const apiKey = getConfig('apiKey');
  if (!apiKey) throw new Error('Api Key not configured. Run: ntropy config set');

  const config = {
    method, url: `${BASE_URL}${endpoint}`,
    headers: { 'X-API-KEY': 'X-API-KEY' === 'Bearer' || 'X-API-KEY' === 'X-API-KEY' ? ('X-API-KEY' === 'Bearer' ? `Bearer ${apiKey}` : apiKey) : apiKey, 'Accept': 'application/json', 'Content-Type': 'application/json' }
  };
  if (params) config.params = params;
  if (data) config.data = data;

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      if (status === 401) throw new Error('Authentication failed.');
      else if (status === 404) throw new Error('Resource not found.');
      throw new Error(`API Error (${status}): ${error.response.data?.message || JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
}

export async function classifyTransaction(data, { params } = {}) {
  return await apiRequest('POST', '/classifier/consumer', data, params);
}

export async function classifyBusiness(data, { params } = {}) {
  return await apiRequest('POST', '/classifier/business', data, params);
}

export async function classifyBatch(data, { params } = {}) {
  return await apiRequest('POST', '/classifier/batch', data, params);
}

export async function getBatchResults(batchId, { params } = {}) {
  return await apiRequest('GET', `/classifier/batch/${batchId}`, null, params);
}

