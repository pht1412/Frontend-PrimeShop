import React, { useEffect, useState } from 'react';
import '../assets/css/account.css'; // Import CSS styles for the component
import api from '../api/api';
import * as walletApi from '../api/wallet.api';
import { IPaymentRequest } from '../api/wallet.api';
import axios from 'axios';
import { User } from '../types/user'; 
import { Order } from '../types/order';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from 'sweetalert2';
import Button from '@mui/material/Button';
import VoucherList from '../components/VoucherList';
import WalletTab from '../components/WalletTab';
import C2CTab from '../components/C2CTab'; // Giả định component này sẽ được tạo ở 'src/components/C2CTab.tsx'


const AccountPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    address: ''
  });
  const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === undefined || amount === null) return '0 ₫';
  return amount.toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND'
  });
};
  const showOrderDetails = (orders) => {
    Swal.fire({
      title: 'Chi tiết đơn hàng',
      html: `
        <div>
          <p><strong>Mã đơn:</strong> #${orders.orderId}</p>
          <p><strong>Sản phẩm:</strong> ${orders.orderItems.map(item => `${item.productName} - Số lượng: ${item.quantity}`).join(', ')}</p>
          <p><strong>Người nhận:</strong> ${orders.fullName}</p>
          <p><strong>Số điện thoại:</strong> ${orders.phoneNumber}</p>
          <p><strong>Địa chỉ:</strong> ${orders.address}</p>
          <p><strong>Ghi chú:</strong> ${orders.note}</p>          
          <p><strong>Ngày đặt hàng:</strong> ${orders.createdAt.split('T')[0]}</p>
          <p><strong>Tổng tiền:</strong> ${orders.totalAmount.toLocaleString('vi-VN', {
            style: 'currency',
            currency: 'VND'
          })}</p>          
        </div>
      `,
      confirmButtonText: 'Đóng'
    });
  }

  const fetchUser = async () => {
    const response = await api.get('/auth/me');
    setUser(response.data);
    setFormData({
      fullName: response.data.fullName || '',
      phoneNumber: response.data.phoneNumber || '',
      address: response.data.address || ''
    });
  };

  const fetchOrders = async () => {
    const response = await api.get('/order/get');
    setOrders(response.data);
  };


  useEffect(() => {
    fetchUser();
    fetchOrders();
  }, []);
  // BỔ SUNG: useEffect để fetch data C2C (hoàn toàn mới)


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id === 'name' ? 'fullName' : id === 'phone' ? 'phoneNumber' : id]: value
    }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.patch('/auth/update', {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        address: formData.address
      });
      Swal.fire({
        title: 'Thành công',
        text: 'Cập nhật thông tin thành công!',
        icon: 'success',
        confirmButtonText: 'OK'
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.reload();
        }
      });
      fetchUser(); 
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(`Có lỗi xảy ra khi cập nhật thông tin!`, {
        position: "top-right",
        autoClose: 2000,
      });
    }
  };

  const handlePayWithVNPay = async (orderId: string) => {
    try {
      const response = await api.post("/payment/create", {
        orderId: orderId,
        amount: orders.find(order => order.orderId === orderId)?.totalAmount
      });
      window.location.href = response.data;
      
    } catch (error) {
      console.error('Error paying order:', error);
      toast.error('Có lỗi xảy ra khi thanh toán đơn hàng!');
    }
  };
  const handlePayWithWallet = async (orderId: string, amount: number) => {
    if (!user) {
      toast.error("Không thể xác định người dùng. Vui lòng tải lại trang.");
      return;
    }

    try {
      // Hiển thị loading trong khi gọi API
      Swal.fire({
        title: 'Đang thanh toán...',
        text: 'Vui lòng chờ trong khi Ví Prime xử lý.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Dữ liệu body cho API /pay
      const paymentData: IPaymentRequest = {
        orderId: Number(orderId), // Đảm bảo orderId là number
        amount: amount
      };
      
      // Gọi API ví mà chúng ta đã xây dựng
      await walletApi.payOrder(Number(user.id), paymentData);

      Swal.close(); // Đóng loading
      await Swal.fire(
        'Thành công!',
        'Đơn hàng đã được thanh toán bằng PrimeWallet.',
        'success'
      );

      // Quan trọng: Tải lại danh sách đơn hàng để cập nhật trạng thái
      fetchOrders();
      // (Không cần tải lại số dư, vì WalletTab sẽ tự làm khi người dùng click vào)

    } catch (error: any) {
      console.error('Error paying with PrimeWallet:', error);
      // Hiển thị lỗi từ back-end (ví dụ: "Không đủ số dư")
      const errorMessage = error?.response?.data || error.message || 'Ví không đủ số dư hoặc đã xảy ra lỗi.';
      Swal.fire(
        'Thanh toán thất bại',
        String(errorMessage),
        'error'
      );
    }
  };


  // Hàm MỚI để hiển thị Modal lựa chọn
  const showPaymentModal = (order: Order) => {
    const orderId = order.orderId;
    const totalAmount = order.totalAmount;

    const formattedTotalAmount = formatCurrency(totalAmount);

    Swal.fire({
      title: 'Chọn phương thức thanh toán',
      html: `
        <div class="payment-modal-info">
          <p>Đơn hàng: <strong>#${orderId}</strong></p>

          <p>Tổng tiền: <strong>${formattedTotalAmount}</strong></p> 
        </div>
        
        <div class="payment-methods-container">
          <button id="pay-wallet" class="swal2-confirm swal2-styled btn-payment-wallet">
            Thanh toán bằng Ví Prime
          </button>
          
          <button id="pay-vnpay" class="swal2-confirm swal2-styled btn-payment-vnpay">
            Thanh toán qua VNPay
          </button>
          
          <button id="pay-momo" class="swal2-confirm swal2-styled btn-payment-momo" disabled>
            Thanh toán qua Momo (Sắp ra mắt)
          </button>
        </div>
      `,
      showConfirmButton: false, // Ẩn nút "OK" mặc định
      showCancelButton: true,
      cancelButtonText: 'Huỷ bỏ',
      
      didOpen: () => {
        const modal = Swal.getHtmlContainer();
        
        modal?.querySelector('#pay-wallet')?.addEventListener('click', () => {
          handlePayWithWallet(orderId, totalAmount);
        });

        modal?.querySelector('#pay-vnpay')?.addEventListener('click', () => {
          handlePayWithVNPay(orderId, totalAmount);
        });
      }
    });
  };

const handleReceiveOrder = async (orderId: string) => {
  try {
    // 1. Gọi API để cập nhật trạng thái thành DONE
    await api.put(`/order/update-status?id=${orderId}&status=DONE`);

    // 2. Tải lại danh sách đơn hàng
    // Đơn hàng này bây giờ là DONE, không còn là DELIVERED
    await fetchOrders(); 
    // Khi React render lại, điều kiện {order.status === 'DELIVERED'} sẽ là FALSE
    // => Nút "Đã nhận hàng" sẽ tự động biến mất.

    // 3. Thông báo thành công
    Swal.fire({
      icon: 'success',
      title: 'Đã nhận hàng!',
      text: 'Đơn hàng đã được hoàn tất. Cảm ơn bạn đã mua sắm!',
      confirmButtonText: 'OK',
    });

  } catch (error) {
    console.error('Error receiving order (setting to DONE):', error);
    toast.error('Có lỗi xảy ra khi xác nhận nhận hàng!');
  }
};


  return (
    <section className="account-page">
      <div className="account-container">
        {/* Profile Section */}
        <div className="profile-section shadow rounded">
          <img src={user?.avatar || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"} alt="Avatar" className="profile-avatar" />
          <div className="profile-info">
            <h2>{user?.username}</h2>
            <p>Email: {user?.email}</p>
            <p>Số điện thoại: {user?.phoneNumber}</p>
            <p>Địa chỉ: {user?.address}</p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="account-tabs">
          <button
            className={`tab-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
            role="tab"
            aria-selected={activeTab === 'profile'}
          >
            Thông tin cá nhân
          </button>
          <button
            className={`tab-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Đơn hàng
          </button>
          <button
            className={`tab-item ${activeTab === 'vouchers' ? 'active' : ''}`}
            onClick={() => setActiveTab('vouchers')}
          >
            Mã khuyến mãi
          </button>
          <button
              className={`tab-item ${activeTab === 'wallet' ? 'active' : ''}`} // <-- Sửa dòng này
              onClick={() => setActiveTab('wallet')} // <-- Sửa dòng này
              role="tab"
              aria-selected={activeTab === 'wallet'}
          >
              Ví tiền
          </button>
          <button
              className={`tab-item ${activeTab === 'c2c' ? 'active' : ''}`} // <-- Sửa dòng này
              onClick={() => setActiveTab('c2c')} // <-- Sửa dòng này
              role="tab"
              aria-selected={activeTab === 'c2c'}
          >
              Giao dịch C2C
          </button>
        </div>

        {/* Tab Content */}
        <ToastContainer />
        <div className="tab-content shadow rounded">
          {/* Thông tin cá nhân */}
        {activeTab === 'profile' && (
        <div className="profile-tab active">
          <h3 className="mb-3">Thông tin cá nhân</h3>
            <form className="profile-form" onSubmit={handleUpdateProfile}>              
              <div className="form-group">
                <label htmlFor="username">Tên tài khoản</label>
                <input
                  type="text"
                  id="username"
                  value={user?.username || ''}
                  readOnly
                  disabled
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={user?.email || ''}
                  readOnly
                  disabled
                />
              </div>
              <div className="form-group">
                <label htmlFor="name">Họ và tên</label>
                <input
                  type="text"
                  id="name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Số điện thoại</label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="address">Địa chỉ</label>
                <textarea
                  id="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  style={{ resize: 'none' }}
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary">
                Cập nhật
              </button>
            </form>
          </div>
        )}

          {/* Lịch sử giao dịch */}
            {activeTab === 'orders' && (
            <div className="order-history active">            
            <h3 className="mb-3">Danh sách đơn hàng</h3>
            {orders?.length > 0 ? (
              <div className="order-list">
                {orders.map((order) => (
                  <div key={order.orderId} className="order-item">
                    <div className="order-details">
                      <h4>Mã đơn: #{order.orderId}</h4>
                      <p>Ngày đặt hàng: {order.createdAt.split('T')[0]}</p>
                      <p>
                        Tổng:{' '}
                        {order.totalAmount.toLocaleString('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        })}
                      </p>
                    </div>
                    <span className={`order-status ${order.orderStatus}`}>
                      {(() => {
                        switch (order.orderStatus) {
                          case 'PENDING':
                            return 'Chờ xác nhận';
                          case 'CONFIRMED':
                            return 'Đã xác nhận';
                          case 'PAID':
                            return 'Đã thanh toán';
                          case 'PAYMENT_FAILED':
                            return 'Thanh toán thất bại';
                          case 'SHIPPED':
                            return 'Đang giao hàng';
                          case 'DELIVERED':
                            return 'Đã giao hàng';
                          case 'PROCESSING':
                            return 'Đang xử lý';
                          case 'CANCELLED':
                            return 'Đã hủy';
                          default:
                            return 'Không xác định';
                        }
                      })()}
                    </span>
                    {order.orderStatus === 'CONFIRMED' && (
                      <Button variant="contained" color="success" style={{marginRight: '8px'}} onClick={() => showPaymentModal(order)}>Thanh toán</Button>
                    )}
                    <Button variant="contained" color="primary" onClick={() => showOrderDetails(order)}>Xem chi tiết</Button>
                    {order.orderStatus === 'DELIVERED' && (
                      <Button variant="contained" color="success" style={{marginRight: '8px'}} onClick={() => handleReceiveOrder(order.orderId)}>Đã nhận hàng</Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-orders">Bạn chưa có giao dịch nào.</p>
            )}
          </div>
          )}

          {/* Danh sách mã khuyến mãi */}
          {activeTab === 'vouchers' && (
            <div className="voucher-list active">            
            <h3 className="mb-3">Danh sách mã khuyến mãi</h3>
            <VoucherList showAllVouchers={true} />
          </div>
          )}

          {/* Ví tiền */}
          {activeTab === 'wallet' && (
            <div className="wallet-tab active">                
            <WalletTab user={user} />
            </div>
          )}

{/* C2C */}
  {activeTab === 'c2c' && (
    <div className="c2c-tab active">
      <C2CTab user={user} />
    </div>
  )}

        </div>
      </div>
    </section>
  );
};

export default AccountPage;
