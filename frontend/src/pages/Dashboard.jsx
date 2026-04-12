import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { Skeleton, Typography } from 'antd';
import StatCard from '../components/StatCard';
import { statsAPI } from '../services/api';

const { Title, Text } = Typography;

const COLORS = ['#006ce4', '#003580', '#febb02', '#22c55e', '#ef4444', '#8b5cf6'];

const BOOKING_TYPE_LABELS = {
  HOTEL: '🏨 Khách sạn',
  FLIGHT: '✈️ Máy bay',
  CAR_RENTAL: '🚗 Thuê xe',
  ATTRACTION: '🎢 Tham quan',
  TAXI: '🚕 Taxi',
  COMBO: '📦 Combo',
};

const formatVND = (val) => new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND', 
    maximumFractionDigits: 0 
}).format(val);

const Dashboard = () => {
  const [overview, setOverview] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [overviewRes, revenueRes, revTrendRes] = await Promise.all([
          statsAPI.getOverview(),
          statsAPI.getRevenueByCategory(),
          statsAPI.getRevenueTrend(),
        ]);
        setOverview(overviewRes.data);
        const labeled = revenueRes.data.map(d => ({
          ...d,
          name: BOOKING_TYPE_LABELS[d.name] || d.name,
        }));
        setRevenueData(labeled);
        setRevenueTrend(revTrendRes.data);
      } catch (err) {
        // Mock data
        setOverview({ 
            totalBookings: 128, 
            totalRevenue: 245000000, 
            totalUsers: 85, 
            bookingsByStatus: { CONFIRMED: 45, COMPLETED: 72, PENDING: 8, CANCELLED: 3 } 
        });
        setRevenueData([
          { name: '🏨 Khách sạn', value: 125000000 },
          { name: '✈️ Máy bay', value: 65000000 },
          { name: '🚗 Thuê xe', value: 35000000 },
          { name: '🎢 Tham quan', value: 15000000 },
          { name: '🚕 Taxi', value: 5000000 },
        ]);
        const dates = ['04-06', '04-07', '04-08', '04-09', '04-10', '04-11', '04-12'];
        setRevenueTrend(dates.map(d => ({ date: `2026-${d}`, revenue: Math.random() * 80000000 + 20000000 })));
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} active avatar paragraph={{ rows: 2 }} className="bg-white p-6 rounded-xl" />)}
        </div>
        <Skeleton active paragraph={{ rows: 8 }} className="bg-white p-8 rounded-xl" />
      </div>
    );
  }

  const statusData = overview?.bookingsByStatus
    ? Object.entries(overview.bookingsByStatus).map(([k, v]) => ({ name: k, value: v }))
    : [];

  return (
    <div className="space-y-8">
      <div>
        <Title level={2} style={{ margin: 0, fontWeight: 800 }}>Bảng điều khiển</Title>
        <Text type="secondary">Phân tích chuyên sâu về hiệu suất kinh doanh của bạn</Text>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Tổng đơn đặt" value={overview?.totalBookings ?? 0} icon="🎫" color="#006ce4" subtitle="Lượt đặt chỗ" />
        <StatCard title="Tổng doanh thu" value={formatVND(overview?.totalRevenue ?? 0)} icon="💰" color="#22c55e" subtitle="Thanh toán thành công" />
        <StatCard title="Người dùng" value={overview?.totalUsers ?? 0} icon="👥" color="#003580" subtitle="Thành viên đăng ký" />
        <StatCard title="Chờ xử lý" value={overview?.bookingsByStatus?.PENDING ?? 0} icon="⏳" color="#febb02" subtitle="Cần xác nhận ngay" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Revenue Chart */}
        <div className="lg:col-span-8 admin-card">
            <div className="flex justify-between items-center mb-6">
                <Title level={4} style={{ margin: 0 }}>Xu hướng doanh thu</Title>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#006ce4]"></span>
                    <Text className="text-xs font-bold text-gray-400">7 NGÀY QUA</Text>
                </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueTrend} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(str) => str.split('-').slice(1).reverse().join('/')} 
                    tick={{ fontSize: 12, fontWeight: 500, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fontWeight: 500, fill: '#9ca3af' }} 
                    tickFormatter={(val) => val >= 1000000 ? `${(val/1000000).toFixed(0)}tr` : val}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    formatter={(val) => formatVND(val)} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    name="Doanh thu" 
                    stroke="#006ce4" 
                    strokeWidth={4} 
                    dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} 
                    activeDot={{ r: 6, strokeWidth: 0 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
        </div>

        {/* Pie Chart */}
        <div className="lg:col-span-4 admin-card">
            <Title level={4} className="mb-6">Cơ cấu danh mục</Title>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={revenueData} 
                    cx="50%" 
                    cy="45%" 
                    innerRadius={60}
                    outerRadius={90} 
                    dataKey="value" 
                    paddingAngle={5}
                  >
                    {revenueData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => formatVND(val)} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
        </div>

        {/* Bar Chart */}
        <div className="lg:col-span-12 admin-card">
            <Title level={4} className="mb-6">Trạng thái đặt lịch</Title>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#f7f8fa' }} />
                  <Bar dataKey="value" name="Số lượng" radius={[8, 8, 0, 0]} barSize={40}>
                    {statusData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
