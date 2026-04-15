import React, { useState, useEffect, useCallback } from 'react';
import { 
    Card, Button, Typography, Space, Table, message, Modal, Form, 
    Select, DatePicker, InputNumber, Popconfirm, Tag, Tooltip, 
    Statistic, Row, Col, Badge, Divider, Alert, Descriptions, Spin,
    Empty, Segmented
} from 'antd';
import { 
    SyncOutlined, PlusOutlined, DeleteOutlined, EditOutlined, 
    ThunderboltOutlined, ClockCircleOutlined, DollarOutlined,
    RocketOutlined, ReloadOutlined, CheckCircleOutlined,
    InfoCircleOutlined, ExclamationCircleOutlined,
    DatabaseOutlined, TableOutlined, SearchOutlined, EyeOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { dynamicPriceAPI, systemAPI, dataExplorerAPI } from '../services/api';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const SERVICE_TYPE_MAP = {
    ROOM: { label: 'Phòng Khách Sạn', color: '#0ea5e9', icon: '🏨' },
    FLIGHT: { label: 'Chuyến Bay', color: '#8b5cf6', icon: '✈️' },
    CAR: { label: 'Thuê Xe Tự Lái', color: '#f59e0b', icon: '🚗' },
    ATTRACTION: { label: 'Vé Tham Quan', color: '#10b981', icon: '🎡' },
    TAXI: { label: 'Taxi Đưa Đón', color: '#ef4444', icon: '🚕' },
};

const TABLE_ICONS = {
    flights: '✈️', rooms: '🛏️', hotels: '🏨', cars: '🚗', car_locations: '📍',
    airport_taxis: '🚕', attractions: '🎡', bookings: '📋', flight_bookings: '🎫',
    hotel_bookings: '🏨', car_rental_bookings: '🚗', taxi_bookings: '🚕',
    attraction_bookings: '🎟️', dynamic_prices: '💰', users: '👤',
};

const TABLE_LABELS = {
    flights: 'Chuyến bay', rooms: 'Phòng', hotels: 'Khách sạn', cars: 'Xe',
    car_locations: 'Địa điểm xe', airport_taxis: 'Taxi sân bay',
    attractions: 'Tham quan', bookings: 'Đơn đặt chỗ',
    flight_bookings: 'Chi tiết bay', hotel_bookings: 'Chi tiết KS',
    car_rental_bookings: 'Chi tiết thuê xe', taxi_bookings: 'Chi tiết taxi',
    attraction_bookings: 'Chi tiết tham quan', dynamic_prices: 'Giá động',
    users: 'Người dùng',
};

// Helper: format cell value based on column type
const formatCellValue = (value, columnName, dataType) => {
    if (value === null || value === undefined) return <Text type="secondary">—</Text>;

    // Date/DateTime columns
    if (dataType === 'datetime' || dataType === 'timestamp') {
        return <Text style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{dayjs(value).format('DD/MM/YYYY HH:mm')}</Text>;
    }
    if (dataType === 'date') {
        return <Text style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{dayjs(value).format('DD/MM/YYYY')}</Text>;
    }

    // Price/decimal columns
    if (dataType === 'decimal' && (columnName.includes('price') || columnName.includes('total') || columnName.includes('base'))) {
        return <Text strong style={{ color: '#0ea5e9', fontSize: 12 }}>{Number(value).toLocaleString('vi-VN')} ₫</Text>;
    }

    // Enum/status columns
    if (dataType === 'enum') {
        const colorMap = {
            'PENDING': 'orange', 'CONFIRMED': 'blue', 'CANCELLED': 'red', 'COMPLETED': 'green',
            'ECONOMY': 'default', 'BUSINESS': 'purple', 'FIRST_CLASS': 'gold',
            'ROOM': 'cyan', 'FLIGHT': 'geekblue', 'CAR': 'orange', 'ATTRACTION': 'green',
            'TAXI': 'red', 'HOTEL': 'blue', 'CAR_RENTAL': 'volcano', 'COMBO': 'magenta',
            'ADMIN': 'red', 'USER': 'blue',
        };
        return <Tag color={colorMap[value] || 'default'} style={{ fontSize: 11, borderRadius: 6 }}>{value}</Tag>;
    }

    // ID columns
    if (columnName === 'id' || columnName.endsWith('_id') || columnName === 'booking_id') {
        return <Text code style={{ fontSize: 11 }}>{value}</Text>;
    }

    // URL columns
    if (typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://'))) {
        return <a href={value} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, maxWidth: 200, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>🔗 {value.substring(0, 40)}...</a>;
    }

    // Boolean
    if (dataType === 'tinyint') {
        return value ? <Tag color="green" style={{ fontSize: 11 }}>✓</Tag> : <Tag color="default" style={{ fontSize: 11 }}>✗</Tag>;
    }

    // Long text
    if (typeof value === 'string' && value.length > 60) {
        return <Tooltip title={value}><Text style={{ fontSize: 12 }}>{value.substring(0, 60)}...</Text></Tooltip>;
    }

    return <Text style={{ fontSize: 12 }}>{String(value)}</Text>;
};

const DataExplorer = ({ tables, setTables, selectedTable, setSelectedTable, data, setData, loading, setLoading, tablesLoading, setTablesLoading, page, setPage, pageSize, setPageSize }) => {

    const fetchTables = async () => {
        setTablesLoading(true);
        try {
            const res = await dataExplorerAPI.getTables();
            setTables(res.data || []);
        } catch {
            message.error('Không thể tải danh sách bảng');
        } finally {
            setTablesLoading(false);
        }
    };

    const fetchTableData = useCallback(async (tableName, p = 0, s = 15) => {
        setLoading(true);
        try {
            const res = await dataExplorerAPI.query(tableName, p, s);
            setData(res.data);
        } catch {
            message.error('Không thể truy vấn bảng ' + tableName);
        } finally {
            setLoading(false);
        }
    }, [setLoading, setData]);

    useEffect(() => {
        fetchTables();
    }, []);

    useEffect(() => {
        if (selectedTable) {
            fetchTableData(selectedTable, page, pageSize);
        }
    }, [selectedTable, page, pageSize, fetchTableData]);

    const handleSelectTable = (tableName) => {
        setSelectedTable(tableName);
        setPage(0);
        setData(null);
    };

    // Build dynamic columns from data
    const explorerColumns = data?.columns?.map(col => ({
        title: (
            <Tooltip title={`${col.DATA_TYPE}${col.COLUMN_KEY === 'PRI' ? ' — PRIMARY KEY' : col.COLUMN_KEY === 'MUL' ? ' — FOREIGN KEY' : ''}`}>
                <span>{col.COLUMN_NAME} {col.COLUMN_KEY === 'PRI' ? '🔑' : col.COLUMN_KEY === 'MUL' ? '🔗' : ''}</span>
            </Tooltip>
        ),
        dataIndex: col.COLUMN_NAME,
        key: col.COLUMN_NAME,
        ellipsis: true,
        width: col.DATA_TYPE === 'bigint' ? 80 : col.DATA_TYPE === 'datetime' || col.DATA_TYPE === 'timestamp' ? 150 : col.DATA_TYPE === 'text' ? 200 : undefined,
        render: (val) => formatCellValue(val, col.COLUMN_NAME, col.DATA_TYPE),
    })) || [];

    return (
        <Card
            style={{
                marginTop: 24,
                borderRadius: 16,
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
            }}
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <DatabaseOutlined style={{ color: '#8b5cf6', fontSize: 18 }} />
                    <span style={{ fontWeight: 700, fontSize: 16 }}>Khám phá Dữ liệu (Data Explorer)</span>
                </div>
            }
            extra={
                <Button
                    icon={<ReloadOutlined />}
                    onClick={() => { fetchTables(); if (selectedTable) fetchTableData(selectedTable, page, pageSize); }}
                    loading={tablesLoading}
                    style={{ borderRadius: 10 }}
                >
                    Làm mới
                </Button>
            }
        >
            {/* Table Chips */}
            <div style={{ marginBottom: 20 }}>
                <Text type="secondary" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    <TableOutlined style={{ marginRight: 6 }} />Chọn bảng để xem dữ liệu
                </Text>
                <Spin spinning={tablesLoading}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {tables.map(t => (
                            <div
                                key={t.name}
                                className={`table-chip ${selectedTable === t.name ? 'active' : ''}`}
                                onClick={() => handleSelectTable(t.name)}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    padding: '6px 14px', borderRadius: 10,
                                    background: selectedTable === t.name ? 'rgba(0,108,228,0.06)' : '#f8fafc',
                                    fontSize: 13, fontWeight: selectedTable === t.name ? 700 : 500,
                                    color: selectedTable === t.name ? '#006ce4' : '#475569',
                                }}
                            >
                                <span>{TABLE_ICONS[t.name] || '📄'}</span>
                                <span>{TABLE_LABELS[t.name] || t.name}</span>
                                <Badge
                                    count={t.count}
                                    showZero
                                    style={{
                                        backgroundColor: selectedTable === t.name ? '#006ce4' : '#cbd5e1',
                                        fontSize: 10, fontWeight: 700,
                                        boxShadow: 'none', marginLeft: 2
                                    }}
                                    size="small"
                                />
                            </div>
                        ))}
                    </div>
                </Spin>
            </div>

            <Divider style={{ margin: '0 0 16px 0' }} />

            {/* Data Table */}
            {!selectedTable ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <SearchOutlined style={{ fontSize: 40, color: '#cbd5e1', marginBottom: 12 }} />
                    <Paragraph type="secondary" style={{ fontSize: 14 }}>
                        Chọn một bảng ở trên để xem dữ liệu
                    </Paragraph>
                </div>
            ) : (
                <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <EyeOutlined style={{ color: '#006ce4' }} />
                        <Text strong style={{ fontSize: 14 }}>
                            {TABLE_ICONS[selectedTable]} {selectedTable}
                        </Text>
                        <Tag color="blue" style={{ fontWeight: 600 }}>
                            {data?.total || 0} bản ghi
                        </Tag>
                    </div>
                    <Table
                        className="explorer-table"
                        columns={explorerColumns}
                        dataSource={data?.data || []}
                        rowKey={(record, index) => record.id || record.booking_id || index}
                        loading={loading}
                        scroll={{ x: 'max-content' }}
                        size="small"
                        bordered
                        pagination={{
                            current: page + 1,
                            pageSize: pageSize,
                            total: data?.total || 0,
                            showSizeChanger: true,
                            pageSizeOptions: ['10', '15', '20', '50'],
                            showTotal: (total, range) => <Text type="secondary" style={{ fontSize: 12 }}>Hiển thị {range[0]}-{range[1]} / {total}</Text>,
                            onChange: (p, s) => { setPage(p - 1); setPageSize(s); },
                            size: 'small',
                        }}
                    />
                </>
            )}
        </Card>
    );
};

const DataManagement = () => {
    const [shifting, setShifting] = useState(false);
    const [shiftResult, setShiftResult] = useState(null);
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRule, setEditingRule] = useState(null);
    const [form] = Form.useForm();

    // Data Explorer state
    const [explorerTables, setExplorerTables] = useState([]);
    const [explorerSelectedTable, setExplorerSelectedTable] = useState(null);
    const [explorerData, setExplorerData] = useState(null);
    const [explorerLoading, setExplorerLoading] = useState(false);
    const [explorerTablesLoading, setExplorerTablesLoading] = useState(false);
    const [explorerPage, setExplorerPage] = useState(0);
    const [explorerPageSize, setExplorerPageSize] = useState(15);

    const fetchRules = async () => {
        setLoading(true);
        try {
            const res = await dynamicPriceAPI.getAll();
            setRules(res.data || []);
        } catch (error) {
            if (error.response?.status !== 401) {
                message.error('Lỗi khi tải danh sách quy tắc giá động');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRules();
    }, []);

    const handleShiftData = async () => {
        setShifting(true);
        setShiftResult(null);
        try {
            const res = await systemAPI.shiftData(1);
            const data = res.data;
            if (data.success) {
                message.success(data.message || 'Hệ thống đã làm mới dữ liệu thành công (tịnh tiến 1 ngày).');
                setShiftResult(data.details);
                fetchRules();
            } else {
                message.error('Lỗi: ' + data.message);
            }
        } catch (error) {
            if (error.response?.status !== 401) {
                message.error('Lỗi kết nối khi tịnh tiến ngày');
            }
        } finally {
            setShifting(false);
        }
    };

    const openCreateModal = () => {
        setEditingRule(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const openEditModal = (record) => {
        setEditingRule(record);
        form.setFieldsValue({
            serviceType: record.serviceType,
            serviceId: record.serviceId,
            targetDate: dayjs(record.targetDate),
            dynamicPrice: record.dynamicPrice,
            multiplier: record.multiplier,
        });
        setIsModalOpen(true);
    };

    const handleSaveRule = async (values) => {
        try {
            const payload = {
                serviceType: values.serviceType,
                serviceId: values.serviceId,
                targetDate: values.targetDate.format('YYYY-MM-DD'),
                dynamicPrice: values.dynamicPrice || null,
                multiplier: values.multiplier || null,
            };

            if (editingRule) {
                await dynamicPriceAPI.update(editingRule.id, payload);
                message.success('Cập nhật quy tắc thành công');
            } else {
                await dynamicPriceAPI.create(payload);
                message.success('Thêm quy tắc mới thành công');
            }

            setIsModalOpen(false);
            form.resetFields();
            setEditingRule(null);
            fetchRules();
        } catch (error) {
            message.error(editingRule ? 'Cập nhật thất bại' : 'Thêm thất bại');
        }
    };

    const handleDeleteRule = async (id) => {
        try {
            await dynamicPriceAPI.delete(id);
            message.success('Đã xóa quy tắc');
            fetchRules();
        } catch (error) {
            message.error('Lỗi khi xóa quy tắc');
        }
    };

    const getDateStatus = (dateStr) => {
        const target = dayjs(dateStr);
        const today = dayjs();
        if (target.isBefore(today, 'day')) return { status: 'expired', text: 'Đã qua', color: '#94a3b8' };
        if (target.isSame(today, 'day')) return { status: 'today', text: 'Hôm nay', color: '#f59e0b' };
        return { status: 'upcoming', text: target.fromNow(), color: '#10b981' };
    };

    // Stats
    const totalRules = rules.length;
    const activeRules = rules.filter(r => !dayjs(r.targetDate).isBefore(dayjs(), 'day')).length;
    const expiredRules = totalRules - activeRules;

    const columns = [
        { 
            title: 'ID', 
            dataIndex: 'id', 
            key: 'id', 
            width: 60,
            render: (val) => <Text strong style={{ color: '#64748b' }}>#{val}</Text>
        },
        { 
            title: 'Loại dịch vụ', 
            dataIndex: 'serviceType', 
            key: 'serviceType',
            filters: Object.entries(SERVICE_TYPE_MAP).map(([k, v]) => ({ text: v.label, value: k })),
            onFilter: (value, record) => record.serviceType === value,
            render: (val) => {
                const svc = SERVICE_TYPE_MAP[val] || { label: val, color: '#64748b', icon: '📦' };
                return (
                    <Tag 
                        style={{ 
                            borderRadius: 20, 
                            padding: '2px 12px', 
                            fontSize: 13, 
                            fontWeight: 600,
                            border: 'none',
                            background: `${svc.color}14`,
                            color: svc.color,
                        }}
                    >
                        {svc.icon} {svc.label}
                    </Tag>
                );
            } 
        },
        { 
            title: 'ID Dịch vụ', 
            dataIndex: 'serviceId', 
            key: 'serviceId', 
            width: 100,
            render: (val) => <Badge count={val} showZero style={{ backgroundColor: '#e2e8f0', color: '#475569', fontWeight: 700, boxShadow: 'none' }} />
        },
        { 
            title: 'Ngày áp dụng', 
            dataIndex: 'targetDate', 
            key: 'targetDate', 
            sorter: (a, b) => dayjs(a.targetDate).unix() - dayjs(b.targetDate).unix(),
            render: (val) => {
                const ds = getDateStatus(val);
                return (
                    <Space direction="vertical" size={0}>
                        <Text strong style={{ fontSize: 13 }}>{dayjs(val).format('DD/MM/YYYY')}</Text>
                        <Text style={{ fontSize: 11, color: ds.color, fontWeight: 600 }}>
                            <ClockCircleOutlined style={{ marginRight: 4 }} />{ds.text}
                        </Text>
                    </Space>
                );
            }
        },
        { 
            title: 'Giá Ghi Đè', 
            dataIndex: 'dynamicPrice', 
            key: 'dynamicPrice', 
            render: (val) => val 
                ? <Text strong style={{ color: '#0ea5e9', fontSize: 13 }}>{Number(val).toLocaleString('vi-VN')} ₫</Text> 
                : <Text type="secondary">—</Text> 
        },
        { 
            title: 'Hệ số nhân', 
            dataIndex: 'multiplier', 
            key: 'multiplier', 
            render: (val) => val 
                ? <Tag color={val > 1 ? 'volcano' : 'green'} style={{ fontWeight: 700, borderRadius: 8 }}>×{val}</Tag>
                : <Text type="secondary">—</Text> 
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 120,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Sửa quy tắc">
                        <Button 
                            type="text" 
                            icon={<EditOutlined />} 
                            onClick={() => openEditModal(record)}
                            style={{ color: '#006ce4' }}
                        />
                    </Tooltip>
                    <Popconfirm 
                        title="Xóa quy tắc này?" 
                        description="Hành động này không thể hoàn tác."
                        onConfirm={() => handleDeleteRule(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Xóa quy tắc">
                            <Button type="text" danger icon={<DeleteOutlined />} />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            {/* Page Header */}
            <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                    <div style={{ 
                        width: 40, height: 40, borderRadius: 12, 
                        background: 'linear-gradient(135deg, #006ce4, #0ea5e9)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0,108,228,0.3)'
                    }}>
                        <ThunderboltOutlined style={{ color: '#fff', fontSize: 20 }} />
                    </div>
                    <div>
                        <Title level={3} style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>
                            Quản lý Dữ liệu & Giá Động
                        </Title>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                            Cỗ máy thời gian & Quy tắc điều chỉnh giá theo ngày
                        </Text>
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={8}>
                    <Card size="small" style={{ borderRadius: 12, border: '1px solid #e2e8f0' }}>
                        <Statistic 
                            title={<Text style={{ color: '#64748b', fontWeight: 600, fontSize: 12 }}>TỔNG QUY TẮC</Text>}
                            value={totalRules} 
                            prefix={<DollarOutlined style={{ color: '#006ce4' }} />}
                            valueStyle={{ color: '#0f172a', fontWeight: 800 }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card size="small" style={{ borderRadius: 12, border: '1px solid #e2e8f0' }}>
                        <Statistic 
                            title={<Text style={{ color: '#64748b', fontWeight: 600, fontSize: 12 }}>ĐANG HOẠT ĐỘNG</Text>}
                            value={activeRules} 
                            prefix={<CheckCircleOutlined style={{ color: '#10b981' }} />}
                            valueStyle={{ color: '#10b981', fontWeight: 800 }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card size="small" style={{ borderRadius: 12, border: '1px solid #e2e8f0' }}>
                        <Statistic 
                            title={<Text style={{ color: '#64748b', fontWeight: 600, fontSize: 12 }}>ĐÃ HẾT HẠN</Text>}
                            value={expiredRules} 
                            prefix={<ExclamationCircleOutlined style={{ color: '#94a3b8' }} />}
                            valueStyle={{ color: '#94a3b8', fontWeight: 800 }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Time Machine Section */}
            <Card 
                style={{ 
                    marginBottom: 24, borderRadius: 16, 
                    border: '1px solid #e2e8f0',
                    background: 'linear-gradient(135deg, #fafbff 0%, #f0f4ff 100%)',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flex: 1 }}>
                        <div style={{ 
                            width: 48, height: 48, borderRadius: 14,
                            background: 'linear-gradient(135deg, #006ce4, #8b5cf6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 16px rgba(0,108,228,0.25)',
                            flexShrink: 0
                        }}>
                            <RocketOutlined style={{ color: '#fff', fontSize: 22 }} />
                        </div>
                        <div>
                            <Title level={5} style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>
                                Cỗ máy thời gian (Time Machine)
                            </Title>
                            <Text style={{ color: '#64748b', fontSize: 13, lineHeight: '1.6' }}>
                                Tịnh tiến toàn bộ dữ liệu demo (Chuyến bay, phòng, ngày thuê xe, taxi, vé tham quan...) lên +1 ngày ở tương lai. 
                                Chỉ ảnh hưởng bản ghi có <Text code>ID ≤ 50</Text>.
                            </Text>
                        </div>
                    </div>
                    <Button 
                        type="primary" 
                        size="large" 
                        icon={<SyncOutlined spin={shifting} />} 
                        onClick={handleShiftData}
                        loading={shifting}
                        style={{ 
                            background: 'linear-gradient(135deg, #006ce4, #0ea5e9)',
                            border: 'none',
                            padding: '0 28px', 
                            height: 48,
                            borderRadius: 12,
                            fontWeight: 700,
                            fontSize: 14,
                            boxShadow: '0 4px 16px rgba(0,108,228,0.3)'
                        }}
                    >
                        Tịnh tiến Dữ liệu (+1 Ngày)
                    </Button>
                </div>

                {/* Shift Result Details */}
                {shiftResult && (
                    <div style={{ marginTop: 20 }}>
                        <Divider style={{ margin: '0 0 16px 0' }} />
                        <Alert
                            type="success"
                            showIcon
                            icon={<CheckCircleOutlined />}
                            message={<Text strong>Kết quả tịnh tiến dữ liệu</Text>}
                            description={
                                <Descriptions column={{ xs: 1, sm: 2, md: 3 }} size="small" style={{ marginTop: 8 }}>
                                    {Object.entries(shiftResult).filter(([k]) => k !== 'totalUpdated').map(([key, val]) => (
                                        <Descriptions.Item 
                                            key={key} 
                                            label={<Text style={{ textTransform: 'capitalize', fontWeight: 600 }}>{key}</Text>}
                                        >
                                            {typeof val === 'number' 
                                                ? <Tag color={val > 0 ? 'green' : 'default'}>{val} bản ghi</Tag>
                                                : <Tag color="orange">{val}</Tag>
                                            }
                                        </Descriptions.Item>
                                    ))}
                                    {shiftResult.totalUpdated !== undefined && (
                                        <Descriptions.Item label={<Text strong style={{ color: '#006ce4' }}>Tổng cộng</Text>}>
                                            <Tag color="blue" style={{ fontWeight: 700, fontSize: 13 }}>{shiftResult.totalUpdated} bản ghi</Tag>
                                        </Descriptions.Item>
                                    )}
                                </Descriptions>
                            }
                            style={{ borderRadius: 12 }}
                        />
                    </div>
                )}
            </Card>

            {/* Dynamic Prices Section */}
            <Card 
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <DollarOutlined style={{ color: '#006ce4', fontSize: 18 }} />
                        <span style={{ fontWeight: 700, fontSize: 16 }}>Quy tắc Giá Động</span>
                        <Badge count={totalRules} style={{ backgroundColor: '#006ce4' }} />
                    </div>
                }
                style={{ borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }} 
                extra={
                    <Space>
                        <Button 
                            icon={<ReloadOutlined />} 
                            onClick={fetchRules}
                            loading={loading}
                            style={{ borderRadius: 10 }}
                        >
                            Làm mới
                        </Button>
                        <Button 
                            type="primary" 
                            icon={<PlusOutlined />} 
                            onClick={openCreateModal}
                            style={{ 
                                borderRadius: 10, 
                                fontWeight: 600,
                                background: 'linear-gradient(135deg, #006ce4, #0ea5e9)',
                                border: 'none',
                                boxShadow: '0 2px 8px rgba(0,108,228,0.25)'
                            }}
                        >
                            Tạo quy tắc mới
                        </Button>
                    </Space>
                }
            >
                {rules.length === 0 && !loading ? (
                    <div style={{ textAlign: 'center', padding: '48px 0' }}>
                        <DollarOutlined style={{ fontSize: 48, color: '#cbd5e1', marginBottom: 16 }} />
                        <Paragraph type="secondary" style={{ fontSize: 15 }}>
                            Chưa có quy tắc giá động nào. Hãy tạo quy tắc đầu tiên!
                        </Paragraph>
                        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}
                            style={{ borderRadius: 10, fontWeight: 600 }}
                        >
                            Tạo quy tắc
                        </Button>
                    </div>
                ) : (
                    <Table 
                        columns={columns} 
                        dataSource={rules} 
                        rowKey="id" 
                        loading={loading}
                        pagination={{ 
                            pageSize: 8,
                            showSizeChanger: false,
                            showTotal: (total) => <Text type="secondary">Có {total} quy tắc</Text>,
                        }}
                        rowClassName={(record) => {
                            if (dayjs(record.targetDate).isBefore(dayjs(), 'day')) return 'row-expired';
                            if (dayjs(record.targetDate).isSame(dayjs(), 'day')) return 'row-today';
                            return '';
                        }}
                        style={{ marginTop: 4 }}
                    />
                )}
            </Card>

            {/* Create / Edit Rule Modal */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {editingRule 
                            ? <EditOutlined style={{ color: '#006ce4' }} />
                            : <PlusOutlined style={{ color: '#006ce4' }} />
                        }
                        <span style={{ fontWeight: 700 }}>
                            {editingRule ? `Sửa Quy tắc #${editingRule.id}` : 'Tạo Quy tắc Giá Động Mới'}
                        </span>
                    </div>
                }
                open={isModalOpen}
                onCancel={() => { setIsModalOpen(false); form.resetFields(); setEditingRule(null); }}
                onOk={() => form.submit()}
                okText={editingRule ? "Lưu thay đổi" : "Lưu quy tắc"}
                cancelText="Hủy"
                okButtonProps={{ 
                    style: { borderRadius: 10, fontWeight: 600 } 
                }}
                cancelButtonProps={{ style: { borderRadius: 10 } }}
                width={520}
                destroyOnClose
            >
                <Form layout="vertical" form={form} onFinish={handleSaveRule} style={{ marginTop: 16 }}>
                    <Form.Item 
                        name="serviceType" 
                        label={<Text strong>Loại dịch vụ</Text>} 
                        rules={[{ required: true, message: 'Vui lòng chọn loại dịch vụ' }]}
                    >
                        <Select placeholder="Chọn dịch vụ" size="large" style={{ borderRadius: 12 }}>
                            {Object.entries(SERVICE_TYPE_MAP).map(([key, val]) => (
                                <Option key={key} value={key}>
                                    {val.icon} {val.label}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    
                    <Form.Item 
                        name="serviceId" 
                        label={<Text strong>ID Dịch vụ gốc</Text>} 
                        rules={[{ required: true, message: 'Vui lòng nhập ID' }]}
                        tooltip="ID của bản ghi dịch vụ trong cơ sở dữ liệu"
                    >
                        <InputNumber placeholder="Ví dụ: 1" style={{ width: '100%' }} min={1} size="large" />
                    </Form.Item>
                    
                    <Form.Item 
                        name="targetDate" 
                        label={<Text strong>Ngày áp dụng</Text>} 
                        rules={[{ required: true, message: 'Vui lòng chọn ngày áp dụng' }]}
                    >
                        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" size="large" />
                    </Form.Item>

                    <div style={{ 
                        padding: '16px', 
                        background: 'linear-gradient(135deg, #f8fafc, #f0f4ff)', 
                        borderRadius: 12, 
                        marginBottom: 0,
                        border: '1px solid #e2e8f0'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <InfoCircleOutlined style={{ color: '#006ce4' }} />
                            <Text style={{ fontSize: 13, color: '#475569' }}>
                                Ưu tiên <Text strong style={{ color: '#006ce4' }}>Giá ghi đè</Text> trước. 
                                Nếu trống, hệ thống dùng <Text strong style={{ color: '#8b5cf6' }}>Hệ số nhân</Text>.
                            </Text>
                        </div>
                        
                        <Form.Item name="dynamicPrice" label={<Text strong>Giá mới (Ghi đè giá gốc)</Text>} style={{ marginBottom: 12 }}>
                            <InputNumber 
                                placeholder="Ví dụ: 1.500.000" 
                                style={{ width: '100%' }}
                                size="large"
                                min={0}
                                formatter={value => `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value.replace(/\₫\s?|(,*)/g, '')}
                            />
                        </Form.Item>
                        
                        <Form.Item name="multiplier" label={<Text strong>Hệ số nhân (Nhân với giá gốc)</Text>} style={{ marginBottom: 0 }}>
                            <InputNumber 
                                placeholder="Ví dụ: 1.2 (Tăng 20%)" 
                                step={0.1} 
                                min={0.1} 
                                max={10}
                                style={{ width: '100%' }} 
                                size="large"
                            />
                        </Form.Item>
                    </div>
                </Form>
            </Modal>

            {/* ========== DATA EXPLORER SECTION ========== */}
            <DataExplorer
                tables={explorerTables}
                setTables={setExplorerTables}
                selectedTable={explorerSelectedTable}
                setSelectedTable={setExplorerSelectedTable}
                data={explorerData}
                setData={setExplorerData}
                loading={explorerLoading}
                setLoading={setExplorerLoading}
                tablesLoading={explorerTablesLoading}
                setTablesLoading={setExplorerTablesLoading}
                page={explorerPage}
                setPage={setExplorerPage}
                pageSize={explorerPageSize}
                setPageSize={setExplorerPageSize}
            />

            <style>{`
                .row-expired td {
                    opacity: 0.5;
                }
                .row-today td {
                    background: rgba(245, 158, 11, 0.04) !important;
                }
                .explorer-table .ant-table-cell {
                    font-size: 12.5px !important;
                    padding: 8px 12px !important;
                }
                .explorer-table .ant-table-thead .ant-table-cell {
                    font-size: 11px !important;
                    font-weight: 700 !important;
                    text-transform: uppercase;
                    color: #64748b !important;
                    background: #f8fafc !important;
                }
                .table-chip {
                    cursor: pointer;
                    transition: all 0.2s;
                    border: 1.5px solid transparent;
                }
                .table-chip:hover {
                    border-color: #006ce4;
                    transform: translateY(-1px);
                    box-shadow: 0 2px 8px rgba(0,108,228,0.12);
                }
                .table-chip.active {
                    border-color: #006ce4;
                    background: rgba(0,108,228,0.06) !important;
                }
            `}</style>
        </div>
    );
};

export default DataManagement;
