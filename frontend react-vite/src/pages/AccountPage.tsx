import React, { useEffect, useState } from 'react';
import '../assets/css/account.css'; // Import CSS styles for the component
import api from '../api/api';
import { User } from '../types/user';
import { Order } from '../types/order';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from 'sweetalert2';
import Button from '@mui/material/Button';
import VoucherList from '../components/VoucherList';

const AccountPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    address: ''
  });
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
      fetchUser(); // Refresh user data
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(`Có lỗi xảy ra khi cập nhật thông tin!`, {
        position: "top-right",
        autoClose: 2000,
      });
    }
  };

  const handlePayOrder = async (orderId: string) => {
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

  const handleReceiveOrder = async (orderId: string) => {
  try {
    // Cập nhật trạng thái đơn hàng thành DELIVERED
    await api.put(`/order/update-status?id=${orderId}&status=DELIVERED`);

    // Nếu backend không tự chuyển sang COMPLETED, bạn có thể bổ sung gọi API trạng thái này
    // Ví dụ:
    await api.put(`/order/update-status?id=${orderId}&status=COMPLETED`);

    // Cập nhật lại danh sách đơn
    await fetchOrders();

    // Hiển thị thông báo thành công
    Swal.fire({
      icon: 'success',
      title: 'Xác nhận nhận hàng',
      text: 'Bạn đã nhận hàng thành công và đơn hàng đã được hoàn tất!',
      confirmButtonText: 'OK',
    });
  } catch (error) {
    console.error('Error receiving order:', error);
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
        </div>

        {/* Tab Content */}
        <ToastContainer />
        <div className="tab-content shadow rounded">
          {/* Thông tin cá nhân */}
          <div className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`}>
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

          {/* Lịch sử giao dịch */}
          <div className={`order-history ${activeTab === 'orders' ? 'active' : ''}`}>
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
                      <Button variant="contained" color="success" style={{marginRight: '8px'}} onClick={() => handlePayOrder(order.orderId)}>Thanh toán</Button>
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

          {/* Danh sách mã khuyến mãi */}
          <div className={`voucher-list ${activeTab === 'vouchers' ? 'active' : ''}`}>
            <h3 className="mb-3">Danh sách mã khuyến mãi</h3>
            <VoucherList showAllVouchers={true} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AccountPage;
