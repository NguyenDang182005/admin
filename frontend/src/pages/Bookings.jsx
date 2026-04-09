import { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, Input, Select, Modal, message, Card, Typography, Popconfirm } from 'antd';
import { SearchOutlined, DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

const { Title } = Typography;
const { Option } = Select;

const statusColors = {
  PENDING: 'gold',
  CONFIRMED: 'blue',
  COMPLETED: 'green',
  CANCELLED: 'red',
};

const typeLabels = {
  FLIGHT: 'Máy bay',
  HOTEL: 'Khách sạn',
  CAR_RENTAL: 'Thuê xe',
  ATTRACTION: 'Du lịch',
  TAXI: 'Taxi sân bay',
  COMBO: 'Combo',
};

export default function Bookings() {
  const { api } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({ status: '', search: '' });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const fetchBookings = async (page = 1, size = 10) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page - 1);
      params.append('size', size);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get(`/bookings?${params.toString()}`);
      setBookings(response.data.content);
      setPagination({
        current: response.data.currentPage + 1,
        pageSize: response.data.size,
        total: response.data.totalElements,
      });
    } catch (error) {
      message.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [filters.status]);

  const handleTableChange = (pag) => {
    fetchBookings(pag.current, pag.pageSize);
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await api.put(`/bookings/${bookingId}/status`, { status: newStatus });
      message.success('Status updated successfully');
      fetchBookings(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('Failed to update status');
    }
  };

  const handleDelete = async (bookingId) => {
    try {
      await api.delete(`/bookings/${bookingId}`);
      message.success('Booking deleted successfully');
      fetchBookings(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('Failed to delete booking');
    }
  };

  const showDetail = (booking) => {
    setSelectedBooking(booking);
    setDetailVisible(true);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
    },
    {
      title: 'Loại đặt chỗ',
      dataIndex: 'bookingType',
      key: 'bookingType',
      render: (type) => <Tag color="blue">{typeLabels[type] || type}</Tag>,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price) => price ? `${Number(price).toLocaleString('vi-VN')} VND` : '-',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Select
          value={status}
          style={{ width: 120 }}
          onChange={(value) => handleStatusChange(selectedBooking?.id, value)}
          onClick={(e) => e.stopPropagation()}
        >
          <Option value="PENDING"><Tag color="gold">PENDING</Tag></Option>
          <Option value="CONFIRMED"><Tag color="blue">CONFIRMED</Tag></Option>
          <Option value="COMPLETED"><Tag color="green">COMPLETED</Tag></Option>
          <Option value="CANCELLED"><Tag color="red">CANCELLED</Tag></Option>
        </Select>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => date ? new Date(date).toLocaleString('vi-VN') : '-',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EyeOutlined />} onClick={() => showDetail(record)} />
          <Popconfirm
            title="Delete this booking?"
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
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <Title level={4} style={{ margin: 0 }}>Quản lý đặt chỗ</Title>
          <Space>
            <Select
              placeholder="Lọc theo trạng thái"
              style={{ width: 150 }}
              allowClear
              value={filters.status || undefined}
              onChange={(value) => setFilters({ ...filters, status: value || '' })}
            >
              <Option value="PENDING">PENDING</Option>
              <Option value="CONFIRMED">CONFIRMED</Option>
              <Option value="COMPLETED">COMPLETED</Option>
              <Option value="CANCELLED">CANCELLED</Option>
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
          dataSource={bookings}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          onRow={(record) => ({
            onClick: () => setSelectedBooking(record),
          })}
        />
      </Card>

      <Modal
        title="Chi tiết đặt chỗ"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={600}
      >
        {selectedBooking && (
          <div>
            <p><strong>ID:</strong> {selectedBooking.id}</p>
            <p><strong>Loại:</strong> {typeLabels[selectedBooking.bookingType] || selectedBooking.bookingType}</p>
            <p><strong>Tổng tiền:</strong> {selectedBooking.totalPrice ? `${Number(selectedBooking.totalPrice).toLocaleString('vi-VN')} VND` : '-'}</p>
            <p><strong>Trạng thái:</strong> <Tag color={statusColors[selectedBooking.status]}>{selectedBooking.status}</Tag></p>
            <p><strong>Ngày tạo:</strong> {selectedBooking.createdAt ? new Date(selectedBooking.createdAt).toLocaleString('vi-VN') : '-'}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}