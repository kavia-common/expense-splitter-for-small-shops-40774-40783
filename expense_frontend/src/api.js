const DEFAULT_BASE_URL = 'http://localhost:3001';

/**
 * PUBLIC_INTERFACE
 * Prefer process.env.REACT_APP_API_BASE_URL to override the default in different environments.
 * Falls back to http://localhost:3001 which matches the running backend in this workspace.
 */
export function getBaseUrl() {
  /** This is a public function. */
  return process.env.REACT_APP_API_BASE_URL || DEFAULT_BASE_URL;
}

/**
 * Simple helper to parse JSON safely
 */
async function safeJson(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch (e) {
    return { message: text || 'Invalid JSON response' };
  }
}

/**
 * Build standard headers
 */
function headers() {
  return {
    'Content-Type': 'application/json',
  };
}

/**
 * Common request wrapper with error normalization
 */
async function request(path, options = {}) {
  const base = getBaseUrl().replace(/\/+$/, '');
  const url = `${base}${path}`;
  const res = await fetch(url, { ...options, headers: { ...headers(), ...(options.headers || {}) } });
  const data = await safeJson(res);

  if (!res.ok) {
    const error = new Error((data && (data.message || data.detail)) || `Request failed with ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

// PUBLIC_INTERFACE
export const api = {
  /** Members endpoints */
  async listMembers() {
    /** This is a public function. Returns an array of members. */
    return request('/members/');
  },
  async createMember(payload) {
    /** This is a public function. Creates a member. payload: { name:string } */
    return request('/members/', { method: 'POST', body: JSON.stringify(payload) });
  },
  async deleteMember(memberId) {
    /** This is a public function. Deletes a member by ID. */
    const base = getBaseUrl().replace(/\/+$/, '');
    const url = `${base}/members/${memberId}`;
    const res = await fetch(url, { method: 'DELETE', headers: headers() });
    if (!res.ok && res.status !== 204) {
      const data = await safeJson(res);
      const error = new Error((data && (data.message || data.detail)) || `Delete failed with ${res.status}`);
      error.status = res.status;
      error.data = data;
      throw error;
    }
    return true;
  },

  /** Expenses endpoints */
  async listExpenses() {
    /** This is a public function. Returns an array of expenses with participants. */
    return request('/expenses/');
  },
  async createExpense(payload) {
    /** This is a public function. Creates an expense. payload: { description, amount, payer_id, participant_ids[] } */
    return request('/expenses/', { method: 'POST', body: JSON.stringify(payload) });
  },

  /** Balances endpoints */
  async listBalances() {
    /** This is a public function. Returns an array of balances. */
    return request('/balances/');
  },
  async listSettlements() {
    /** This is a public function. Returns suggested settlements. */
    return request('/balances/settlements');
  },
};

export default api;
