import React, { useState, useEffect } from 'react';
import { Layout, Menu, Typography, Avatar, Badge, Space, Button, Dropdown, message, Drawer, List, Tag, Empty, Spin } from 'antd';
import {
  DashboardOutlined,
  PictureOutlined,
  SettingOutlined,
  BellOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CalendarOutlined,
  TeamOutlined,
  LogoutOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ControlOutlined
} from '@ant-design/icons';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import dayjs from 'dayjs';

const { Header, Content, Sider, Footer } = Layout;
const { Text, Title } = Typography;

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/bookings', icon: <CalendarOutlined />, label: 'Quản lý đặt chỗ' },
  { key: '/data', icon: <ControlOutlined />, label: 'Quản lý dữ liệu động' },
  { key: '/users', icon: <TeamOutlined />, label: 'Quản lý người dùng' },
  { key: '/gallery', icon: <PictureOutlined />, label: 'Thư viện ảnh' },
  { key: '/settings', icon: <SettingOutlined />, label: 'Cấu hình hệ thống' },
];

const AdminLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const NAVY = '#003580';
  const BLUE = '#006ce4';

  const unreadCount = notifications.filter(n => !n.read).length;

  const fetchNotifications = async () => {
    setNotifLoading(true);
    try {
      // Try to get recent pending bookings as notifications
      const res = await fetch('/api/admin/bookings?page=0&size=5&status=PENDING', {
        headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        const items = (data.content || []).map(b => ({
          id: b.id,
          type: 'pending',
          title: `Đơn đặt chỗ #${b.id} chờ xử lý`,
          desc: `Dịch vụ: ${b.bookingType || 'N/A'} — ${b.totalPrice ? Number(b.totalPrice).toLocaleString('vi-VN') + ' VND' : ''}`,
          time: b.createdAt,
          read: false,
        }));
        setNotifications(items);
      }
    } catch {
      // Fallback mock
      setNotifications([
        { id: 1, type: 'pending', title: 'Đơn #128 chờ xác nhận', desc: 'Khách sạn — 2.400.000 VND', time: new Date().toISOString(), read: false },
        { id: 2, type: 'success', title: 'Đơn #127 đã hoàn thành', desc: 'Chuyến bay — 1.800.000 VND', time: new Date(Date.now() - 3600000).toISOString(), read: true },
        { id: 3, type: 'pending', title: 'Đơn #126 chờ xác nhận', desc: 'Thuê xe — 900.000 VND', time: new Date(Date.now() - 7200000).toISOString(), read: false },
      ]);
    } finally {
      setNotifLoading(false);
    }
  };

  const handleBellClick = () => {
    setNotifOpen(true);
    fetchNotifications();
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleLogout = () => {
    logout();
    message.success('Đã đăng xuất thành công');
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: user?.fullName || user?.email || 'Quản trị viên',
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f2f2f2' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        width={260}
        className="admin-sidebar"
        style={{ 
          position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100,
          background: NAVY 
        }}
      >
        <Link
          to="/"
          style={{
            height: 64,
            display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? 0 : '0 24px',
            background: '#002964',
            gap: 12,
            textDecoration: 'none',
            transition: 'background 0.2s',
          }}
          onMouseOver={e => e.currentTarget.style.background = '#001f4d'}
          onMouseOut={e => e.currentTarget.style.background = '#002964'}
        >
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-xl">
             <span style={{ color: BLUE }}>B.</span>
          </div>
          {!collapsed && (
            <Title level={4} style={{ color: '#fff', margin: 0, fontSize: 18, fontWeight: 800 }}>
              Booking Admin
            </Title>
          )}
        </Link>
        
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ 
            background: 'transparent',
            marginTop: 16,
            padding: '0 8px'
          }}
          className="admin-nav-menu"
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 260, transition: 'margin-left 0.2s', background: '#f2f2f2' }}>
        <Header style={{
          position: 'sticky', top: 0, zIndex: 99,
          background: '#ffffff',
          padding: '0 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: 64,
          borderBottom: '1px solid rgba(91,97,110,0.12)',
        }}>
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 18, color: '#5b616e' }}
            />
            <Text className="hidden md:block text-gray-400 font-medium text-xs">
              Mã dự án: <span className="text-gray-900">booking-df1c3</span>
            </Text>
          </div>

          <Space size={24}>
            <Badge count={unreadCount} size="small" offset={[-2, 2]}>
              <Button
                type="text"
                icon={<BellOutlined style={{ fontSize: 20, color: '#5b616e' }} />}
                onClick={handleBellClick}
              />
            </Badge>
            
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
              <Space style={{ cursor: 'pointer' }} className="hover:bg-gray-50 px-2 py-1 rounded-lg transition-colors">
                <Avatar 
                    size="small" 
                    src={user?.avatar || null} 
                    icon={!user?.avatar && <UserOutlined />} 
                    style={{ backgroundColor: BLUE }} 
                />
                <div className="hidden sm:flex flex-col items-start leading-none">
                  <Text strong style={{ fontSize: 13, color: '#1a1a1a' }}>{user?.fullName || 'Admin'}</Text>
                  <Text style={{ fontSize: 11, color: '#5b616e' }}>Chủ sở hữu</Text>
                </div>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content style={{ 
            padding: '32px 24px', 
            maxWidth: 1600, 
            margin: '0 auto', 
            width: '100%' 
        }}>
          {children}
        </Content>

        <Footer style={{ 
            textAlign: 'center', 
            color: '#5b616e', 
            background: 'transparent', 
            padding: '24px',
            fontSize: 12,
            fontWeight: 500
        }}>
          Hệ thống Quản lý Booking.com © {new Date().getFullYear()} — Powered by Antigravity Design System
        </Footer>
      </Layout>

      {/* Notification Drawer */}
      <Drawer
        title={
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-900">Thông báo {unreadCount > 0 && <Tag color="blue" className="ml-2">{unreadCount} mới</Tag>}</span>
            {unreadCount > 0 && (
              <Button type="link" size="small" onClick={markAllRead} className="text-[#006ce4] font-medium">
                Đánh dấu đã đọc
              </Button>
            )}
          </div>
        }
        placement="right"
        onClose={() => setNotifOpen(false)}
        open={notifOpen}
        width={380}
        styles={{ body: { padding: 0 } }}
      >
        <Spin spinning={notifLoading}>
          {notifications.length === 0 && !notifLoading ? (
            <div className="flex items-center justify-center h-48">
              <Empty description="Không có thông báo mới" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </div>
          ) : (
            <List
              dataSource={notifications}
              renderItem={(item) => (
                <List.Item
                  key={item.id}
                  className={`px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-50 ${!item.read ? 'bg-blue-50/40' : ''}`}
                  onClick={() => {
                    setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, read: true } : n));
                    navigate('/bookings');
                    setNotifOpen(false);
                  }}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className="mt-0.5 shrink-0">
                      {item.type === 'pending'
                        ? <ExclamationCircleOutlined style={{ color: '#f59e0b', fontSize: 18 }} />
                        : <CheckCircleOutlined style={{ color: '#22c55e', fontSize: 18 }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`font-semibold text-sm leading-tight truncate ${!item.read ? 'text-gray-900' : 'text-gray-500'}`}>{item.title}</p>
                        {!item.read && <span className="w-2 h-2 rounded-full bg-[#006ce4] shrink-0"></span>}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{item.desc}</p>
                      <p className="text-[11px] text-gray-300 mt-1 flex items-center gap-1">
                        <ClockCircleOutlined style={{ fontSize: 10 }} />
                        {item.time ? dayjs(item.time).format('HH:mm DD/MM/YYYY') : ''}
                      </p>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          )}
        </Spin>
      </Drawer>
    </Layout>
  );
};

export default AdminLayout;