import React, { useState } from 'react';
import { Layout, Menu, Typography, Avatar, Badge, Space, Button, Dropdown, message } from 'antd';
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
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Header, Content, Sider, Footer } = Layout;
const { Text } = Typography;

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/bookings', icon: <CalendarOutlined />, label: 'Quản lý đặt chỗ' },
  { key: '/users', icon: <TeamOutlined />, label: 'Quản lý người dùng' },
  { key: '/gallery', icon: <PictureOutlined />, label: 'Thư viện ảnh' },
  { key: '/settings', icon: <SettingOutlined />, label: 'Cấu hình hệ thống' },
];

const AdminLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    message.success('Logged out successfully');
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: user?.fullName || user?.email || 'Admin',
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="dark"
        width={230}
        style={{ position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100 }}
      >
        <div style={{
          height: 64,
          display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? 0 : '0 20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          gap: 10,
        }}>
          <span style={{ fontSize: 22 }}>⚙️</span>
          {!collapsed && (
            <Text strong style={{ color: '#fff', fontSize: 16, whiteSpace: 'nowrap' }}>
              Admin Panel
            </Text>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ marginTop: 8 }}
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 230, transition: 'margin-left 0.2s' }}>
        <Header style={{
          position: 'sticky', top: 0, zIndex: 99,
          background: '#fff',
          padding: '0 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
          borderBottom: '1px solid #f0f0f0',
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 18 }}
          />
          <Space size={16}>
            <Badge count={3} size="small">
              <Button type="text" icon={<BellOutlined style={{ fontSize: 18 }} />} />
            </Badge>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#6366f1' }} />
                <Text strong style={{ color: '#374151' }}>{user?.fullName || 'Admin'}</Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content style={{ margin: '24px', minHeight: 'calc(100vh - 112px)' }}>
          {children}
        </Content>

        <Footer style={{ textAlign: 'center', color: '#9ca3af', background: 'transparent', padding: '12px 24px' }}>
          Admin Panel © {new Date().getFullYear()} — Booking Management System
        </Footer>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;