// Vị trí: C2CTab.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@mui/material';
import { FaPlus, FaEdit, FaEyeSlash, FaTrash, FaClock, FaBan } from 'react-icons/fa';
import '../assets/css/c2c-tab.css';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import C2CProductFormModal from './C2CProductFormModal';
import { User } from '../types/user';
import * as sellerApi from '../api/seller.api';
// ✅ LỖI 1 ĐÃ FIX: IProductCardResponse giờ là interface "xịn"
import { ISellerProfile, IProductCardResponse, IProductRequest, ProductStatus } from '../types/seller';

// === Props ===
interface C2CTabProps {
  user: User | null;
}

// ... (Helper renders giữ nguyên) ...
const renderProductStatus = (status: ProductStatus) => {
  switch (status) {
    case 'APPROVED': return { text: 'Đang hiển thị', className: 'status-active' };
    case 'PENDING': return { text: 'Chờ duyệt', className: 'status-pending' };
    case 'REJECTED': return { text: 'Bị từ chối', className: 'status-sold' };
    case 'DISABLED': return { text: 'Đang ẩn', className: 'status-hidden' };
    default: return { text: 'Không rõ', className: 'status-hidden' };
  }
};
const renderCondition = (condition: any) => {
  switch (condition) {
    case 'new': return 'Mới 100%';
    case 'like_new': return 'Như mới 99%';
    case 'used': return 'Đã qua sử dụng';
    case 'for_parts': return 'Bán linh kiện';
    default: return 'Không rõ';
  }
};
const formatCurrency = (amount: number): string => {
  if (amount === undefined || amount === null) return '0 ₫';
  return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};


// === Component chính ===
const C2CTab: React.FC<C2CTabProps> = ({ user }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sellerProfile, setSellerProfile] = useState<ISellerProfile | null>(null);
  const [products, setProducts] = useState<IProductCardResponse[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // === Fetch seller profile ===
  const fetchSellerStatus = useCallback(async () => {
    // ... (Giữ nguyên logic này) ...
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
      else toast.error('Lỗi khi tải dữ liệu Business Profile.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // === Fetch sản phẩm của seller ===
  // ✅ SỬA LỖI 2: Không cần "sellerId" nữa, BE tự lấy từ token
  const fetchSellerProducts = useCallback(async () => {
    try {
      // ✅ SỬA LỖI 2: Gọi API đúng (page, size)
      const response = await sellerApi.getSellerProducts(0, 50); 
      const allProducts = response.data.content || [];

      // ✅ SỬA LỖI 2: XÓA BỎ LỌC THỪA THÃI
      // Backend đã lọc chuẩn cho sếp rồi!
      setProducts(allProducts);
      
    } catch (err: any) {
      console.error('Lỗi tải sản phẩm:', err.response || err);
      toast.error('Không thể tải danh sách sản phẩm.');
    }
  }, []); // <-- Dependency rỗng

  // === useEffect load profile ===
  useEffect(() => { fetchSellerStatus(); }, [fetchSellerStatus]);
  
  useEffect(() => {
    if (sellerProfile && sellerProfile.status === 'VERIFIED_SELLER') {
      // ✅ SỬA LỖI 2: Gọi không cần tham số
      fetchSellerProducts();
    }
  }, [sellerProfile, fetchSellerProducts]); // <-- Dependency vẫn chuẩn
  
  useEffect(() => {
    if (sellerProfile?.status === 'PENDING_REVIEW') {
      const interval = setInterval(fetchSellerStatus, 10000);
      return () => clearInterval(interval);
    }
  }, [sellerProfile, fetchSellerStatus]);

  // ... (handleApply giữ nguyên) ...
  const handleApply = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const { value: formValues, isConfirmed } = await Swal.fire({
      title: 'Đăng ký trở thành Business',
      html: `
        <input id="swal-shopName" class="swal2-input" placeholder="Tên Shop (bắt buộc)">
        <input id="swal-identityCard" class="swal2-input" placeholder="Số CCCD/MST (bắt buộc)">
        <input id="swal-phone" class="swal2-input" placeholder="Số điện thoại (bắt buộc)">
        <textarea id="swal-description" class="swal2-textarea" placeholder="Mô tả shop..."></textarea>
      `,
      showCancelButton: true,
      confirmButtonText: 'Gửi yêu cầu',
      cancelButtonText: 'Hủy',
      preConfirm: () => {
        const shopName = (document.getElementById('swal-shopName') as HTMLInputElement).value;
        const identityCard = (document.getElementById('swal-identityCard') as HTMLInputElement).value;
        const phone = (document.getElementById('swal-phone') as HTMLInputElement).value;
        const description = (document.getElementById('swal-description') as HTMLTextAreaElement).value;
        if (!shopName || !identityCard || !phone) {
          Swal.showValidationMessage('Tên Shop, CCCD/MST, và SĐT là bắt buộc!');
          return null;
        }
        return { shopName, identityCard, description, phone };
      }
    });
    if (isConfirmed && formValues) {
      try {
        setIsLoading(true);
        await sellerApi.applyForSeller(formValues);
        await Swal.fire('Đã gửi yêu cầu!', 'Hệ thống sẽ duyệt trong ít phút.', 'success');
        await fetchSellerStatus();
      } catch (error: any) {
        const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.';
        Swal.fire('Thất bại', errorMsg, 'error');
      } finally {
        setIsLoading(false);
        setIsSubmitting(false);
      }
    } else setIsSubmitting(false);
  };

  // === Lưu sản phẩm (thêm/sửa) ===
  const handleModalSave = async (formData: any) => {
    if (!sellerProfile) return;
    const requestData: IProductRequest = {
      name: formData.name,
      description: formData.description,
      price: formData.price,
      brand: formData.brand || null,
      imageUrl: formData.images[0] || '/default-image.jpg',
      stock: Number(formData.stock || 1),
      categoryId: Number(formData.category_id || '1'),
      specifications: [
        { name: 'Tình trạng', value: formData.condition },
        { name: 'Vị trí', value: formData.location }
      ]
    };
    try {
      setIsLoading(true);
      if (editingProduct) {
        await sellerApi.updateProduct(editingProduct.id, requestData);
        toast.success('Cập nhật tin thành công!');
      } else {
        // API addProduct của sếp vẫn cần sellerId, giữ nguyên là chuẩn
        await sellerApi.addProduct(requestData, sellerProfile.id); 
        await Swal.fire('Đã gửi!', 'Sản phẩm đang chờ duyệt.', 'success');
      }
      setIsModalOpen(false);
      
      // ✅ SỬA LỖI 2: Gọi fetch lại (không cần tham số)
      fetchSellerProducts();
      
    } catch (err: any) {
      console.error('Lỗi khi lưu sản phẩm:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Không thể lưu sản phẩm.');
    } finally {
      setIsLoading(false);
    }
  };

  // === Các handler khác ===
  const handleEdit = (product: IProductCardResponse) => {
    const fullProductData = {
      ...product,
      description: product.description || '',
      condition: product.condition || 'used',
      location: product.location || '',
      
      // ✅ LỖI 1 ĐÃ FIX: Giờ "product.categoryId" đã tồn tại
      category_id: String(product.categoryId || '1'), 
      
      images: [product.imageUrl],
      stock: Number(product.stock || 1)
    };
    setEditingProduct(fullProductData);
    setIsModalOpen(true);
  };
  const handlePostNew = () => { setEditingProduct(null); setIsModalOpen(true); };
  const handleToggleHide = () => Swal.fire('Chưa hỗ trợ', 'BE chưa build API ẩn tin!', 'info');
  const handleDelete = () => Swal.fire('Chưa hỗ trợ', 'BE chưa build API xóa tin!', 'info');

  // ... (Toàn bộ phần UI render giữ nguyên) ...
  if (isLoading) return <div className="wallet-loading">Đang tải dữ liệu Business...</div>;

  if (!sellerProfile)
    return (
      <div className="activate-wallet-container">
        <h3>Trở thành Business</h3>
        <p>Đăng ký gian hàng Business miễn phí để bắt đầu bán hàng!</p>
        <Button variant="contained" color="primary" onClick={handleApply} disabled={isSubmitting}>
          {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu trở thành Business'}
        </Button>
      </div>
    );

  if (sellerProfile.status === 'PENDING_REVIEW')
    return (
      <div className="activate-wallet-container">
        <h3 style={{ color: '#ffc107' }}><FaClock /> Hệ thống đang duyệt!</h3>
        <p>Hồ sơ Business "{sellerProfile.shopName}" đang chờ xét duyệt.</p>
      </div>
    );

  if (sellerProfile.status === 'BANNED_SELLER')
    return (
      <div className="activate-wallet-container">
        <h3 style={{ color: 'red' }}><FaBan /> GLOBAL BAN</h3>
        <p>Tài khoản Business "{sellerProfile.shopName}" đã bị khóa.</p>
      </div>
    );

  // === VERIFIED_SELLER ===
  return (
    <div className="c2c-tab-container">
      <div className="c2c-header">
        <h3 className="mb-3">Gian hàng Business: {sellerProfile.shopName}</h3>
        <Button variant="contained" color="primary" startIcon={<FaPlus />} onClick={handlePostNew}>
          Đăng tin mới
        </Button>
      </div>

      <div className="c2c-product-list">
        {products.length === 0 ? (
          <div className="c2c-empty-state">
            <p>Chưa có bài đăng sản phẩm</p>
            <Button variant="outlined" color="primary" onClick={handlePostNew}>Đăng tin đầu tiên</Button>
          </div>
        ) : (
          products.map(product => {
            const statusInfo = renderProductStatus(product.status);
            return (
              <div key={product.id} className="c2c-product-item shadow-sm">
                <img src={product.imageUrl || 'https://via.placeholder.com/150'} alt={product.name} className="c2c-product-image" />
                <div className="c2c-product-info">
                  <h5 className="product-name">{product.name}</h5>
                  <p className="product-price">{formatCurrency(product.price)}</p>
                  <p className="product-meta">
                    <span>{renderCondition(product.condition)}</span> | <span>{product.category}</span>
                  </p>
                  <span className={`product-status-badge ${statusInfo.className}`}>{statusInfo.text}</span>
                </div>
                <div className="c2c-product-actions">
                  <Button variant="outlined" size="small" startIcon={<FaEdit />} onClick={() => handleEdit(product)}>Sửa</Button>
                  <Button variant="outlined" size="small" color="secondary" startIcon={<FaEyeSlash />} onClick={() => handleToggleHide()} disabled={product.status === 'PENDING'}>Ẩn tin</Button>
                  <Button variant="outlined" size="small" color="error" startIcon={<FaTrash />} onClick={() => handleDelete()}>Xóa</Button>
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