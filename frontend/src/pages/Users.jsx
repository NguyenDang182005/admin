import { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, Input, Select, Modal, message, Card, Typography, Popconfirm, Avatar } from 'antd';
import { SearchOutlined, DeleteOutlined, EditOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

const { Title } = Typography;
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

      const response = await api.get(`/users?${params.toString()}`);
      setUsers(response.data.content);
      setPagination({
        current: response.data.currentPage + 1,
        pageSize: response.data.size,
        total: response.data.totalElements,
      });
    } catch (error) {
      message.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters.role]);

  const handleTableChange = (pag) => {
    fetchUsers(pag.current, pag.pageSize);
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}`, { role: newRole });
      message.success('Role updated successfully');
      fetchUsers(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('Failed to update role');
    }
  };

  const handleDelete = async (userId) => {
    try {
      await api.delete(`/users/${userId}`);
      message.success('User deleted successfully');
      fetchUsers(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('Failed to delete user');
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
      message.success('User updated successfully');
      setEditVisible(false);
      fetchUsers(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('Failed to update user');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
    },
    {
      title: 'Người dùng',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#6366f1' }} />
          <div>
            <div>{text || '-'}</div>
            <div style={{ fontSize: 12, color: '#888' }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      render: (phone) => phone || '-',
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role, record) => (
        <Select
          value={role}
          style={{ width: 140 }}
          onChange={(value) => handleRoleChange(record.id, value)}
          onClick={(e) => e.stopPropagation()}
        >
          <Option value="ADMIN"><Tag color="red">ADMIN</Tag></Option>
          <Option value="OWNER"><Tag color="blue">OWNER</Tag></Option>
          <Option value="CUSTOMER"><Tag color="green">CUSTOMER</Tag></Option>
        </Select>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '-',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm
            title="Delete this user?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card style={{ borderRadius: 8, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', border: '1px solid #e5e7eb' }}>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <Title level={4} style={{ margin: 0 }}>Quản lý người dùng</Title>
          <Space>
            <Select
              placeholder="Lọc theo vai trò"
              style={{ width: 150 }}
              allowClear
              value={filters.role || undefined}
              onChange={(value) => setFilters({ ...filters, role: value || '' })}
            >
              <Option value="ADMIN">ADMIN</Option>
              <Option value="OWNER">OWNER</Option>
              <Option value="CUSTOMER">CUSTOMER</Option>
            </Select>
            <Input
              placeholder="Search..."
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
        />
      </Card>

      <Modal
        title="Chỉnh sửa người dùng"
        open={editVisible}
        onCancel={() => setEditVisible(false)}
        onOk={handleEditSave}
        okText="Lưu"
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <label>Họ tên:</label>
            <Input 
              value={editForm.fullName} 
              onChange={(e) => setEditForm({...editForm, fullName: e.target.value})} 
            />
          </div>
          <div>
            <label>Vai trò:</label>
            <Select 
              value={editForm.role} 
              onChange={(value) => setEditForm({...editForm, role: value})}
              style={{ width: '100%' }}
            >
              <Option value="ADMIN">ADMIN</Option>
              <Option value="OWNER">OWNER</Option>
              <Option value="CUSTOMER">CUSTOMER</Option>
            </Select>
          </div>
        </Space>
      </Modal>
    </div>
  );
}