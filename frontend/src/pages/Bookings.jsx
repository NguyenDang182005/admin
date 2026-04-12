import { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, Input, Select, Modal, message, Typography, Popconfirm } from 'antd';
import { SearchOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const statusColors = {
  PENDING: 'gold',
  CONFIRMED: 'blue',
  COMPLETED: 'green',
  CANCELLED: 'red',
};

const typeLabels = {
  FLIGHT: '✈️ Máy bay',
  HOTEL: '🏨 Khách sạn',
  CAR_RENTAL: '🚗 Thuê xe',
  ATTRACTION: '🎡 Tham quan',
  TAXI: '🚕 Taxi',
  COMBO: '📦 Combo',
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
      message.error('Không thể tải danh sách đặt chỗ');
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
      message.success('Cập nhật trạng thái thành công');
      fetchBookings(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('Lỗi khi cập nhật trạng thái');
    }
  };

  const handleDelete = async (bookingId) => {
    try {
      await api.delete(`/bookings/${bookingId}`);
      message.success('Đã xóa đơn đặt chỗ');
      fetchBookings(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('Lỗi khi xóa đơn');
    }
  };

  const showDetail = (booking) => {
    setSelectedBooking(booking);
    setDetailVisible(true);
  };

  const columns = [
    {
      title: 'MÃ ĐƠN',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (id) => <Text strong className="text-gray-400">#{id}</Text>
    },
    {
      title: 'DỊCH VỤ',
      dataIndex: 'bookingType',
      key: 'bookingType',
      render: (type) => (
        <div className="flex items-center gap-2">
            <span className="font-bold text-gray-700">{typeLabels[type] || type}</span>
        </div>
      ),
    },
    {
      title: 'TỔNG TIỀN',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price) => (
        <Text strong className="text-[#006ce4]">
            {price ? `${Number(price).toLocaleString('vi-VN')} VND` : '-'}
        </Text>
      ),
    },
    {
      title: 'TRẠNG THÁI',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Select
          variant="borderless"
          value={status}
          style={{ width: 140 }}
          className={`rounded-lg font-bold ${
            status === 'CONFIRMED' ? 'bg-blue-50 text-blue-600' :
            status === 'PENDING' ? 'bg-orange-50 text-orange-600' :
            status === 'CANCELLED' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
          }`}
          onChange={(value) => handleStatusChange(record.id, value)}
          onClick={(e) => e.stopPropagation()}
        >
          <Option value="PENDING">PENDING</Option>
          <Option value="CONFIRMED">CONFIRMED</Option>
          <Option value="COMPLETED">COMPLETED</Option>
          <Option value="CANCELLED">CANCELLED</Option>
        </Select>
      ),
    },
    {
      title: 'NGÀY ĐẶT',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (
        <div className="text-xs text-gray-500 font-medium">
            {date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-'}
        </div>
      ),
    },
    {
      title: 'THAO TÁC',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EyeOutlined className="text-gray-400 hover:text-blue-500" />} onClick={() => showDetail(record)} />
          <Popconfirm
            title="Bạn có chắc muốn xóa?"
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
            <Title level={2} style={{ margin: 0, fontWeight: 800 }}>Quản lý đặt chỗ</Title>
            <Text type="secondary">Quản lý và cập nhật trạng thái các dịch vụ của khách hàng</Text>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <Select
              placeholder="Lọc trạng thái"
              style={{ width: 160 }}
              allowClear
              className="rounded-xl"
              value={filters.status || undefined}
              onChange={(value) => setFilters({ ...filters, status: value || '' })}
            >
              <Option value="PENDING">PENDING</Option>
              <Option value="CONFIRMED">CONFIRMED</Option>
              <Option value="COMPLETED">COMPLETED</Option>
              <Option value="CANCELLED">CANCELLED</Option>
            </Select>
            <Input
              placeholder="Tìm kiếm mã đơn hoặc khách..."
              prefix={<SearchOutlined className="text-gray-400" />}
              className="rounded-xl w-full md:w-64"
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
      </div>

      <div className="admin-table-container shadow-sm">
        <Table
          columns={columns}
          dataSource={bookings}
          rowKey="id"
          loading={loading}
          pagination={{
              ...pagination,
              itemRender: (current, type, originalElement) => {
                  if (type === 'prev') return <Button type="text">Trướt</Button>;
                  if (type === 'next') return <Button type="text">Sau</Button>;
                  return originalElement;
              }
          }}
          onChange={handleTableChange}
          onRow={(record) => ({
            onClick: () => showDetail(record),
          })}
          className="booking-table"
        />
      </div>

      <Modal
        title={
            <div className="pb-4 border-b border-gray-100">
                <Title level={4} style={{ margin: 0 }}>Chi tiết Đơn hàng #{selectedBooking?.id}</Title>
            </div>
        }
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)} className="rounded-lg font-bold">
            Đóng
          </Button>
        ]}
        width={600}
        className="rounded-2xl overflow-hidden"
      >
        {selectedBooking && (
          <div className="py-6 space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <Text strong type="secondary">LOẠI DỊCH VỤ</Text>
                <Text strong>{typeLabels[selectedBooking.bookingType] || selectedBooking.bookingType}</Text>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <Text strong type="secondary">TỔNG THANH TOÁN</Text>
                <Text strong className="text-xl text-[#006ce4]">
                    {selectedBooking.totalPrice ? `${Number(selectedBooking.totalPrice).toLocaleString('vi-VN')} VND` : '-'}
                </Text>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <Text strong type="secondary">TRẠNG THÁI</Text>
                <Tag color={statusColors[selectedBooking.status]} className="font-bold border-none px-3 rounded-full uppercase">
                    {selectedBooking.status}
                </Tag>
            </div>
            <div className="flex justify-between items-center py-2">
                <Text strong type="secondary">NGÀY ĐẶT HỆ THỐNG</Text>
                <Text>{selectedBooking.createdAt ? dayjs(selectedBooking.createdAt).format('DD/MM/YYYY HH:mm:ss') : '-'}</Text>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}