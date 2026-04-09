import React, { useEffect, useState } from 'react';
import { Grid, Skeleton, Box, Typography } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import StatCard from '../components/StatCard';
import { statsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const BOOKING_TYPE_LABELS = {
  HOTEL: '🏨 Khách sạn',
  FLIGHT: '✈️ Máy bay',
  CAR_RENTAL: '🚗 Thuê xe',
  ATTRACTION: '🎢 Tham quan',
  TAXI: '🚕 Taxi',
  COMBO: '📦 Combo',
};

const formatVND = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val);

const Dashboard = () => {
  const [overview, setOverview] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [bookingsTrend, setBookingsTrend] = useState([]);
  const [confirmedTrend, setConfirmedTrend] = useState([]);
  const [usersTrend, setUsersTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [overviewRes, revenueRes, revTrendRes, bookTrendRes, confTrendRes, userTrendRes] = await Promise.all([
          statsAPI.getOverview(),
          statsAPI.getRevenueByCategory(),
          statsAPI.getRevenueTrend(),
          statsAPI.getBookingsTrend(),
          statsAPI.getConfirmedTrend(),
          statsAPI.getUsersTrend(),
        ]);
        setOverview(overviewRes.data);
        const labeled = revenueRes.data.map(d => ({
          ...d,
          name: BOOKING_TYPE_LABELS[d.name] || d.name,
        }));
        setRevenueData(labeled);
        setRevenueTrend(revTrendRes.data);
        setBookingsTrend(bookTrendRes.data);
        setConfirmedTrend(confTrendRes.data);
        setUsersTrend(userTrendRes.data);
      } catch (err) {
        // Use mock data if backend not running
        setOverview({ totalBookings: 30, totalRevenue: 97650000, totalUsers: 20, bookingsByStatus: { CONFIRMED: 15, COMPLETED: 12, PENDING: 2, CANCELLED: 1 } });
        setRevenueData([
          { name: '🏨 Khách sạn', value: 46500000 },
          { name: '✈️ Máy bay', value: 14800000 },
          { name: '🚗 Thuê xe', value: 18350000 },
          { name: '🎢 Tham quan', value: 6480000 },
          { name: '🚕 Taxi', value: 2450000 },
        ]);
        // Mock data for trends
        const dates = ['03-25', '03-26', '03-27', '03-28', '03-29', '03-30', '03-31'];
        setRevenueTrend(dates.map(d => ({ date: `2026-${d}`, revenue: Math.random() * 50000000 })));
        setBookingsTrend(dates.map(d => ({ date: `2026-${d}`, count: Math.floor(Math.random() * 20) + 10 })));
        setConfirmedTrend(dates.map(d => ({ date: `2026-${d}`, count: Math.floor(Math.random() * 15) + 5 })));
        setUsersTrend(dates.map(d => ({ date: `2026-${d}`, count: Math.floor(Math.random() * 5) + 2 })));
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map(i => <Grid item xs={12} sm={6} md={3} key={i}><Skeleton variant="rounded" height={120} /></Grid>)}
        <Grid item xs={12} md={6}><Skeleton variant="rounded" height={380} /></Grid>
        <Grid item xs={12} md={6}><Skeleton variant="rounded" height={380} /></Grid>
      </Grid>
    );
  }

  const statusData = overview?.bookingsByStatus
    ? Object.entries(overview.bookingsByStatus).map(([k, v]) => ({ name: k, value: v }))
    : [];

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} color="text.primary" mb={3}>
        📊 Tổng quan hệ thống
      </Typography>

      {/* Stat Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Tổng đặt chỗ" value={overview?.totalBookings ?? 0} icon="🎫" color="#6366f1" subtitle="Tất cả dịch vụ" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Doanh thu" value={formatVND(overview?.totalRevenue ?? 0)} icon="💰" color="#10b981" subtitle="Tổng cộng" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Người dùng" value={overview?.totalUsers ?? 0} icon="👥" color="#06b6d4" subtitle="Đã đăng ký" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Đã xác nhận"
            value={overview?.bookingsByStatus?.CONFIRMED ?? 0}
            icon="✅"
            color="#f59e0b"
            subtitle="Đang chờ thực hiện"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Box sx={{ background: '#fff', borderRadius: 3, p: 3, border: '1px solid #f0f0f0' }}>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>Doanh thu theo loại dịch vụ</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={revenueData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                  {revenueData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => formatVND(val)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Grid>

        <Grid item xs={12} md={7}>
          <Box sx={{ background: '#fff', borderRadius: 3, p: 3, border: '1px solid #f0f0f0' }}>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>Trạng thái đặt chỗ</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" name="Số lượng" radius={[4, 4, 0, 0]}>
                  {statusData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ background: '#fff', borderRadius: 3, p: 3, border: '1px solid #f0f0f0' }}>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>📈 Xu hướng doanh thu (7 ngày qua)</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueTrend} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" tickFormatter={(str) => str.split('-').slice(1).reverse().join('/')} tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(val) => val >= 1000000 ? `${val/1000000}M` : val} />
                <Tooltip formatter={(val) => formatVND(val)} />
                <Line type="monotone" dataKey="revenue" name="Doanh thu" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box sx={{ background: '#fff', borderRadius: 3, p: 3, border: '1px solid #f0f0f0' }}>
            <Typography variant="subtitle2" fontWeight={600} mb={2}>🎫 Xu hướng đặt chỗ</Typography>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={bookingsTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" tickFormatter={(str) => str.split('-')[2]} tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="step" dataKey="count" name="Số đơn" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box sx={{ background: '#fff', borderRadius: 3, p: 3, border: '1px solid #f0f0f0' }}>
            <Typography variant="subtitle2" fontWeight={600} mb={2}>✅ Đơn thành công</Typography>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={confirmedTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" tickFormatter={(str) => str.split('-')[2]} tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" name="Số đơn" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box sx={{ background: '#fff', borderRadius: 3, p: 3, border: '1px solid #f0f0f0' }}>
            <Typography variant="subtitle2" fontWeight={600} mb={2}>👥 Người dùng mới</Typography>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={usersTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" tickFormatter={(str) => str.split('-')[2]} tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" name="Số người" stroke="#06b6d4" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
