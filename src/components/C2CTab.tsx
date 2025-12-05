import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@mui/material';
import { FaPlus, FaEdit, FaEyeSlash, FaTrash, FaClock, FaBan } from 'react-icons/fa';
import '../assets/css/c2c-tab.css';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import C2CProductFormModal from './C2CProductFormModal';
import { User } from '../types/user';
import * as sellerApi from '../api/seller.api';
import { ISellerProfile, IProductCardResponse, IProductRequest, ProductStatus } from '../types/seller';

interface C2CTabProps {
  user: User | null;
}

// --- [HELPER MỚI] ĐÀO DỮ LIỆU TRONG SPECS ---
// Hàm này giúp tìm kiếm giá trị trong mảng specs nếu field chính bị thiếu
const getSpecValue = (product: any, keyName: string): string | null => {
  // 1. Nếu có field trực tiếp thì dùng luôn
  if (product[keyName]) return product[keyName];

  // 2. Nếu không, đi lục trong mảng specs
  if (product.specs && Array.isArray(product.specs)) {
    // Tìm spec có name trùng với keyName (không phân biệt hoa thường)
    const found = product.specs.find((s: any) => 
      s.name?.toLowerCase() === keyName.toLowerCase() || 
      // Mapping tiếng Việt/Anh phòng hờ
      (keyName === 'condition' && s.name === 'Tình trạng') ||
      (keyName === 'location' && s.name === 'Vị trí')
    );
    return found ? found.value : null;
  }
  return null;
};
// ----------------------------------------------

const renderProductStatus = (status: ProductStatus | string | undefined) => {
  const normalizedStatus = status ? String(status).toUpperCase() : '';
  switch (normalizedStatus) {
    case 'APPROVED': 
    case 'VERIFIED': return { text: 'Đang hiển thị', className: 'status-active' };
    case 'PENDING': 
    case 'PENDING_REVIEW': return { text: 'Chờ duyệt', className: 'status-pending' };
    case 'REJECTED': return { text: 'Bị từ chối', className: 'status-sold' };
    case 'DISABLED': 
    case 'HIDDEN': return { text: 'Đang ẩn', className: 'status-hidden' };
    default: return { text: `Khác (${status || 'Null'})`, className: 'status-hidden' };
  }
};

const renderCondition = (condition: any) => {
  // Chuẩn hóa input đầu vào để switch case bắt dính
  const val = condition ? String(condition).toLowerCase() : '';
  switch (val) {
    case 'new': return 'Mới 100%';
    case 'like_new': return 'Như mới 99%';
    case 'used': return 'Đã qua sử dụng';
    case 'for_parts': return 'Bán linh kiện';
    default: return 'Không rõ'; // Nếu vẫn không khớp thì chịu
  }
};

const formatCurrency = (amount: number): string => {
  if (amount === undefined || amount === null) return '0 ₫';
  return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

const C2CTab: React.FC<C2CTabProps> = ({ user }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sellerProfile, setSellerProfile] = useState<ISellerProfile | null>(null);
  const [products, setProducts] = useState<IProductCardResponse[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  const fetchSellerStatus = useCallback(async () => {
    if (!user) {
      setSellerProfile(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await sellerApi.getMyBusinessProfile();
      setSellerProfile(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) setSellerProfile(null);
      else toast.error('Lỗi tải Business Profile.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const fetchSellerProducts = useCallback(async (currentSellerId: number) => {
    try {
      const response = await sellerApi.getSellerProducts(currentSellerId, 0, 50); 
      let allProducts: IProductCardResponse[] = [];
      if (response.data && Array.isArray(response.data.content)) {
          allProducts = response.data.content;
      } else if (Array.isArray(response.data)) {
          allProducts = response.data;
      }
      setProducts(allProducts);
    } catch (err: any) {
      console.error('Lỗi tải sản phẩm:', err);
    }
  }, []);

  useEffect(() => { fetchSellerStatus(); }, [fetchSellerStatus]);
  
  useEffect(() => {
    if (sellerProfile && sellerProfile.status === 'VERIFIED_SELLER' && sellerProfile.id) {
      fetchSellerProducts(sellerProfile.id);
    }
  }, [sellerProfile, fetchSellerProducts]);
  
  useEffect(() => {
    if (sellerProfile?.status === 'PENDING_REVIEW') {
      const interval = setInterval(fetchSellerStatus, 10000);
      return () => clearInterval(interval);
    }
  }, [sellerProfile, fetchSellerStatus]);

  const handleApply = async () => { /* ... Giữ nguyên logic Apply ... */ };

  // === [FIXED] HÀM XỬ LÝ LƯU (CREATE/UPDATE) ===
  const handleModalSave = async (formData: any) => {
    if (!sellerProfile) return;
    
    // Chuẩn bị payload gửi về Backend
    // Backend cần nhận thông tin trong 'specs' list
    const requestData: IProductRequest = {
      name: formData.name,
      description: formData.description,
      price: formData.price,
      brand: formData.brand || null,
      imageUrl: formData.images[0] || '', // Lấy ảnh đầu tiên làm ảnh đại diện
      stock: Number(formData.stock || 1),
      categoryId: Number(formData.category_id || '1'),
      
      // [QUAN TRỌNG] Map dữ liệu từ Form vào cấu trúc Specs mà Backend cần
      specs: [
        { name: 'Tình trạng', value: formData.condition }, // Backend lưu cái này
        { name: 'Vị trí', value: formData.location }       // Backend lưu cái này
      ]
    };

    try {
      setIsLoading(true);
      if (editingProduct) {
        await sellerApi.updateProduct(editingProduct.id, requestData);
        toast.success('Cập nhật thành công!');
      } else {
        await sellerApi.addProduct(requestData, sellerProfile.id); 
        await Swal.fire('Thành công!', 'Đã đăng tin mới.', 'success');
      }
      setIsModalOpen(false);
      if (sellerProfile?.id) fetchSellerProducts(sellerProfile.id);
      
    } catch (err: any) {
      console.error('Lỗi lưu SP:', err);
      toast.error(err.response?.data?.message || 'Lỗi hệ thống.');
    } finally {
      setIsLoading(false);
    }
  };

  // === [FIXED] HÀM MỞ FORM SỬA (LẤY DỮ LIỆU TỪ SPECS RA) ===
  const handleEdit = (product: IProductCardResponse) => {
    // 1. Dùng hàm helper để móc dữ liệu từ specs ra
    const realCondition = getSpecValue(product, 'condition') || 'used'; 
    const realLocation = getSpecValue(product, 'location') || '';

    // 2. Fill vào form data
    const fullProductData = {
      ...product,
      description: product.description || '',
      category_id: String(product.categoryId || '1'), 
      images: [product.imageUrl],
      stock: Number(product.stock || 1),
      
      // Gán giá trị thực tế đã tìm được
      condition: realCondition, 
      location: realLocation
    };
    
    setEditingProduct(fullProductData);
    setIsModalOpen(true);
  };
  
  const handlePostNew = () => { setEditingProduct(null); setIsModalOpen(true); };
  const handleToggleHide = () => Swal.fire('Thông báo', 'Tính năng đang phát triển', 'info');
  const handleDelete = () => Swal.fire('Thông báo', 'Tính năng đang phát triển', 'info');

  if (isLoading) return <div className="wallet-loading">Đang tải dữ liệu...</div>;
  if (!sellerProfile) return ( /* ... Giữ nguyên ... */ <div className="activate-wallet-container"><Button onClick={handleApply}>Đăng ký Business</Button></div> );

  // ... (Các đoạn check status PENDING/BANNED giữ nguyên) ...

  return (
    <div className="c2c-tab-container">
      <div className="c2c-header">
        <h3 className="mb-3">Gian hàng: {sellerProfile.shopName}</h3>
        <Button variant="contained" color="primary" startIcon={<FaPlus />} onClick={handlePostNew}>
          Đăng tin mới
        </Button>
      </div>

      <div className="c2c-product-list">
        {products.length === 0 ? (
          <div className="c2c-empty-state"><p>Chưa có tin đăng nào</p></div>
        ) : (
          products.map(product => {
            const statusInfo = renderProductStatus(product.status);
            
            // [FIXED] Dùng hàm helper để lấy condition thực tế hiển thị ra UI
            const displayCondition = getSpecValue(product, 'condition');

            return (
              <div key={product.id} className="c2c-product-item shadow-sm">
                <img src={product.imageUrl || 'https://via.placeholder.com/150'} alt={product.name} className="c2c-product-image" />
                <div className="c2c-product-info">
                  <h5 className="product-name">{product.name}</h5>
                  <p className="product-price">{formatCurrency(product.price)}</p>
                  
                  {/* [FIXED] Hiển thị đúng tình trạng lấy từ specs */}
                  <p className="product-meta">
                    <span>{renderCondition(displayCondition)}</span> | <span>{product.category}</span>
                  </p>
                  
                  <span className={`product-status-badge ${statusInfo.className}`}>{statusInfo.text}</span>
                </div>
                <div className="c2c-product-actions">
                  <Button variant="outlined" size="small" startIcon={<FaEdit />} onClick={() => handleEdit(product)}>Sửa</Button>
                  <Button variant="outlined" size="small" color="secondary" onClick={handleToggleHide}>Ẩn</Button>
                  <Button variant="outlined" size="small" color="error" onClick={handleDelete}>Xóa</Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <C2CProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productToEdit={editingProduct}
        onSave={handleModalSave}
      />
    </div>
  );
};

export default C2CTab;