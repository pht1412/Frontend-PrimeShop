// Vị trí: src/components/C2CProductFormModal.tsx
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  TextField, 
  Button, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Select,
  Grid
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import '../assets/css/c2c-form-modal.css'; 

// === FIX 1: "ĐỊNH NGHĨA" "LẠI" "TYPE" (VÌ "ĐÃ" "XÓA" "IMPORT" "MOCK") ===
type C2CProductCondition = 'new' | 'like_new' | 'used' | 'for_parts';

// === FIX 2: "ĐỊNH NGHĨA" "TYPE" "CHUẨN" $10k/hr (THAY "any") ===
// "Đây" "là" "cái" "khuôn" "cho" "Form" "của" "chúng ta"
interface IC2CFormData {
  name: string;
  description: string;
  price: number;
  brand: string | null;
  images: string[]; // "Form" "dùng" "cái" "này" "để" "load" "vào" "useEffect"
  category_id: string; // "Form" "dùng" "string"
  condition: C2CProductCondition; // "Ăn" "theo" "Fix 1"
  location: string;
  stock: number; // ✅ BỔ SUNG TRƯỜNG CÒN THIẾU
}

// "Props" "vẫn" "dùng" "any" "cho" "productToEdit" "vì" "logic" "fake" "ở" "C2CTab"
interface C2CFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: any) => void;
  productToEdit: any | null; 
}

// "FIX 2": "SỬA" "any" "THÀNH" "TYPE" "XỊN" "IC2CFormData"
const defaultEmptyProduct: IC2CFormData = { 
  name: '',
  description: '',
  price: 0,
  brand: '',
  images: [], 
  category_id: '',
  condition: 'used', // "Mặc định"
  location: '',
  stock: 1, // ✅ BỔ SUNG TRƯỜNG CÒN THIẾU (mặc định là 1)
};

const C2CProductFormModal: React.FC<C2CFormModalProps> = ({ isOpen, onClose, onSave, productToEdit }) => {
  
  // "FIX 2": "TYPE" "HÓA" "CÁI" "STATE" "NÀY"
  const [formData, setFormData] = useState<IC2CFormData>(defaultEmptyProduct);
  const [imageInput, setImageInput] = useState('');

  // "useEffect" "giờ" "chuẩn" "type"
  useEffect(() => {
    if (productToEdit) {
      setFormData(productToEdit); // "productToEdit" (any) "vẫn" "được" "nhét" "vào" "state" (IC2CFormData)
      setImageInput(productToEdit.images.join(', '));
    } else {
      setFormData(defaultEmptyProduct);
      setImageInput('');
    }
  }, [productToEdit, isOpen]);

  // "handleChange" (FIX 2) -> "prev" "giờ" "đã" "có" "type" "IC2CFormData" -> "HẾT" "LỖI"
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      // ✅ CẬP NHẬT: Thêm "stock" vào logic parse số
      [name]: (name === 'price' || name === 'stock') ? parseFloat(value) : value,
    }));
  };

  // "handleSelectChange" (FIX 2) -> "prev" "giờ" "đã" "có" "type" -> "HẾT" "LỖI"
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: value,
    }));
  };
  
  // "handleImageChange" (Giữ nguyên)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageInput(e.target.value);
  };

  // "handleSubmit" (Giữ nguyên)
  // (formData đã tự động có "stock" nên không cần sửa)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const imagesArray = imageInput.split(',').map(img => img.trim()).filter(img => img.length > 0);
    
    // "Truyền" "ra" "ngoài"
    onSave({
      ...formData,
      images: imagesArray,
      // "Mock" "tạm" "mấy" "trường" "này" "vì" "BE" "không" "cần"
      id: productToEdit?.id || `c2c-${Date.now()}`,
      sellerId: productToEdit?.sellerId || 'user_123',
      created_at: productToEdit?.created_at || new Date().toISOString(),
    });
  };

  // "conditionOptions" (FIX 1) -> "C2CProductCondition" "giờ" "đã" "tồn tại" -> "HẾT" "LỖI"
  const conditionOptions: { value: C2CProductCondition, label: string }[] = [
    { value: 'new', label: 'Mới 100%' },
    { value: 'like_new', label: 'Như mới 99%' },
    { value: 'used', label: 'Đã qua sử dụng' },
    { value: 'for_parts', label: 'Bán linh kiện/Hỏng' },
  ];

  // ... (Phần return JSX "giữ nguyên" "y hệt") ...
  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {productToEdit ? 'Chỉnh sửa tin đăng' : 'Tạo tin đăng mới'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent className="c2c-form-content">
          <Grid container spacing={2}>
            {/* Tên sản phẩm */}
            <Grid item xs={12} md={8}>
              <TextField
                name="name"
                label="Tên sản phẩm (Tiêu đề tin)"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
                variant="outlined"
              />
            </Grid>
            {/* Giá bán */}
            <Grid item xs={12} md={4}>
              <TextField
                name="price"
                label="Giá bán (VND)"
                type="number"
                value={formData.price}
                onChange={handleChange}
                fullWidth
                required
                variant="outlined"
              />
            </Grid>
            {/* Tình trạng */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined" required>
                <InputLabel id="condition-label">Tình trạng</InputLabel>
                <Select
                  labelId="condition-label"
                  name="condition"
                  value={formData.condition}
                  onChange={handleSelectChange}
                  label="Tình trạng"
                >
                  {conditionOptions.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {/* Vị trí */}
            <Grid item xs={12} md={6}>
              <TextField
                name="location"
                label="Vị trí (Ví dụ: Quận 1, TP.HCM)"
                value={formData.location}
                onChange={handleChange}
                fullWidth
                required
                variant="outlined"
              />
            </Grid>
            
            {/* ✅ BỔ SUNG TRƯỜNG MỚI (CHIA LẠI GRID) */}
            <Grid item xs={12} md={4}>
               <TextField name="brand" label="Thương hiệu" value={formData.brand} onChange={handleChange} fullWidth variant="outlined" />
            </Grid>
            <Grid item xs={12} md={4}>
               <TextField name="category_id" label="Danh mục (ID)" value={formData.category_id} onChange={handleChange} fullWidth variant="outlined" />
            </Grid>
            <Grid item xs={12} md={4}>
               <TextField 
                name="stock" 
                label="Số lượng tồn kho" 
                type="number"
                value={formData.stock} 
                onChange={handleChange} 
                fullWidth 
                variant="outlined"
                required
              />
            </Grid>
            
            {/* Mô tả */}
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Mô tả chi tiết"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={5}
                required
                variant="outlined"
              />
            </Grid>
            {/* Link ảnh */}
            <Grid item xs={12}>
              <TextField
                name="images"
                label="Link hình ảnh (cách nhau bằng dấu phẩy)"
                value={imageInput}
                onChange={handleImageChange}
                fullWidth
                multiline
                rows={2}
                variant="outlined"
                placeholder="https://link1.jpg, https://link2.jpg, ..."
                helperText="Sếp ơi! Tạm thời nhập link ảnh. Task sau em làm UI Upload kéo thả 'mlem' hơn nhé!"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="secondary">
            Huỷ bỏ
          </Button>
          <Button type="submit" variant="contained" color="primary">
            {productToEdit ? 'Lưu thay đổi' : 'Đăng tin'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default C2CProductFormModal;