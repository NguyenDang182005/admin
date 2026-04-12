import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

const { Title } = Typography;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = location.state?.from?.pathname || '/';

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      message.success('Login successful!');
      navigate(from, { replace: true });
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Login failed. Please try again.';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f2f2f2',
      padding: '20px'
    }}>
      <Card style={{ width: 400, borderRadius: 8, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', border: '1px solid #e5e7eb' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ marginBottom: 8, color: '#003580' }}>Dashboard Quản trị</Title>
          <p style={{ color: '#5b616e' }}>Booking.com Admin Panel</p>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please enter your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Email" 
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please enter your password!' }]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Password" 
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Log in
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <a href="/" style={{ color: '#006ce4', fontWeight: 600 }}>← Trở về trang chủ Booking</a>
        </div>
      </Card>
    </div>
  );
}