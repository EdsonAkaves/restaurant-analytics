const express = require('express');
const cors = require('cors');
require('dotenv').config();

const queries = require('./queries');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Helper para extrair filtros
const extractFilters = (req) => {
  const { startDate, endDate, storeIds, channelIds } = req.query;
  
  return {
    startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: endDate || new Date().toISOString(),
    storeIds: storeIds ? storeIds.split(',').map(Number) : null,
    channelIds: channelIds ? channelIds.split(',').map(Number) : null
  };
};

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Overview
app.get('/api/overview', async (req, res) => {
  try {
    const filters = extractFilters(req);
    const data = await queries.getOverview(
      filters.startDate,
      filters.endDate,
      filters.storeIds,
      filters.channelIds
    );
    res.json(data);
  } catch (error) {
    console.error('Error in /api/overview:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Vendas por data
app.get('/api/sales-by-date', async (req, res) => {
  try {
    const filters = extractFilters(req);
    const data = await queries.getSalesByDate(
      filters.startDate,
      filters.endDate,
      filters.storeIds,
      filters.channelIds
    );
    res.json(data);
  } catch (error) {
    console.error('Error in /api/sales-by-date:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Top produtos
app.get('/api/top-products', async (req, res) => {
  try {
    const filters = extractFilters(req);
    const limit = parseInt(req.query.limit) || 10;
    const data = await queries.getTopProducts(
      filters.startDate,
      filters.endDate,
      filters.storeIds,
      filters.channelIds,
      limit
    );
    res.json(data);
  } catch (error) {
    console.error('Error in /api/top-products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Vendas por canal
app.get('/api/sales-by-channel', async (req, res) => {
  try {
    const filters = extractFilters(req);
    const data = await queries.getSalesByChannel(
      filters.startDate,
      filters.endDate,
      filters.storeIds
    );
    res.json(data);
  } catch (error) {
    console.error('Error in /api/sales-by-channel:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Vendas por horário
app.get('/api/sales-by-hour', async (req, res) => {
  try {
    const filters = extractFilters(req);
    const data = await queries.getSalesByHour(
      filters.startDate,
      filters.endDate,
      filters.storeIds,
      filters.channelIds
    );
    res.json(data);
  } catch (error) {
    console.error('Error in /api/sales-by-hour:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Vendas por dia da semana
app.get('/api/sales-by-weekday', async (req, res) => {
  try {
    const filters = extractFilters(req);
    const data = await queries.getSalesByWeekday(
      filters.startDate,
      filters.endDate,
      filters.storeIds,
      filters.channelIds
    );
    res.json(data);
  } catch (error) {
    console.error('Error in /api/sales-by-weekday:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Top clientes
app.get('/api/top-customers', async (req, res) => {
  try {
    const filters = extractFilters(req);
    const limit = parseInt(req.query.limit) || 20;
    const data = await queries.getTopCustomers(
      filters.startDate,
      filters.endDate,
      limit
    );
    res.json(data);
  } catch (error) {
    console.error('Error in /api/top-customers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Clientes inativos
app.get('/api/inactive-customers', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const data = await queries.getInactiveCustomers(days);
    res.json(data);
  } catch (error) {
    console.error('Error in /api/inactive-customers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Listar lojas
app.get('/api/stores', async (req, res) => {
  try {
    const data = await queries.getStores();
    res.json(data);
  } catch (error) {
    console.error('Error in /api/stores:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Listar canais
app.get('/api/channels', async (req, res) => {
  try {
    const data = await queries.getChannels();
    res.json(data);
  } catch (error) {
    console.error('Error in /api/channels:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints:`);
  console.log(`   GET /api/overview`);
  console.log(`   GET /api/sales-by-date`);
  console.log(`   GET /api/top-products`);
  console.log(`   GET /api/sales-by-channel`);
  console.log(`   GET /api/sales-by-hour`);
  console.log(`   GET /api/sales-by-weekday`);
  console.log(`   GET /api/top-customers`);
  console.log(`   GET /api/inactive-customers`);
  console.log(`   GET /api/stores`);
  console.log(`   GET /api/channels`);
});