// Vị trí: src/pages/admin/AdminC2CManagementPage.tsx
import React, { useState, useEffect } from 'react';
import {
  C2CProduct,
  fetchPendingC2CProducts,
  mockApproveC2CProduct,
  mockRejectC2CProduct
} from '../../mocks/mockDataC2C';
import Swal from 'sweetalert2';
import { Button } from '@mui/material';
import { FaCheck, FaTimes } from 'react-icons/fa';
import './admin.css'; // File CSS mới
import { toast } from 'react-toastify';

// Hàm helper (tái sử dụng)
const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND'
  });
};

const AdminC2CManagementPage: React.FC = () => {
  const [pendingList, setPendingList] = useState<C2CProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Hàm fetch data
  const loadPendingProducts = async () => {
    try {
      setIsLoading(true);
      const data = await fetchPendingC2CProducts();
      setPendingList(data);
    } catch (error) {
      toast.error('Không thể tải danh sách chờ duyệt!');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data khi component mount
  useEffect(() => {
    loadPendingProducts();
  }, []);

  // Luồng "Duyệt" (Approve)
  const handleApprove = (id: string) => {
    Swal.fire({
      title: 'Duyệt tin đăng này?',
      text: "Tin sẽ được hiển thị công khai trên gian hàng C2C.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745', // Màu xanh lá
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Đồng ý, Duyệt!',
      cancelButtonText: 'Huỷ bỏ'
    }).then(async (result) => {
      if (result.isConfirmed) {
        await mockApproveC2CProduct(id);
        toast.success('Duyệt tin thành công!');
        loadPendingProducts(); // Tải lại danh sách (item đó sẽ biến mất)
      }
    });
  };

  // Luồng "Không duyệt" (Reject) - "Key" của sếp
  const handleReject = (id: string) => {
    Swal.fire({
      title: 'Từ chối tin đăng?',
      text: 'Vui lòng nhập lý do từ chối (bắt buộc):',
      icon: 'warning',
      input: 'textarea', // "Tuyệt kỹ" của Swal
      inputPlaceholder: 'Ví dụ: Tin đăng có chứa SĐT cá nhân, hình ảnh mờ...',
      inputAttributes: {
        'aria-label': 'Type your reason here'
      },
      showCancelButton: true,
      confirmButtonColor: '#dc3545', // Màu đỏ
      confirmButtonText: 'Từ chối & Gửi lý do',
      cancelButtonText: 'Huỷ bỏ',
      
      // Validate "tỉ mỉ": Bắt buộc phải nhập lý do
      inputValidator: (value) => {
        if (!value) {
          return 'Bạn phải nhập lý do từ chối!';
        }
        return null; // Hợp lệ
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        // 'result.value' chính là lý do admin nhập vào
        const reason = result.value as string; 
        await mockRejectC2CProduct(id, reason);
        toast.error('Đã từ chối tin đăng!');
        loadPendingProducts(); // Tải lại danh sách
      }
    });
  };

  // Render "tỉ mỉ"
  const renderContent = () => {
    if (isLoading) return <div className="admin-c2c-loading">Đang tải hàng chờ...</div>;
    
    if (pendingList.length === 0) {
      return (
        <div className="admin-c2c-empty">
          <h3>🎉 "Sạch" hàng chờ!</h3>
          <p>Không có tin đăng nào đang chờ duyệt.</p>
        </div>
      );
    }

    return (
      <div className="admin-c2c-list">
        {pendingList.map((product) => (
          <div key={product.id} className="admin-c2c-item shadow-sm">
            {/* Ảnh */}
            <img 
              src={product.images[0] || 'https://via.placeholder.com/150'} 
              alt={product.name} 
              className="item-image"
            />
            {/* Thông tin chính */}
            <div className="item-info">
              <h4 className="item-name">{product.name}</h4>
              <span className="item-price">{formatCurrency(product.price)}</span>
              <span className="item-seller">Người đăng: {product.sellerId}</span>
              <p className="item-location">Khu vực: {product.location}</p>
            </div>
            {/* Mô tả (Quan trọng) */}
            <div className="item-description">
              <strong>Mô tả (Cần kiểm duyệt):</strong>
              <p>{product.description}</p>
            </div>
            {/* Nút hành động */}
            <div className="item-actions">
              <Button
                variant="contained"
                color="success"
                startIcon={<FaCheck />}
                onClick={() => handleApprove(product.id)}
              >
                Duyệt
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<FaTimes />}
                onClick={() => handleReject(product.id)}
              >
                Không duyệt
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <section className="admin-c2c-management-page">
      <div className="admin-c2c-header">
        <h1>Kiểm duyệt tin đăng C2C</h1>
        <p>Hiện có <strong>{pendingList.length}</strong> tin đang chờ duyệt.</p>
      </div>
      {renderContent()}
    </section>
  );
};

export default AdminC2CManagementPage;