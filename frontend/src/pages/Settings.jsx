import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Skeleton } from '@mui/material';
import { Card, Form, Input, Button, Upload, message, Spin, Divider } from 'antd';
import { UploadOutlined, SaveOutlined, CloudUploadOutlined } from '@ant-design/icons';
import { configAPI } from '../services/api';

const Settings = () => {
  const [logoUrl, setLogoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    configAPI.getLogo()
      .then(res => setLogoUrl(res.data.url))
      .catch(() => setLogoUrl('https://placehold.co/200x60?text=Admin+Logo'))
      .finally(() => setLoading(false));
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
    return false; // prevent auto-upload
  };

  const handleSaveSetting = async (key, values) => {
    try {
      await configAPI.update(key, values[key]);
      message.success('✅ Cài đặt đã được lưu!');
    } catch {
      message.error('❌ Lưu thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} color="text.primary" mb={3}>
        ⚙️ Cấu hình hệ thống
      </Typography>

      <Grid container spacing={3}>
        {/* Logo Management */}
        <Grid item xs={12} md={5}>
          <Card title="🖼️ Logo trang web" bordered={false} style={{ borderRadius: 8, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', border: '1px solid #e5e7eb' }}>
            <Box mb={3} display="flex" alignItems="center" justifyContent="center"
              sx={{ background: '#f9fafb', borderRadius: 2, p: 3, minHeight: 100, border: '2px dashed #e5e7eb' }}>
              {loading ? <Skeleton variant="rectangular" width={200} height={60} /> : (
                <img src={logoUrl} alt="Current Logo" style={{ maxHeight: 80, maxWidth: 240, objectFit: 'contain' }} />
              )}
            </Box>
            <Spin spinning={uploading} tip="Đang tải lên...">
              <Upload beforeUpload={(file) => { handleLogoUpload({ file }); return false; }} showUploadList={false} accept="image/*">
                <Button icon={<CloudUploadOutlined />} type="primary" block size="large">
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
          <Card title="🏷️ Thông tin chung" bordered={false} style={{ borderRadius: 8, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', border: '1px solid #e5e7eb' }}>
            <Form layout="vertical">
              <Form.Item label="Tên trang web" name="site_name">
                <Input defaultValue="Booking Admin Panel" size="large" />
              </Form.Item>
              <Button
                type="primary" icon={<SaveOutlined />}
                onClick={() => form.validateFields().then(v => handleSaveSetting('site_name', v))}
              >
                Lưu tên
              </Button>
            </Form>

            <Divider />

            <Form layout="vertical">
              <Form.Item label="Email liên hệ" name="contact_email">
                <Input defaultValue="admin@booking.com" size="large" type="email" />
              </Form.Item>
              <Button
                type="default" icon={<SaveOutlined />}
                onClick={() => form.validateFields().then(v => handleSaveSetting('contact_email', v))}
              >
                Lưu email
              </Button>
            </Form>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings;
