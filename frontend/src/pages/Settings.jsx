import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { Card, Form, Input, Button, Upload, message, Spin, Divider, Skeleton } from 'antd';
import { UploadOutlined, SaveOutlined, CloudUploadOutlined, GlobalOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { configAPI } from '../services/api';

const Settings = () => {
  const [logoUrl, setLogoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [savingKey, setSavingKey] = useState(null);
  const [siteNameForm] = Form.useForm();
  const [contactEmailForm] = Form.useForm();
  const [contactPhoneForm] = Form.useForm();

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [logoRes, configRes] = await Promise.allSettled([
          configAPI.getLogo(),
          configAPI.getAll(),
        ]);

        if (logoRes.status === 'fulfilled') setLogoUrl(logoRes.value.data.url);
        else setLogoUrl('https://placehold.co/200x60?text=Admin+Logo');

        if (configRes.status === 'fulfilled') {
          const configs = configRes.value.data;
          const findVal = (key) => configs.find?.(c => c.key === key)?.value || '';
          siteNameForm.setFieldsValue({ site_name: findVal('site_name') || 'Booking Admin Panel' });
          contactEmailForm.setFieldsValue({ contact_email: findVal('contact_email') || 'admin@booking.com' });
          contactPhoneForm.setFieldsValue({ contact_phone: findVal('contact_phone') || '' });
        } else {
          siteNameForm.setFieldsValue({ site_name: 'Booking Admin Panel' });
          contactEmailForm.setFieldsValue({ contact_email: 'admin@booking.com' });
        }
      } catch {
        setLogoUrl('https://placehold.co/200x60?text=Admin+Logo');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleLogoUpload = async ({ file }) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await configAPI.uploadLogo(formData);
      setLogoUrl(res.data.url);
      message.success('✅ Logo đã được cập nhật thành công!');
    } catch {
      message.error('❌ Không thể tải lên logo. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
    return false;
  };

  const handleSave = async (key, form) => {
    try {
      const values = await form.validateFields();
      setSavingKey(key);
      await configAPI.update(key, values[key]);
      message.success('✅ Cài đặt đã được lưu!');
    } catch (err) {
      if (err?.errorFields) {
        message.warning('Vui lòng điền đầy đủ thông tin!');
      } else {
        message.error('❌ Lưu thất bại. Vui lòng thử lại.');
      }
    } finally {
      setSavingKey(null);
    }
  };

  const inputStyle = { borderRadius: 8 };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} color="text.primary" mb={3}>
        ⚙️ Cấu hình hệ thống
      </Typography>

      <Grid container spacing={3}>
        {/* Logo Management */}
        <Grid item xs={12} md={5}>
          <Card title="🖼️ Logo trang web" bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', border: '1px solid #e5e7eb' }}>
            <Box mb={3} display="flex" alignItems="center" justifyContent="center"
              sx={{ background: '#f9fafb', borderRadius: 2, p: 3, minHeight: 100, border: '2px dashed #e5e7eb' }}>
              {loading
                ? <Skeleton.Image active style={{ width: 200, height: 60 }} />
                : <img src={logoUrl} alt="Current Logo" style={{ maxHeight: 80, maxWidth: 240, objectFit: 'contain' }} />
              }
            </Box>
            <Spin spinning={uploading} tip="Đang tải lên...">
              <Upload
                beforeUpload={(file) => { handleLogoUpload({ file }); return false; }}
                showUploadList={false}
                accept="image/*"
              >
                <Button icon={<CloudUploadOutlined />} type="primary" block size="large" style={{ borderRadius: 8 }}>
                  Chọn logo mới
                </Button>
              </Upload>
            </Spin>
            <Typography variant="caption" color="text.secondary" display="block" mt={1} textAlign="center">
              Hỗ trợ JPG, PNG, SVG. Tối đa 10MB.
            </Typography>
          </Card>
        </Grid>

        {/* General Settings */}
        <Grid item xs={12} md={7}>
          <Card title="🏷️ Thông tin chung" bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', border: '1px solid #e5e7eb' }}>
            {loading ? (
              <Skeleton active paragraph={{ rows: 4 }} />
            ) : (
              <>
                {/* Site Name */}
                <Form form={siteNameForm} layout="vertical">
                  <Form.Item
                    label={<span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tên trang web</span>}
                    name="site_name"
                    rules={[{ required: true, message: 'Vui lòng nhập tên trang web!' }]}
                  >
                    <Input
                      prefix={<GlobalOutlined className="text-gray-400" />}
                      size="large"
                      style={inputStyle}
                      placeholder="Booking Admin Panel"
                    />
                  </Form.Item>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    loading={savingKey === 'site_name'}
                    onClick={() => handleSave('site_name', siteNameForm)}
                    style={{ borderRadius: 8 }}
                  >
                    Lưu tên
                  </Button>
                </Form>

                <Divider />

                {/* Contact Email */}
                <Form form={contactEmailForm} layout="vertical">
                  <Form.Item
                    label={<span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email liên hệ</span>}
                    name="contact_email"
                    rules={[
                      { required: true, message: 'Vui lòng nhập email!' },
                      { type: 'email', message: 'Email không hợp lệ!' },
                    ]}
                  >
                    <Input
                      prefix={<MailOutlined className="text-gray-400" />}
                      size="large"
                      style={inputStyle}
                      placeholder="admin@booking.com"
                    />
                  </Form.Item>
                  <Button
                    icon={<SaveOutlined />}
                    loading={savingKey === 'contact_email'}
                    onClick={() => handleSave('contact_email', contactEmailForm)}
                    style={{ borderRadius: 8 }}
                  >
                    Lưu email
                  </Button>
                </Form>

                <Divider />

                {/* Contact Phone */}
                <Form form={contactPhoneForm} layout="vertical">
                  <Form.Item
                    label={<span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Số điện thoại hỗ trợ</span>}
                    name="contact_phone"
                    rules={[
                      { pattern: /^[0-9+\-\s()]{7,15}$/, message: 'Số điện thoại không hợp lệ!' },
                    ]}
                  >
                    <Input
                      prefix={<PhoneOutlined className="text-gray-400" />}
                      size="large"
                      style={inputStyle}
                      placeholder="1900 1234"
                    />
                  </Form.Item>
                  <Button
                    icon={<SaveOutlined />}
                    loading={savingKey === 'contact_phone'}
                    onClick={() => handleSave('contact_phone', contactPhoneForm)}
                    style={{ borderRadius: 8 }}
                  >
                    Lưu số điện thoại
                  </Button>
                </Form>
              </>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings;
