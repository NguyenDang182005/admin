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
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Header, Content, Sider, Footer } = Layout;
const { Text, Title } = Typography;

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
  const NAVY = '#003580';
  const BLUE = '#006ce4';

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
        <div style={{
          height: 64,
          display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? 0 : '0 24px',
          background: '#002964', // Slightly darker navy for logo area
          gap: 12,
        }}>
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-xl">
             <span style={{ color: BLUE }}>B.</span>
          </div>
          {!collapsed && (
            <Title level={4} style={{ color: '#fff', margin: 0, fontSize: 18, fontWeight: 800 }}>
              Booking Admin
            </Title>
          )}
        </div>
        
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
            <Badge dot color={BLUE}>
              <Button type="text" icon={<BellOutlined style={{ fontSize: 20, color: '#5b616e' }} />} />
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
    </Layout>
  );
};

export default AdminLayout;