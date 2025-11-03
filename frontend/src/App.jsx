import { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import * as api from './api';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  const defaultFilters = {
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    storeIds: [],
    channelIds: []
  };
  
  const [currentFilters, setCurrentFilters] = useState(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
  const [productLimit, setProductLimit] = useState(10);
  const [appliedProductLimit, setAppliedProductLimit] = useState(10);

  const [stores, setStores] = useState([]);
  const [channels, setChannels] = useState([]);
  const [overview, setOverview] = useState(null);
  const [salesByDate, setSalesByDate] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [salesByChannel, setSalesByChannel] = useState([]);
  const [salesByHour, setSalesByHour] = useState([]);
  const [salesByWeekday, setSalesByWeekday] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [inactiveCustomers, setInactiveCustomers] = useState([]);

  useEffect(() => {
    loadFilters();
  }, []);

  useEffect(() => {
    loadData();
  }, [appliedFilters, activeTab, appliedProductLimit]);

  const loadFilters = async () => {
    try {
      const [storesData, channelsData] = await Promise.all([
        api.fetchStores(),
        api.fetchChannels()
      ]);
      setStores(storesData);
      setChannels(channelsData);
    } catch (error) {
      console.error('Error loading filters:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const [overviewData, salesData] = await Promise.all([
          api.fetchOverview(appliedFilters),
          api.fetchSalesByDate(appliedFilters)
        ]);
        setOverview(overviewData);
        setSalesByDate(salesData);
      } else if (activeTab === 'products') {
        const data = await api.fetchTopProducts(appliedFilters, appliedProductLimit);
        setTopProducts(data);
      } else if (activeTab === 'channels') {
        const data = await api.fetchSalesByChannel(appliedFilters);
        setSalesByChannel(data);
      } else if (activeTab === 'temporal') {
        const [hourData, weekdayData] = await Promise.all([
          api.fetchSalesByHour(appliedFilters),
          api.fetchSalesByWeekday(appliedFilters)
        ]);
        setSalesByHour(hourData);
        setSalesByWeekday(weekdayData);
      } else if (activeTab === 'customers') {
        const [topData, inactiveData] = await Promise.all([
          api.fetchTopCustomers(appliedFilters, 20),
          api.fetchInactiveCustomers(30)
        ]);
        setTopCustomers(topData);
        setInactiveCustomers(inactiveData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    setAppliedFilters(currentFilters);
  };

  const resetFilters = () => {
    setCurrentFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const StatCard = ({ title, value, subtitle, color = 'blue' }) => {
    const colorClasses = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      purple: 'text-purple-600',
      red: 'text-red-600'
    };

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-sm font-medium text-gray-600 mb-1">{title}</div>
        <div className={`text-3xl font-bold ${colorClasses[color]} mb-1`}>{value}</div>
        {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
      </div>
    );
  };

  const TabButton = ({ id, label, active }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 font-medium rounded-lg transition ${
        active
          ? 'bg-blue-600 text-white'
          : 'bg-white text-gray-700 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            🍔 Restaurant Analytics
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            God Level Coder Challenge - Plataforma de Analytics para Restaurantes
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Filtros</h2>
            <div className="flex gap-2">
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                Resetar
              </button>
              <button
                onClick={applyFilters}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Inicial
              </label>
              <input
                type="date"
                value={currentFilters.startDate}
                onChange={(e) => setCurrentFilters({ ...currentFilters, startDate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Final
              </label>
              <input
                type="date"
                value={currentFilters.endDate}
                onChange={(e) => setCurrentFilters({ ...currentFilters, endDate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lojas
              </label>
              <select
                multiple
                value={currentFilters.storeIds}
                onChange={(e) => setCurrentFilters({
                  ...currentFilters,
                  storeIds: Array.from(e.target.selectedOptions, option => Number(option.value))
                })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                size={3}
              >
                {stores.map(store => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Ctrl+Click para selecionar múltiplas</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Canais
              </label>
              <select
                multiple
                value={currentFilters.channelIds}
                onChange={(e) => setCurrentFilters({
                  ...currentFilters,
                  channelIds: Array.from(e.target.selectedOptions, option => Number(option.value))
                })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                size={3}
              >
                {channels.map(channel => (
                  <option key={channel.id} value={channel.id}>
                    {channel.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Ctrl+Click para selecionar múltiplos</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          <TabButton id="overview" label="📊 Overview" active={activeTab === 'overview'} />
          <TabButton id="products" label="🍕 Produtos" active={activeTab === 'products'} />
          <TabButton id="channels" label="📱 Canais" active={activeTab === 'channels'} />
          <TabButton id="temporal" label="⏰ Análise Temporal" active={activeTab === 'temporal'} />
          <TabButton id="customers" label="👥 Clientes" active={activeTab === 'customers'} />
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-xl text-gray-600">Carregando dados...</div>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && overview && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    title="Total de Vendas"
                    value={overview.total_sales}
                    subtitle={`${overview.completed_sales} completadas`}
                    color="blue"
                  />
                  <StatCard
                    title="Receita Total"
                    value={formatCurrency(overview.total_revenue)}
                    color="green"
                  />
                  <StatCard
                    title="Ticket Médio"
                    value={formatCurrency(overview.avg_ticket)}
                    color="purple"
                  />
                  <StatCard
                    title="Taxa de Cancelamento"
                    value={`${((overview.cancelled_sales / overview.total_sales) * 100).toFixed(1)}%`}
                    subtitle={`${overview.cancelled_sales} canceladas`}
                    color="red"
                  />
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Vendas ao Longo do Tempo</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={salesByDate}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(date) => format(new Date(date), 'dd/MM')}
                      />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip
                        labelFormatter={(date) => format(new Date(date), 'dd/MM/yyyy')}
                        formatter={(value, name) => [
                          name === 'revenue' ? formatCurrency(value) : value,
                          name === 'revenue' ? 'Receita' : 'Vendas'
                        ]}
                      />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="total_sales"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="Vendas"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="revenue"
                        stroke="#10b981"
                        strokeWidth={2}
                        name="Receita"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div className="space-y-6">
                {topProducts.length > 0 ? (
                  <>
                    <div className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Top Produtos</h3>
                        <div className="flex items-center gap-3">
                          <label className="text-sm font-medium text-gray-700">Mostrar Top:</label>
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={productLimit}
                            onChange={(e) => setProductLimit(Number(e.target.value))}
                            className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-center focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={() => setAppliedProductLimit(productLimit)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                          >
                            Atualizar
                          </button>
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={topProducts} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="product_name" type="category" width={200} />
                          <Tooltip formatter={(value) => formatCurrency(value)} />
                          <Legend />
                          <Bar dataKey="total_revenue" fill="#3b82f6" name="Receita Total" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="bg-white rounded-lg shadow overflow-hidden">
                      <div className="px-6 py-4 bg-gray-50 border-b">
                        <h3 className="text-lg font-semibold">Detalhamento dos Produtos</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Produto
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Qtd. Vendida
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Receita Total
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Preço Médio
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {topProducts.map((product, idx) => (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {product.product_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {product.total_quantity}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatCurrency(product.total_revenue)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatCurrency(product.avg_price)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-white rounded-lg shadow p-12 text-center">
                    <div className="text-gray-400 text-5xl mb-4">📦</div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      Nenhum produto encontrado
                    </h3>
                    <p className="text-gray-500">
                      Tente ajustar os filtros ou o período selecionado
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'channels' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">Receita por Canal</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={salesByChannel}
                          dataKey="revenue"
                          nameKey="channel_name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={(entry) => `${entry.channel_name}: ${formatCurrency(entry.revenue)}`}
                        >
                          {salesByChannel.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">Vendas por Canal</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={salesByChannel}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="channel_name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="total_sales" fill="#3b82f6" name="Total de Vendas" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b">
                    <h3 className="text-lg font-semibold">Análise Detalhada por Canal</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Canal
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Total Vendas
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Receita
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Ticket Médio
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Tempo Entrega (min)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {salesByChannel.map((channel, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {channel.channel_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {channel.total_sales}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(channel.revenue)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(channel.avg_ticket)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {channel.avg_delivery_minutes ? `${channel.avg_delivery_minutes} min` : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'temporal' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Vendas por Horário do Dia</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={salesByHour}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" tickFormatter={(hour) => `${hour}h`} />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(hour) => `${hour}:00`}
                        formatter={(value, name) => [
                          name === 'revenue' ? formatCurrency(value) : value,
                          name === 'revenue' ? 'Receita' : 'Vendas'
                        ]}
                      />
                      <Legend />
                      <Bar dataKey="total_sales" fill="#3b82f6" name="Vendas" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Vendas por Dia da Semana</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={salesByWeekday}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="weekday_name" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip
                        formatter={(value, name) => [
                          name === 'revenue' ? formatCurrency(value) : value,
                          name === 'revenue' ? 'Receita' : 'Vendas'
                        ]}
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="total_sales" fill="#3b82f6" name="Vendas" />
                      <Bar yAxisId="right" dataKey="revenue" fill="#10b981" name="Receita" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {activeTab === 'customers' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b">
                    <h3 className="text-lg font-semibold">Top 20 Clientes (Lifetime Value)</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Cliente
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Total Compras
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Lifetime Value
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Ticket Médio
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Última Compra
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {topCustomers.map((customer, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {customer.customer_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {customer.total_purchases}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(customer.lifetime_value)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(customer.avg_ticket)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {format(new Date(customer.last_purchase), 'dd/MM/yyyy')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-6 py-4 bg-red-50 border-b">
                    <h3 className="text-lg font-semibold text-red-900">
                      ⚠️ Clientes Inativos (30+ dias sem comprar)
                    </h3>
                    <p className="text-sm text-red-700 mt-1">
                      Clientes valiosos que compraram 3+ vezes mas não voltam há 30 dias
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Cliente
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Contato
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Total Compras
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Lifetime Value
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Dias Sem Comprar
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {inactiveCustomers.map((customer, idx) => (
                          <tr key={idx} className="hover:bg-red-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {customer.customer_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {customer.phone_number}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {customer.total_purchases}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(customer.lifetime_value)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                              {customer.days_since_purchase} dias
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;