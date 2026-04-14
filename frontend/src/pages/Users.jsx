import { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, Input, Select, Modal, message, Typography, Popconfirm, Avatar } from 'antd';
import { SearchOutlined, DeleteOutlined, EditOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const roleColors = {
  ADMIN: 'red',
  OWNER: 'blue',
  CUSTOMER: 'green',
};

const roleLabels = {
  ADMIN: 'Quản trị viên',
  OWNER: 'Chủ khách sạn',
  CUSTOMER: 'Khách hàng',
};

export default function Users() {
  const { api } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({ role: '', search: '' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [editVisible, setEditVisible] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: '', role: '' });

  const fetchUsers = async (page = 1, size = 10) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page - 1);
      params.append('size', size);
      if (filters.role) params.append('role', filters.role);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get(`/users?${params.toString()}`);
      setUsers(response.data.content);
      setPagination({
        current: response.data.currentPage + 1,
        pageSize: response.data.size,
        total: response.data.totalElements,
      });
    } catch (error) {
      message.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [filters.role, filters.search]);

  const handleTableChange = (pag) => {
    fetchUsers(pag.current, pag.pageSize);
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}`, { role: newRole });
      message.success('Cập nhật vai trò thành công');
      fetchUsers(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('Lỗi khi cập nhật vai trò');
    }
  };

  const handleDelete = async (userId) => {
    try {
      await api.delete(`/users/${userId}`);
      message.success('Đã xóa người dùng');
      fetchUsers(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('Lỗi khi xóa người dùng');
    }
  };

  const openEdit = (user) => {
    setSelectedUser(user);
    setEditForm({ fullName: user.fullName || '', role: user.role || '' });
    setEditVisible(true);
  };

  const handleEditSave = async () => {
    try {
      await api.put(`/users/${selectedUser.id}`, editForm);
      message.success('Cập nhật thông tin thành công');
      setEditVisible(false);
      fetchUsers(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('Lỗi khi cập nhật thông tin');
    }
  };

  const columns = [
    {
      title: 'NGƯỜI DÙNG',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text, record) => (
        <Space size={12}>
          <Avatar 
            size={40} 
            src={record.avatar} 
            icon={<UserOutlined />} 
            style={{ backgroundColor: '#006ce4', border: '2px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} 
          />
          <div className="flex flex-col">
            <Text strong className="text-gray-900 leading-tight">{text || 'N/A'}</Text>
            <Text className="text-xs text-gray-400 font-medium lowercase">#{record.id} • {record.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'LIÊN HỆ',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      render: (phone) => <Text className="font-medium text-gray-500">{phone || '-'}</Text>,
    },
    {
      title: 'VAI TRÒ',
      dataIndex: 'role',
      key: 'role',
      render: (role, record) => (
        <Select
          variant="borderless"
          value={role}
          style={{ width: 140 }}
          className={`rounded-lg font-bold ${
            role === 'ADMIN' ? 'bg-red-50 text-red-600' :
            role === 'OWNER' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
          }`}
          onChange={(value) => handleRoleChange(record.id, value)}
          onClick={(e) => e.stopPropagation()}
        >
          <Option value="ADMIN">ADMIN</Option>
          <Option value="OWNER">OWNER</Option>
          <Option value="CUSTOMER">CUSTOMER</Option>
        </Select>
      ),
    },
    {
      title: 'NGÀY THAM GIA',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (
        <div className="text-xs text-gray-500 font-bold">
            {date ? dayjs(date).format('DD/MM/YYYY') : '-'}
        </div>
      ),
    },
    {
      title: 'THAO TÁC',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EditOutlined className="text-gray-400 hover:text-blue-500" />} onClick={() => openEdit(record)} />
          <Popconfirm
            title="Xóa người dùng này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <Title level={2} style={{ margin: 0, fontWeight: 800 }}>Quản lý người dùng</Title>
            <Text type="secondary">Quản lý và cấp quyền truy cập cho hành khách và chủ nhà</Text>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <Select
              placeholder="Lọc vai trò"
              style={{ width: 160 }}
              allowClear
              className="rounded-xl"
              value={filters.role || undefined}
              onChange={(value) => setFilters({ ...filters, role: value || '' })}
            >
              <Option value="ADMIN">ADMIN</Option>
              <Option value="OWNER">OWNER</Option>
              <Option value="CUSTOMER">CUSTOMER</Option>
            </Select>
            <Input
              placeholder="Tìm theo tên, email..."
              prefix={<SearchOutlined className="text-gray-400" />}
              className="rounded-xl w-full md:w-64"
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
      </div>

      <div className="admin-table-container shadow-sm border border-gray-100">
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          className="user-table"
        />
      </div>

      <Modal
        title={
            <div className="pb-4 border-b border-gray-100 mb-6">
                <Title level={4} style={{ margin: 0 }}>Cập nhật Người dùng</Title>
            </div>
        }
        open={editVisible}
        onCancel={() => setEditVisible(false)}
        onOk={handleEditSave}
        okText="Cập nhật ngay"
        cancelText="Bỏ qua"
        className="rounded-2xl overflow-hidden"
        okButtonProps={{ 
            style: { background: '#006ce4', height: 40, borderRadius: 8, fontWeight: 700 } 
        }}
      >
        <div className="space-y-6 py-2">
          <div className="space-y-2">
            <Text strong className="text-xs uppercase tracking-widest text-gray-400">HỌ VÀ TÊN</Text>
            <Input 
              size="large"
              placeholder="Nhập họ tên mới"
              className="rounded-xl border-gray-200"
              value={editForm.fullName} 
              onChange={(e) => setEditForm({...editForm, fullName: e.target.value})} 
            />
          </div>
          
          <div className="space-y-2">
            <Text strong className="text-xs uppercase tracking-widest text-gray-400">QUYỀN TRUY CẬP</Text>
            <Select 
              size="large"
              value={editForm.role} 
              onChange={(value) => setEditForm({...editForm, role: value})}
              className="w-full"
              dropdownClassName="rounded-xl"
            >
              <Option value="ADMIN">ADMIN</Option>
              <Option value="OWNER">OWNER</Option>
              <Option value="CUSTOMER">CUSTOMER</Option>
            </Select>
          </div>
        </div>
      </Modal>
    </div>
  );
}