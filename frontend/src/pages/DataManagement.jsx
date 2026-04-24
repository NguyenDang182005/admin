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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <DatabaseOutlined className="text-blue-600 text-xl" />
                    <Title level={4} style={{ margin: 0 }}>Khám phá Dữ liệu</Title>
                </div>
                <Button
                    icon={<ReloadOutlined />}
                    onClick={() => { fetchTables(); if (selectedTable) fetchTableData(selectedTable, page, pageSize); }}
                    loading={tablesLoading}
                    className="rounded-lg font-medium"
                >
                    Làm mới
                </Button>
            </div>

            <div className="mb-6">
                <Text type="secondary" className="text-xs font-bold uppercase tracking-wider mb-3 block">
                    <TableOutlined className="mr-2" /> Chọn bảng dữ liệu
                </Text>
                <Spin spinning={tablesLoading}>
                    <div className="flex flex-wrap gap-2">
                        {tables.map(t => (
                            <div
                                key={t.name}
                                className={`table-chip cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border ${selectedTable === t.name ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-sm' : 'border-transparent bg-gray-50 text-gray-600 hover:border-blue-300'}`}
                                onClick={() => handleSelectTable(t.name)}
                            >
                                <span>{TABLE_ICONS[t.name] || '📄'}</span>
                                <span>{TABLE_LABELS[t.name] || t.name}</span>
                                <Badge
                                    count={t.count}
                                    showZero
                                    style={{
                                        backgroundColor: selectedTable === t.name ? '#006ce4' : '#cbd5e1',
                                        fontSize: 10, fontWeight: 700,
                                        boxShadow: 'none', marginLeft: 4
                                    }}
                                    size="small"
                                />
                            </div>
                        ))}
                    </div>
                </Spin>
            </div>

            {!selectedTable ? (
                <div className="text-center py-12 border-t border-gray-100">
                    <SearchOutlined className="text-4xl text-gray-300 mb-4" />
                    <Paragraph type="secondary">Chọn một bảng ở trên để xem dữ liệu</Paragraph>
                </div>
            ) : (
                <div className="border-t border-gray-100 pt-6">
                    <div className="flex items-center gap-3 mb-4">
                        <EyeOutlined className="text-blue-600" />
                        <Text strong className="text-sm">
                            {TABLE_ICONS[selectedTable]} {selectedTable}
                        </Text>
                        <Tag color="blue" className="font-bold border-none">
                            {data?.total || 0} bản ghi
                        </Tag>
                    </div>
                    <div className="admin-table-container shadow-sm border border-gray-100">
                        <Table
                            className="explorer-table"
                            columns={explorerColumns}
                            dataSource={data?.data || []}
                            rowKey={(record, index) => record.id || record.booking_id || index}
                            loading={loading}
                            scroll={{ x: 'max-content' }}
                            size="small"
                            pagination={{
                                current: page + 1,
                                pageSize: pageSize,
                                total: data?.total || 0,
                                showSizeChanger: true,
                                pageSizeOptions: ['10', '15', '20', '50'],
                                showTotal: (total, range) => <Text type="secondary" className="text-xs">Hiển thị {range[0]}-{range[1]} / {total}</Text>,
                                onChange: (p, s) => { setPage(p - 1); setPageSize(s); },
                                size: 'small',
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
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
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <Title level={2} style={{ margin: 0, fontWeight: 800 }}>Quản lý dữ liệu & Giá động</Title>
                    <Text type="secondary">Đồng bộ dữ liệu, khám phá các bảng & cấu hình giá linh hoạt theo ngày</Text>
                </div>
                
                <div className="flex gap-3 w-full md:w-auto">
                    <Button 
                        type="primary" 
                        size="large" 
                        icon={<SyncOutlined spin={shifting} />} 
                        onClick={handleShiftData}
                        loading={shifting}
                        className="rounded-xl font-bold bg-[#006ce4] shadow-sm h-10"
                    >
                        Đồng bộ Dữ liệu (+1 Ngày)
                    </Button>
                </div>
            </div>

            {/* Time Machine / Data Shift Alert */}
            {shiftResult && (
                <Alert
                    type="success"
                    showIcon
                    icon={<CheckCircleOutlined />}
                    message={<Text strong>Đồng bộ dữ liệu thành công</Text>}
                    description={
                        <Descriptions column={{ xs: 1, sm: 2, md: 3 }} size="small" className="mt-2">
                            {Object.entries(shiftResult).filter(([k]) => k !== 'totalUpdated').map(([key, val]) => (
                                <Descriptions.Item 
                                    key={key} 
                                    label={<Text className="capitalize font-medium">{key}</Text>}
                                >
                                    {typeof val === 'number' 
                                        ? <Tag color={val > 0 ? 'green' : 'default'} className="border-none">{val} bản ghi</Tag>
                                        : <Tag color="orange" className="border-none">{val}</Tag>
                                    }
                                </Descriptions.Item>
                            ))}
                            {shiftResult.totalUpdated !== undefined && (
                                <Descriptions.Item label={<Text strong className="text-blue-600">Tổng cộng</Text>}>
                                    <Tag color="blue" className="font-bold border-none">{shiftResult.totalUpdated} bản ghi</Tag>
                                </Descriptions.Item>
                            )}
                        </Descriptions>
                    }
                    className="rounded-xl border border-green-100"
                />
            )}

            <div className="p-5 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-4">
                <div className="bg-blue-600 text-white w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
                    <SyncOutlined className="text-xl" />
                </div>
                <div>
                    <Title level={5} className="!mb-1 !mt-0 !text-blue-900">Tính năng Đồng bộ Dữ liệu</Title>
                    <Text className="text-blue-700 text-sm block">
                        Công cụ hỗ trợ cập nhật tự động toàn bộ dữ liệu mẫu (chuyến bay, phòng khách sạn, xe tự lái, taxi, vé tham quan...) 
                        tiến thêm 1 ngày ở tương lai để phục vụ quá trình kiểm thử hệ thống.
                    </Text>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                        <DollarOutlined className="text-xl text-blue-600" />
                    </div>
                    <div>
                        <Text className="text-xs font-bold text-gray-400 block mb-1">TỔNG QUY TẮC GIÁ</Text>
                        <Title level={3} className="!m-0">{totalRules}</Title>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                        <CheckCircleOutlined className="text-xl text-green-600" />
                    </div>
                    <div>
                        <Text className="text-xs font-bold text-gray-400 block mb-1">ĐANG HOẠT ĐỘNG</Text>
                        <Title level={3} className="!m-0 text-green-600">{activeRules}</Title>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                        <ExclamationCircleOutlined className="text-xl text-gray-400" />
                    </div>
                    <div>
                        <Text className="text-xs font-bold text-gray-400 block mb-1">ĐÃ HẾT HẠN</Text>
                        <Title level={3} className="!m-0 text-gray-500">{expiredRules}</Title>
                    </div>
                </div>
            </div>

            {/* Dynamic Prices Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <DollarOutlined className="text-blue-600 text-xl" />
                        <Title level={4} style={{ margin: 0 }}>Quy tắc Giá Động</Title>
                        <Tag className="rounded-full bg-blue-50 text-blue-600 border-none font-bold">{totalRules}</Tag>
                    </div>
                    <div className="flex gap-2">
                        <Button icon={<ReloadOutlined />} onClick={fetchRules} loading={loading} className="rounded-lg h-10 font-medium">
                            Làm mới
                        </Button>
                        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal} className="rounded-lg bg-[#006ce4] font-medium h-10">
                            Tạo quy tắc mới
                        </Button>
                    </div>
                </div>

                {rules.length === 0 && !loading ? (
                    <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl">
                        <DollarOutlined className="text-5xl text-gray-300 mb-4" />
                        <Paragraph type="secondary">Chưa có quy tắc giá động nào. Hãy tạo quy tắc đầu tiên!</Paragraph>
                        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal} className="rounded-lg bg-[#006ce4] h-10 font-medium">
                            Tạo quy tắc
                        </Button>
                    </div>
                ) : (
                    <div className="admin-table-container shadow-sm border border-gray-100">
                        <Table 
                            columns={columns} 
                            dataSource={rules} 
                            rowKey="id" 
                            loading={loading}
                            pagination={{ pageSize: 8, showSizeChanger: false }}
                            rowClassName={(record) => {
                                if (dayjs(record.targetDate).isBefore(dayjs(), 'day')) return 'opacity-50';
                                if (dayjs(record.targetDate).isSame(dayjs(), 'day')) return 'bg-orange-50';
                                return '';
                            }}
                            className="dynamic-price-table"
                        />
                    </div>
                )}
            </div>

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

            {/* Create / Edit Rule Modal */}
            <Modal
                title={
                    <div className="pb-4 border-b border-gray-100 mb-6">
                        <Title level={4} style={{ margin: 0 }}>
                            {editingRule ? `Sửa Quy tắc #${editingRule.id}` : 'Tạo Quy tắc Giá Động Mới'}
                        </Title>
                    </div>
                }
                open={isModalOpen}
                onCancel={() => { setIsModalOpen(false); form.resetFields(); setEditingRule(null); }}
                onOk={() => form.submit()}
                okText={editingRule ? "Cập nhật ngay" : "Lưu quy tắc"}
                cancelText="Bỏ qua"
                className="rounded-2xl overflow-hidden"
                okButtonProps={{ 
                    style: { background: '#006ce4', height: 40, borderRadius: 8, fontWeight: 700 } 
                }}
                cancelButtonProps={{ style: { height: 40, borderRadius: 8 } }}
                width={520}
                destroyOnClose
                closeIcon={false}
            >
                <Form layout="vertical" form={form} onFinish={handleSaveRule}>
                    <Form.Item 
                        name="serviceType" 
                        label={<Text strong className="text-xs uppercase tracking-widest text-gray-400">LOẠI DỊCH VỤ</Text>} 
                        rules={[{ required: true, message: 'Vui lòng chọn loại dịch vụ' }]}
                    >
                        <Select placeholder="Chọn dịch vụ" size="large" className="rounded-xl">
                            {Object.entries(SERVICE_TYPE_MAP).map(([key, val]) => (
                                <Option key={key} value={key}>
                                    {val.icon} {val.label}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    
                    <Form.Item 
                        name="serviceId" 
                        label={<Text strong className="text-xs uppercase tracking-widest text-gray-400">ID DỊCH VỤ GỐC</Text>} 
                        rules={[{ required: true, message: 'Vui lòng nhập ID' }]}
                    >
                        <InputNumber placeholder="Ví dụ: 1" className="w-full rounded-xl" min={1} size="large" />
                    </Form.Item>
                    
                    <Form.Item 
                        name="targetDate" 
                        label={<Text strong className="text-xs uppercase tracking-widest text-gray-400">NGÀY ÁP DỤNG</Text>} 
                        rules={[{ required: true, message: 'Vui lòng chọn ngày áp dụng' }]}
                    >
                        <DatePicker className="w-full rounded-xl" format="DD/MM/YYYY" size="large" />
                    </Form.Item>

                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-4 mt-2">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <InfoCircleOutlined className="text-blue-500" />
                            <span>Ưu tiên điền <strong className="text-blue-600">Giá Ghi đè</strong>. Nếu trống sẽ dùng <strong className="text-purple-600">Hệ số nhân</strong>.</span>
                        </div>
                        
                        <Form.Item name="dynamicPrice" label={<Text strong className="text-xs uppercase tracking-widest text-gray-400">GIÁ GHI ĐÈ</Text>} className="!mb-0">
                            <InputNumber 
                                placeholder="Ví dụ: 1.500.000" 
                                className="w-full rounded-xl"
                                size="large"
                                min={0}
                                formatter={value => `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value.replace(/\₫\s?|(,*)/g, '')}
                            />
                        </Form.Item>
                        
                        <Form.Item name="multiplier" label={<Text strong className="text-xs uppercase tracking-widest text-gray-400">HỆ SỐ NHÂN</Text>} className="!mb-0 !mt-4">
                            <InputNumber 
                                placeholder="Ví dụ: 1.2 (Tăng 20%)" 
                                step={0.1} 
                                min={0.1} 
                                max={10}
                                className="w-full rounded-xl"
                                size="large"
                            />
                        </Form.Item>
                    </div>
                </Form>
            </Modal>
            <style>{`
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
            `}</style>
        </div>
    );
};

export default DataManagement;
