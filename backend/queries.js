const db = require('./db');

// Overview geral
const getOverview = async (startDate, endDate, storeIds, channelIds) => {
  const storeFilter = storeIds?.length ? 'AND s.store_id = ANY($3::int[])' : '';
  const channelFilter = channelIds?.length ? 'AND s.channel_id = ANY($4::int[])' : '';

  const query = `
    SELECT 
      COUNT(*) as total_sales,
      COUNT(*) FILTER (WHERE sale_status_desc = 'COMPLETED') as completed_sales,
      COUNT(*) FILTER (WHERE sale_status_desc = 'CANCELLED') as cancelled_sales,
      ROUND(AVG(total_amount) FILTER (WHERE sale_status_desc = 'COMPLETED')::numeric, 2) as avg_ticket,
      ROUND(SUM(total_amount) FILTER (WHERE sale_status_desc = 'COMPLETED')::numeric, 2) as total_revenue,
      ROUND(SUM(total_discount) FILTER (WHERE sale_status_desc = 'COMPLETED')::numeric, 2) as total_discounts
    FROM sales s
    WHERE s.created_at >= $1 
      AND s.created_at <= $2
      ${storeFilter}
      ${channelFilter}
  `;

  const params = [startDate, endDate];
  if (storeIds?.length) params.push(storeIds);
  if (channelIds?.length) params.push(channelIds);

  const result = await db.query(query, params);
  return result.rows[0];
};

// Vendas ao longo do tempo
const getSalesByDate = async (startDate, endDate, storeIds, channelIds) => {
  const storeFilter = storeIds?.length ? 'AND s.store_id = ANY($3::int[])' : '';
  const channelFilter = channelIds?.length ? 'AND s.channel_id = ANY($4::int[])' : '';

  const query = `
    SELECT 
      DATE(s.created_at) as date,
      COUNT(*) FILTER (WHERE sale_status_desc = 'COMPLETED') as total_sales,
      ROUND(SUM(total_amount) FILTER (WHERE sale_status_desc = 'COMPLETED')::numeric, 2) as revenue
    FROM sales s
    WHERE s.created_at >= $1 
      AND s.created_at <= $2
      ${storeFilter}
      ${channelFilter}
    GROUP BY DATE(s.created_at)
    ORDER BY date
  `;

  const params = [startDate, endDate];
  if (storeIds?.length) params.push(storeIds);
  if (channelIds?.length) params.push(channelIds);

  const result = await db.query(query, params);
  return result.rows;
};

// Top produtos
const getTopProducts = async (startDate, endDate, storeIds, channelIds, limit = 10) => {
  const storeFilter = storeIds?.length ? 'AND s.store_id = ANY($3::int[])' : '';
  const channelFilter = channelIds?.length ? 'AND s.channel_id = ANY($4::int[])' : '';

  const query = `
    SELECT 
      p.name as product_name,
      COUNT(ps.id) as times_sold,
      ROUND(SUM(ps.quantity)::numeric, 2) as total_quantity,
      ROUND(SUM(ps.total_price)::numeric, 2) as total_revenue,
      ROUND(AVG(ps.total_price)::numeric, 2) as avg_price
    FROM product_sales ps
    JOIN products p ON p.id = ps.product_id
    JOIN sales s ON s.id = ps.sale_id
    WHERE s.sale_status_desc = 'COMPLETED'
      AND s.created_at >= $1 
      AND s.created_at <= $2
      ${storeFilter}
      ${channelFilter}
    GROUP BY p.id, p.name
    ORDER BY total_revenue DESC
    LIMIT $${storeIds?.length && channelIds?.length ? 5 : storeIds?.length || channelIds?.length ? 4 : 3}
  `;

  const params = [startDate, endDate, limit];
  if (storeIds?.length) params.splice(2, 0, storeIds);
  if (channelIds?.length) params.splice(storeIds?.length ? 3 : 2, 0, channelIds);

  const result = await db.query(query, params);
  return result.rows;
};

// Performance por canal
const getSalesByChannel = async (startDate, endDate, storeIds) => {
  const storeFilter = storeIds?.length ? 'AND s.store_id = ANY($3::int[])' : '';

  const query = `
    SELECT 
      c.name as channel_name,
      c.type as channel_type,
      COUNT(*) FILTER (WHERE s.sale_status_desc = 'COMPLETED') as total_sales,
      ROUND(SUM(s.total_amount) FILTER (WHERE s.sale_status_desc = 'COMPLETED')::numeric, 2) as revenue,
      ROUND(AVG(s.total_amount) FILTER (WHERE s.sale_status_desc = 'COMPLETED')::numeric, 2) as avg_ticket,
      ROUND(AVG(s.delivery_seconds / 60.0) FILTER (WHERE s.sale_status_desc = 'COMPLETED' AND s.delivery_seconds IS NOT NULL)::numeric, 1) as avg_delivery_minutes
    FROM sales s
    JOIN channels c ON c.id = s.channel_id
    WHERE s.created_at >= $1 
      AND s.created_at <= $2
      ${storeFilter}
    GROUP BY c.id, c.name, c.type
    ORDER BY revenue DESC
  `;

  const params = [startDate, endDate];
  if (storeIds?.length) params.push(storeIds);

  const result = await db.query(query, params);
  return result.rows;
};

// Vendas por horário
const getSalesByHour = async (startDate, endDate, storeIds, channelIds) => {
  const storeFilter = storeIds?.length ? 'AND s.store_id = ANY($3::int[])' : '';
  const channelFilter = channelIds?.length ? 'AND s.channel_id = ANY($4::int[])' : '';

  const query = `
    SELECT 
      EXTRACT(HOUR FROM s.created_at)::int as hour,
      COUNT(*) FILTER (WHERE sale_status_desc = 'COMPLETED') as total_sales,
      ROUND(SUM(total_amount) FILTER (WHERE sale_status_desc = 'COMPLETED')::numeric, 2) as revenue
    FROM sales s
    WHERE s.created_at >= $1 
      AND s.created_at <= $2
      AND s.sale_status_desc = 'COMPLETED'
      ${storeFilter}
      ${channelFilter}
    GROUP BY hour
    ORDER BY hour
  `;

  const params = [startDate, endDate];
  if (storeIds?.length) params.push(storeIds);
  if (channelIds?.length) params.push(channelIds);

  const result = await db.query(query, params);
  return result.rows;
};

// Vendas por dia da semana
const getSalesByWeekday = async (startDate, endDate, storeIds, channelIds) => {
  const storeFilter = storeIds?.length ? 'AND s.store_id = ANY($3::int[])' : '';
  const channelFilter = channelIds?.length ? 'AND s.channel_id = ANY($4::int[])' : '';

  const query = `
    SELECT 
      EXTRACT(DOW FROM s.created_at)::int as weekday,
      CASE EXTRACT(DOW FROM s.created_at)::int
        WHEN 0 THEN 'Domingo'
        WHEN 1 THEN 'Segunda'
        WHEN 2 THEN 'Terça'
        WHEN 3 THEN 'Quarta'
        WHEN 4 THEN 'Quinta'
        WHEN 5 THEN 'Sexta'
        WHEN 6 THEN 'Sábado'
      END as weekday_name,
      COUNT(*) FILTER (WHERE sale_status_desc = 'COMPLETED') as total_sales,
      ROUND(SUM(total_amount) FILTER (WHERE sale_status_desc = 'COMPLETED')::numeric, 2) as revenue
    FROM sales s
    WHERE s.created_at >= $1 
      AND s.created_at <= $2
      ${storeFilter}
      ${channelFilter}
    GROUP BY weekday, weekday_name
    ORDER BY weekday
  `;

  const params = [startDate, endDate];
  if (storeIds?.length) params.push(storeIds);
  if (channelIds?.length) params.push(channelIds);

  const result = await db.query(query, params);
  return result.rows;
};

// Clientes frequentes
const getTopCustomers = async (startDate, endDate, limit = 20) => {
  const query = `
    SELECT 
      c.customer_name,
      c.email,
      COUNT(s.id) as total_purchases,
      ROUND(SUM(s.total_amount)::numeric, 2) as lifetime_value,
      ROUND(AVG(s.total_amount)::numeric, 2) as avg_ticket,
      MAX(s.created_at) as last_purchase
    FROM customers c
    JOIN sales s ON s.customer_id = c.id
    WHERE s.sale_status_desc = 'COMPLETED'
      AND s.created_at >= $1 
      AND s.created_at <= $2
    GROUP BY c.id, c.customer_name, c.email
    ORDER BY lifetime_value DESC
    LIMIT $3
  `;

  const result = await db.query(query, [startDate, endDate, limit]);
  return result.rows;
};

// Clientes inativos (não compram há 30+ dias)
const getInactiveCustomers = async (days = 30) => {
  const query = `
    SELECT 
      c.customer_name,
      c.email,
      c.phone_number,
      COUNT(s.id) as total_purchases,
      ROUND(SUM(s.total_amount)::numeric, 2) as lifetime_value,
      MAX(s.created_at) as last_purchase,
      EXTRACT(DAY FROM NOW() - MAX(s.created_at))::int as days_since_purchase
    FROM customers c
    JOIN sales s ON s.customer_id = c.id
    WHERE s.sale_status_desc = 'COMPLETED'
    GROUP BY c.id, c.customer_name, c.email, c.phone_number
    HAVING MAX(s.created_at) < NOW() - INTERVAL '1 day' * $1
      AND COUNT(s.id) >= 3
    ORDER BY lifetime_value DESC
    LIMIT 50
  `;

  const result = await db.query(query, [days]);
  return result.rows;
};

// Listar lojas
const getStores = async () => {
  const query = `
    SELECT id, name, city, state, is_active
    FROM stores
    WHERE is_active = true
    ORDER BY name
  `;
  const result = await db.query(query);
  return result.rows;
};

// Listar canais
const getChannels = async () => {
  const query = `
    SELECT id, name, type
    FROM channels
    ORDER BY name
  `;
  const result = await db.query(query);
  return result.rows;
};

module.exports = {
  getOverview,
  getSalesByDate,
  getTopProducts,
  getSalesByChannel,
  getSalesByHour,
  getSalesByWeekday,
  getTopCustomers,
  getInactiveCustomers,
  getStores,
  getChannels
};