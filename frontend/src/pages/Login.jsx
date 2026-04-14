import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, Button, Card, message, Typography, Space } from 'antd';
import { UserOutlined, LockOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
const { Title, Text } = Typography;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const NAVY = '#003580';
  const BLUE = '#006ce4';

  const from = location.state?.from?.pathname || '/';

  const onFinish = async (values) => {
    setLoading(true);
    setErrorMsg('');
    try {
      await login(values.email, values.password);
      message.success('Đăng nhập thành công!');
      navigate(from, { replace: true });
    } catch (error) {
      const msg = error.response?.data?.message || 'Email hoặc mật khẩu không chính xác. Vui lòng thử lại.';
      setErrorMsg(msg);
      message.error(msg);
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
      padding: '20px',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div className="w-full max-w-[420px]">
        <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#003580] flex items-center justify-center text-white font-black">B.</div>
                <Title level={3} style={{ margin: 0, color: NAVY, fontWeight: 800 }}>Booking Admin</Title>
            </div>
            <p className="text-gray-500 font-medium">Hệ thống quản lý đặt phòng toàn cầu</p>
        </div>

        <Card 
            bordered={false} 
            className="rounded-2xl shadow-xl overflow-hidden" 
            styles={{ body: { padding: '40px 32px' } }}
        >
          <div className="mb-8">
            <Title level={4} style={{ marginBottom: 4, fontWeight: 700 }}>Chào mừng trở lại</Title>
            <Text type="secondary">Nhập thông tin quản trị viên của bạn</Text>
          </div>

          <Form
            name="login"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
            size="large"
            requiredMark={false}
          >
            <Form.Item
              name="email"
              label={<Text strong className="text-xs uppercase tracking-wider text-gray-500">ĐỊA CHỈ EMAIL</Text>}
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' }
              ]}
            >
              <Input 
                placeholder="admin@example.com" 
                className="rounded-xl border-gray-200"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<Text strong className="text-xs uppercase tracking-wider text-gray-500">MẬT KHẨU</Text>}
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password 
                placeholder="••••••••" 
                className="rounded-xl border-gray-200"
              />
            </Form.Item>

            <Form.Item className="mt-8 mb-0">
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading} 
                block 
                style={{ 
                    background: BLUE, 
                    height: 50, 
                    borderRadius: 12, 
                    fontWeight: 700,
                    fontSize: 16
                }}
              >
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>

          {errorMsg && (
            <div className="flex items-start gap-2.5 mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200">
              <i className="fa-solid fa-circle-exclamation text-red-500 mt-0.5 shrink-0"></i>
              <div>
                <p className="text-sm font-bold text-red-700 leading-tight">Không thể đăng nhập</p>
                <p className="text-sm text-red-600 mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <a
              href="http://localhost:5173"
              className="text-gray-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <ArrowLeftOutlined style={{ fontSize: 12 }} />
              Quay lại trang Demo
            </a>
          </div>
        </Card>
        
        <p className="text-center mt-8 text-gray-400 text-xs font-medium">
            Phần mềm thuộc bản quyền Booking.com © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}