const API_BASE = import.meta.env.PROD 
  ? 'https://restaurant-analytics.onrender.com/'
  : '/api';

const buildQueryString = (params) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        query.append(key, value.join(','));
      } else {
        query.append(key, value);
      }
    }
  });
  return query.toString();
};

export const fetchOverview = async (filters) => {
  const query = buildQueryString(filters);
  const response = await fetch(`${API_BASE}/overview?${query}`);
  return response.json();
};

export const fetchSalesByDate = async (filters) => {
  const query = buildQueryString(filters);
  const response = await fetch(`${API_BASE}/sales-by-date?${query}`);
  return response.json();
};

export const fetchTopProducts = async (filters, limit = 10) => {
  const query = buildQueryString({ ...filters, limit });
  const response = await fetch(`${API_BASE}/top-products?${query}`);
  return response.json();
};

export const fetchSalesByChannel = async (filters) => {
  const query = buildQueryString(filters);
  const response = await fetch(`${API_BASE}/sales-by-channel?${query}`);
  return response.json();
};

export const fetchSalesByHour = async (filters) => {
  const query = buildQueryString(filters);
  const response = await fetch(`${API_BASE}/sales-by-hour?${query}`);
  return response.json();
};

export const fetchSalesByWeekday = async (filters) => {
  const query = buildQueryString(filters);
  const response = await fetch(`${API_BASE}/sales-by-weekday?${query}`);
  return response.json();
};

export const fetchTopCustomers = async (filters, limit = 20) => {
  const query = buildQueryString({ ...filters, limit });
  const response = await fetch(`${API_BASE}/top-customers?${query}`);
  return response.json();
};

export const fetchInactiveCustomers = async (days = 30) => {
  const response = await fetch(`${API_BASE}/inactive-customers?days=${days}`);
  return response.json();
};

export const fetchStores = async () => {
  const response = await fetch(`${API_BASE}/stores`);
  return response.json();
};

export const fetchChannels = async () => {
  const response = await fetch(`${API_BASE}/channels`);
  return response.json();
};