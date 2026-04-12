import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, ImageList, ImageListItem, ImageListItemBar, 
  IconButton, Fab, Skeleton, Grid, Card, CardMedia, CardContent,
  Chip, TextField, InputAdornment, Dialog, DialogTitle, DialogContent,
  Button, Select, MenuItem, FormControl, InputLabel, Tabs, Tab
} from '@mui/material';
import { 
  Delete as DeleteIcon, Add as AddIcon, Search as SearchIcon,
  CloudUpload as CloudUploadIcon, Collections as CollectionsIcon,
  Link as LinkIcon, ZoomIn as ZoomInIcon, FilterList as FilterListIcon,
  Edit as EditIcon, Image as ImageIcon
} from '@mui/icons-material';
import { Modal, Upload, Input, Button as AntButton, message, Spin, Empty, Select as AntSelect } from 'antd';
import { InboxOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { galleryAPI, configAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const { Dragger } = Upload;

const IMAGE_CATEGORIES = [
  { value: 'hotel', label: '🏨 Khách sạn', color: '#6366f1' },
  { value: 'flight', label: '✈️ Máy bay', color: '#06b6d4' },
  { value: 'car', label: '🚗 Thuê xe', color: '#10b981' },
  { value: 'attraction', label: '🎢 Tham quan', color: '#f59e0b' },
  { value: 'general', label: '🖼️ Chung', color: '#8b5cf6' },
];

const IMAGE_KEYS = [
  { value: 'img.home.hero', label: 'Trang chủ - Banner Hero' },
  { value: 'img.home.hcmc', label: 'Trang chủ - Card TP. Hồ Chí Minh' },
  { value: 'img.home.dalat', label: 'Trang chủ - Card Đà Lạt' },
  { value: 'img.login.bg', label: 'Đăng nhập - Ảnh nền' },
  { value: 'img.register.bg', label: 'Đăng ký - Ảnh nền' },
  { value: 'img.home.featured1', label: 'Trang chủ - Điểm đến nổi bật 1' },
  { value: 'img.home.featured2', label: 'Trang chủ - Điểm đến nổi bật 2' },
  { value: 'img.home.featured3', label: 'Trang chủ - Điểm đến nổi bật 3' },
  { value: 'img.home.featured4', label: 'Trang chủ - Điểm đến nổi bật 4' },
  { value: 'img.flights.hero', label: 'Trang Vé Máy Bay - Ảnh nền' },
  { value: 'img.flighthotel.hero', label: 'Trang Chuyến bay + KS - Ảnh nền' },
  { value: 'img.carrentals.hero', label: 'Trang Thuê ô tô - Ảnh nền' },
  { value: 'img.attractions.hero', label: 'Trang Địa điểm tham quan - Ảnh nền' },
  { value: 'img.taxis.hero', label: 'Trang Taxi sân bay - Ảnh nền' },
];

const Gallery = () => {
  const { api } = useAuth();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('general');
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [viewMode, setViewMode] = useState(0); // 0: grid, 1: list
  
  // Modals
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState(null);
  const [selectedKey, setSelectedKey] = useState('');
  const [mapping, setMapping] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingImage, setEditingImage] = useState(null);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const res = await galleryAPI.getAll();
      setImages(res.data);
    } catch (err) {
      setImages(getMockImages());
    } finally {
      setLoading(false);
    }
  };

  const getMockImages = () => [
    { id: 1, url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400', title: 'Hotel Lobby', category: 'hotel' },
    { id: 2, url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400', title: 'Landmark 81', category: 'attraction' },
    { id: 3, url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400', title: 'Pool Area', category: 'hotel' },
    { id: 4, url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', title: 'Deluxe Room', category: 'hotel' },
    { id: 5, url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400', title: 'Hotel Exterior', category: 'hotel' },
    { id: 6, url: 'https://images.unsplash.com/photo-1551882547-ff43c63faf76?w=400', title: 'Dining Area', category: 'hotel' },
    { id: 7, url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400', title: 'Flight View', category: 'flight' },
    { id: 8, url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400', title: 'Road Trip', category: 'car' },
  ];

  useEffect(() => { fetchImages(); }, []);

  const filteredImages = images.filter(img => {
    const matchesSearch = img.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         img.url?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || img.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Xóa ảnh',
      content: 'Bạn có chắc muốn xóa ảnh này? Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await galleryAPI.delete(id);
          setImages(prev => prev.filter(img => img.id !== id));
          message.success('Đã xóa ảnh thành công!');
        } catch {
          message.error('Xóa thất bại.');
        }
      }
    });
  };

  const handleBulkUpload = async () => {
    if (selectedFiles.length === 0) { message.warning('Vui lòng chọn ít nhất một ảnh.'); return; }
    setUploading(true);
    
    let successCount = 0;
    for (const file of selectedFiles) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title || file.name);
      try {
        const res = await galleryAPI.upload(formData);
        setImages(prev => [res.data, ...prev]);
        successCount++;
      } catch { /* continue */ }
    }
    
    setUploading(false);
    if (successCount > 0) {
      message.success(`Đã tải lên ${successCount} ảnh!`);
      setUploadOpen(false);
      setSelectedFiles([]);
      setTitle('');
      setCategory('general');
    } else {
      message.error('Tải lên thất bại.');
    }
  };

  const handleMapImage = async () => {
    if (!selectedKey) { message.warning('Vui lòng chọn vị trí!'); return; }
    setMapping(true);
    try {
      await configAPI.update(selectedKey, selectedGalleryImage.url);
      message.success('Đã gắn ảnh thành công!');
      setMapModalOpen(false);
    } catch {
      message.error('Có lỗi xảy ra khi gắn ảnh.');
    } finally {
      setMapping(false);
    }
  };

  const openPreview = (img) => {
    setPreviewImage(img);
    setPreviewOpen(true);
  };

  const openEdit = (img) => {
    setEditingImage({ ...img });
    setEditModalOpen(true);
  };

  const saveEdit = async () => {
    // In a real app, this would call an API to update
    setImages(prev => prev.map(img => img.id === editingImage.id ? editingImage : img));
    message.success('Đã cập nhật thông tin ảnh!');
    setEditModalOpen(false);
  };

  const getCategoryColor = (cat) => IMAGE_CATEGORIES.find(c => c.value === cat)?.color || '#8b5cf6';

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h5" fontWeight={700} color="text.primary">
            🖼️ Thư viện ảnh
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {filteredImages.length} / {images.length} ảnh
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<CloudUploadIcon />}
          onClick={() => setUploadOpen(true)}
          sx={{ backgroundColor: '#006ce4', '&:hover': { backgroundColor: '#003580' }, textTransform: 'none', borderRadius: '12px', fontWeight: 600 }}
        >
          Tải ảnh lên
        </Button>
      </Box>

      {/* Search & Filter Bar */}
      <Card sx={{ mb: 3, p: 2, borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', border: '1px solid #e5e7eb' }}>
        <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
          <Input
            placeholder="Tìm kiếm ảnh..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            prefix={<SearchIcon sx={{ color: '#9ca3af', fontSize: 20 }} />}
            style={{ width: 300, borderRadius: 12 }}
            allowClear
          />
          <AntSelect
            placeholder="Lọc theo danh mục"
            value={filterCategory || undefined}
            onChange={(value) => setFilterCategory(value || '')}
            style={{ width: 180 }}
            allowClear
          >
            <AntSelect.Option value="">Tất cả danh mục</AntSelect.Option>
            {IMAGE_CATEGORIES.map(cat => (
              <AntSelect.Option key={cat.value} value={cat.value}>{cat.label}</AntSelect.Option>
            ))}
          </AntSelect>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', ml: 'auto' }}>
            <Tabs value={viewMode} onChange={(e, v) => setViewMode(v)}>
              <Tab icon={<CollectionsIcon />} iconPosition="start" label="Lưới" />
              <Tab icon={<FilterListIcon />} iconPosition="start" label="Danh sách" />
            </Tabs>
          </Box>
        </Box>
      </Card>

      {/* Image Grid/List */}
      {loading ? (
        <Grid container spacing={2}>
          {[1,2,3,4,5,6].map(i => (
            <Grid item xs={6} sm={4} md={3} key={i}>
              <Skeleton variant="rounded" height={200} />
            </Grid>
          ))}
        </Grid>
      ) : filteredImages.length === 0 ? (
        <Empty 
          description={searchTerm || filterCategory ? "Không tìm thấy ảnh phù hợp" : "Chưa có ảnh nào"} 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : viewMode === 0 ? (
        <ImageList cols={4} gap={12} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          {filteredImages.map((img) => (
            <ImageListItem key={img.id} sx={{ 
              borderRadius: 2, 
              overflow: 'hidden', 
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'scale(1.02)' },
              '&:hover .MuiImageListItemBar-root': { opacity: 1 }
            }}>
              <img 
                src={img.url} 
                alt={img.title} 
                loading="lazy"
                onClick={() => openPreview(img)}
                style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} 
              />
              <ImageListItemBar
                title={img.title}
                subtitle={img.category ? IMAGE_CATEGORIES.find(c => c.value === img.category)?.label : ''}
                sx={{ 
                  opacity: 0, 
                  transition: 'opacity 0.2s', 
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' 
                }}
                actionIcon={
                  <Box>
                    <IconButton onClick={() => openPreview(img)} sx={{ color: '#fff' }} title="Xem trước">
                      <ZoomInIcon />
                    </IconButton>
                    <IconButton onClick={() => { setSelectedGalleryImage(img); setMapModalOpen(true); }} sx={{ color: '#fff' }} title="Gắn vào trang">
                      <LinkIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(img.id)} sx={{ color: '#fff' }} title="Xóa">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
              />
              {img.category && (
                <Chip 
                  label={IMAGE_CATEGORIES.find(c => c.value === img.category)?.label}
                  size="small"
                  sx={{ 
                    position: 'absolute', 
                    top: 8, 
                    left: 8,
                    backgroundColor: getCategoryColor(img.category),
                    color: '#fff',
                    fontSize: '0.7rem'
                  }}
                />
              )}
            </ImageListItem>
          ))}
        </ImageList>
      ) : (
        <Box>
          {filteredImages.map((img) => (
            <Card key={img.id} sx={{ display: 'flex', mb: 2, p: 1, '&:hover': { boxShadow: 3 } }}>
              <Box 
                component="img" 
                sx={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 1, cursor: 'pointer' }}
                src={img.url} 
                alt={img.title}
                onClick={() => openPreview(img)}
              />
              <CardContent sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>{img.title || 'Không có tiêu đề'}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                    {img.url}
                  </Typography>
                  {img.category && (
                    <Chip 
                      label={IMAGE_CATEGORIES.find(c => c.value === img.category)?.label}
                      size="small"
                      sx={{ mt: 1, backgroundColor: getCategoryColor(img.category), color: '#fff' }}
                    />
                  )}
                </Box>
                <Box>
                  <IconButton onClick={() => { setSelectedGalleryImage(img); setMapModalOpen(true); }} title="Gắn vào trang">
                    <LinkIcon />
                  </IconButton>
                  <IconButton onClick={() => openEdit(img)} title="Chỉnh sửa">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(img.id)} color="error" title="Xóa">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* FAB */}
      <Fab 
        color="primary" 
        aria-label="add" 
        onClick={() => setUploadOpen(true)}
        sx={{ 
          position: 'fixed', 
          bottom: 32, 
          right: 32, 
          backgroundColor: '#6366f1',
          '&:hover': { backgroundColor: '#4f46e5' }
        }}
      >
        <AddIcon />
      </Fab>

      {/* Upload Modal */}
      <Modal
        title={<Typography variant="h6">📤 Tải ảnh lên thư viện</Typography>}
        open={uploadOpen}
        onCancel={() => { setUploadOpen(false); setSelectedFiles([]); setTitle(''); setCategory('general'); }}
        footer={null}
        width={600}
      >
        <Spin spinning={uploading} tip="Đang tải lên...">
          <Dragger
            multiple
            beforeUpload={(file) => { 
              setSelectedFiles(prev => [...prev, file]); 
              return false; 
            }}
            fileList={selectedFiles.map((f, i) => ({ 
              uid: i, 
              name: f.name, 
              status: 'done',
              size: f.size,
            }))}
            accept="image/*"
            maxCount={10}
            onRemove={(file) => {
              setSelectedFiles(prev => prev.filter(f => f.name !== file.name));
            }}
          >
            <p className="ant-upload-drag-icon"><InboxOutlined style={{ fontSize: 48, color: '#6366f1' }} /></p>
            <p className="ant-upload-text">Kéo thả hoặc nhấn để chọn ảnh</p>
            <p className="ant-upload-hint">Hỗ trợ JPG, PNG, GIF. Tối đa 10MB mỗi ảnh. Có thể tải nhiều ảnh cùng lúc.</p>
          </Dragger>
          
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="Tiêu đề ảnh (tùy chọn)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              size="small"
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Danh mục</InputLabel>
              <Select
                value={category}
                label="Danh mục"
                onChange={(e) => setCategory(e.target.value)}
              >
                {IMAGE_CATEGORIES.map(cat => (
                  <MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <AntButton onClick={() => setUploadOpen(false)}>Hủy</AntButton>
            <AntButton 
              type="primary" 
              icon={<UploadOutlined />} 
              onClick={handleBulkUpload}
              disabled={selectedFiles.length === 0}
              style={{ backgroundColor: '#6366f1' }}
            >
              Tải lên ({selectedFiles.length})
            </AntButton>
          </Box>
        </Spin>
      </Modal>

      {/* Preview Modal */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md">
        {previewImage && (
          <>
            <DialogTitle>{previewImage.title || 'Xem trước ảnh'}</DialogTitle>
            <DialogContent>
              <img 
                src={previewImage.url} 
                alt={previewImage.title}
                style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: 8 }} 
              />
              <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip 
                  label={IMAGE_CATEGORIES.find(c => c.value === previewImage.category)?.label || 'Chưa phân loại'}
                  sx={{ backgroundColor: getCategoryColor(previewImage.category), color: '#fff' }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
                  ID: {previewImage.id}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, wordBreak: 'break-all' }}>
                URL: {previewImage.url}
              </Typography>
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* Map Image Modal */}
      <Modal
        title="🔗 Gắn ảnh vào giao diện Website"
        open={mapModalOpen}
        onCancel={() => { setMapModalOpen(false); setSelectedGalleryImage(null); setSelectedKey(''); }}
        footer={null}
      >
        <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Chọn vị trí bạn muốn hiển thị bức ảnh này trên trang Demo:
            </Typography>
            {selectedGalleryImage && (
                <Box 
                  component="img" 
                  src={selectedGalleryImage.url} 
                  alt="preview" 
                  sx={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 2, mb: 2 }} 
                />
            )}
            <FormControl fullWidth size="small">
              <InputLabel>Chọn vị trí</InputLabel>
              <Select
                value={selectedKey}
                label="Chọn vị trí"
                onChange={(e) => setSelectedKey(e.target.value)}
              >
                {IMAGE_KEYS.map(key => (
                  <MenuItem key={key.value} value={key.value}>{key.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
        </Box>
        <AntButton 
          type="primary" 
          block 
          onClick={handleMapImage} 
          loading={mapping}
          style={{ backgroundColor: '#6366f1' }}
        >
           Lưu thay đổi
        </AntButton>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="✏️ Chỉnh sửa thông tin ảnh"
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        onOk={saveEdit}
        okText="Lưu"
      >
        {editingImage && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Tiêu đề"
              value={editingImage.title || ''}
              onChange={(e) => setEditingImage({ ...editingImage, title: e.target.value })}
            />
            <FormControl fullWidth size="small">
              <InputLabel>Danh mục</InputLabel>
              <Select
                value={editingImage.category || 'general'}
                label="Danh mục"
                onChange={(e) => setEditingImage({ ...editingImage, category: e.target.value })}
              >
                {IMAGE_CATEGORIES.map(cat => (
                  <MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="URL"
              value={editingImage.url || ''}
              multiline
              rows={2}
              disabled
            />
          </Box>
        )}
      </Modal>
    </Box>
  );
};

export default Gallery;