import React, { useEffect, useState } from 'react';
import '../assets/css/account.css';
import api from '../api/api';
import * as walletApi from '../api/wallet.api';
import { IPaymentRequest } from '../api/wallet.api';
import { User } from '../types/user'; 
import { Order } from '../types/order';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from 'sweetalert2';
import Button from '@mui/material/Button';
import VoucherList from '../components/VoucherList';
import WalletTab from '../components/WalletTab';
import C2CTab from '../components/C2CTab'; 

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

  const showOrderDetails = (order: any) => {
    const displayTotal = order.finalAmount !== undefined && order.finalAmount !== null 
                         ? order.finalAmount 
                         : order.totalAmount;

    Swal.fire({
      title: 'Chi tiết đơn hàng',
      html: `
        <div style="text-align: left;">
          <p><strong>Mã đơn:</strong> #${order.orderId}</p>
          <p><strong>Ngày đặt hàng:</strong> ${new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
          <hr/>
          <p><strong>Sản phẩm:</strong></p>
          <ul style="padding-left: 20px;">
            ${order.orderItems.map((item: any) => `<li>${item.productName} x ${item.quantity}</li>`).join('')}
          </ul>
          <hr/>
          <p><strong>Người nhận:</strong> ${order.fullName}</p>
          <p><strong>SĐT:</strong> ${order.phoneNumber}</p>
          <p><strong>Địa chỉ:</strong> ${order.address}</p>
          <p><strong>Ghi chú:</strong> ${order.note || 'Không'}</p>
          <hr/>
          <div style="display: flex; justify-content: space-between; font-size: 1.1em; color: #d32f2f; font-weight: bold;">
             <span>TỔNG THANH TOÁN:</span>
             <span>${displayTotal.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>
          </div>
        </div>
      `,
      confirmButtonText: 'Đóng'
    });
  }

  // --- HÀM THANH TOÁN FUNDIIN ---
  const handleFundiinPayment = async (orderId: string, amount: number) => {
    try {
      Swal.fire({ title: 'Đang kết nối Fundiin...', didOpen: () => Swal.showLoading() });
      const res = await api.post("/bnpl/init", { orderId: Number(orderId) });
      Swal.close();
      if (res.data && res.data.consentUrl) {
          window.location.href = res.data.consentUrl;
      } else {
          toast.error("Lỗi: Không nhận được link thanh toán Fundiin.");
      }
    } catch (error: any) {
        Swal.close();
        toast.error(error.response?.data?.message || "Lỗi giao dịch Fundiin.");
    }
  };

  // --- [NEW] HÀM THANH TOÁN TRẢ GÓP VNPAY ---
  const handleVnPayInstallment = async (orderId: string, amount: number) => {
    try {
        // Kiểm tra điều kiện trả góp (thường > 3 triệu mới được trả góp)
        if (amount < 3000000) {
            toast.warning("Đơn hàng phải từ 3.000.000đ trở lên mới được hỗ trợ trả góp!");
            return;
        }

        // 2. Hiển thị Popup cho khách chọn kỳ hạn (3, 6, 9, 12 tháng)
        const { value: selectedMonth } = await Swal.fire({
            title: 'Chọn kỳ hạn trả góp',
            text: 'Vui lòng chọn số tháng bạn muốn trả góp (Lãi suất 0%)',
            input: 'select',
            inputOptions: {
                '3': '3 Tháng',
                '6': '6 Tháng',
                '9': '9 Tháng',
                '12': '12 Tháng'
            },
            inputPlaceholder: 'Chọn kỳ hạn...',
            showCancelButton: true,
            confirmButtonText: 'Tiếp tục thanh toán',
            cancelButtonText: 'Hủy bỏ',
            inputValidator: (value) => {
                if (!value) {
                    return 'Bạn cần chọn một kỳ hạn!';
                }
            }
        });

        // Nếu khách bấm Hủy hoặc không chọn gì thì dừng
        if (!selectedMonth) return;

        // 3. Tiến hành gọi API
        Swal.fire({
            title: 'Đang kết nối VNPAY...',
            text: `Khởi tạo trả góp kỳ hạn ${selectedMonth} tháng`,
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        // Gọi Endpoint Controller: /api/payment/vnpay/installment/create
        // Payload chuẩn theo DTO: orderId và installmentMonths
        const response = await api.post("/payment/vnpay/installment/create", { 
            orderId: Number(orderId),
            installmentMonths: Number(selectedMonth) // <--- Đã có "chìa khóa" để mở khóa lỗi Validation
        });

        Swal.close();

        // 4. Chuyển hướng
        if (response.data && response.data.paymentUrl) {
            console.log("🚀 Redirecting to VNPAY Installment:", response.data.paymentUrl);
            // Chuyển hướng sang cổng thanh toán
            window.location.href = response.data.paymentUrl;
        } else {
            console.error("Response invalid:", response.data);
            toast.error("Không nhận được đường dẫn trả góp từ VNPAY.");
        }

    } catch (error: any) {
        Swal.close();
        console.error("VNPAY Installment Error:", error);
        // Hiển thị thông báo lỗi chi tiết từ Backend nếu có
        const errorMsg = error.response?.data?.message || "Lỗi khởi tạo trả góp VNPAY.";
        toast.error(errorMsg);
    }
  };
  // ---------------------------------------------

  const showPaymentMethod = (order: any) => {
    const amountToPay = order.finalAmount ?? order.totalAmount;

    Swal.fire({
      title: 'Chọn phương thức thanh toán',
      html: `
        <div style="text-align: center; margin-bottom: 10px;">
            Số tiền: <strong style="color: #d32f2f; font-size: 1.2em;">${formatCurrency(amountToPay)}</strong>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
          
          <button id="pay-vnpay" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; border: 1px solid #e0e0e0; background: #fff; border-radius: 8px; cursor: pointer; transition: all 0.2s;">
            <img src="https://images.seeklogo.com/logo-png/42/1/vnpay-logo-png_seeklogo-428006.png" alt="VNPAY" style="height: 24px;" />
            <span style="font-weight: 500;">Thanh toán VNPAY (ATM/QR)</span>
          </button>

          <button id="pay-vnpay-installment" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; border: 1px solid #ed1c24; background: #fff5f5; border-radius: 8px; cursor: pointer; transition: all 0.2s;">
            <img src="https://images.seeklogo.com/logo-png/42/1/vnpay-logo-png_seeklogo-428006.png" alt="VNPAY Installment" style="height: 24px;" />
            <span style="font-weight: 600; color: #ed1c24;">Trả góp qua VNPAY (0%)</span>
          </button>

          <button id="pay-paypal" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; border: 1px solid #e0e0e0; background: #fff; border-radius: 8px; cursor: pointer; transition: all 0.2s;">
            <img src="https://www.paypalobjects.com/webstatic/icon/pp258.png" alt="PayPal" style="height: 24px;" />
            <span style="font-weight: 500;">PayPal</span>
          </button>

          <button id="pay-momo" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; border: 1px solid #e0e0e0; background: #fff; border-radius: 8px; cursor: pointer; transition: all 0.2s;">
            <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" alt="MoMo" style="height: 24px;" />
            <span style="font-weight: 500;">MoMo</span>
          </button>

          <button id="pay-fundiin" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; border: 1px solid #005fcc; background: #eef7ff; border-radius: 8px; cursor: pointer; transition: all 0.2s;">
            <img src="https://fundiin.vn/wp-content/uploads/2021/05/logo-fundiin-cropped.png" alt="Fundiin" style="height: 20px;" />
            <span style="font-weight: 600; color: #005fcc;">Mua trước trả sau (Fundiin)</span>
          </button>

          <button id="pay-wallet" class="swal2-confirm swal2-styled" style="width: 100%; margin: 0; background: #4caf50;">
              Thanh toán bằng Ví Prime
          </button>
        </div>
      `,
      showConfirmButton: false,
      showCloseButton: true,
      didOpen: () => {
        const orderId = order.orderId;
        
        document.getElementById('pay-vnpay')?.addEventListener('click', () => {
          handleVnPayPayOrder(orderId, amountToPay);
          Swal.close();
        });

        // --- BẮT SỰ KIỆN NÚT VNPAY TRẢ GÓP ---
        document.getElementById('pay-vnpay-installment')?.addEventListener('click', () => {
          handleVnPayInstallment(orderId, amountToPay);
        });

        document.getElementById('pay-paypal')?.addEventListener('click', () => {
          handlePaypalPayOrder(orderId, amountToPay);
          Swal.close();
        });
        document.getElementById('pay-momo')?.addEventListener('click', () => {
          handleMoMoPayOrder(orderId, amountToPay);
          Swal.close();
        });
        document.getElementById('pay-fundiin')?.addEventListener('click', () => {
          handleFundiinPayment(orderId, amountToPay);
          Swal.close();
        });
        document.getElementById('pay-wallet')?.addEventListener('click', () => {
          handlePayWithWallet(orderId, amountToPay);
          Swal.close();
        });
      }
    });
  };

  const fetchUser = async () => { try { const response = await api.get('/auth/me'); setUser(response.data); setFormData({ fullName: response.data.fullName || '', phoneNumber: response.data.phoneNumber || '', address: response.data.address || '' }); } catch (e) { console.error(e) } };
  const fetchOrders = async () => { try { const response = await api.get('/order/get'); setOrders(response.data); } catch (e) { console.error(e) } };

  useEffect(() => { fetchUser(); fetchOrders(); }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { const { id, value } = e.target; setFormData(prev => ({ ...prev, [id === 'name' ? 'fullName' : id === 'phone' ? 'phoneNumber' : id]: value })); };
  const handleUpdateProfile = async (e: React.FormEvent) => { e.preventDefault(); try { await api.patch('/auth/update', { fullName: formData.fullName, phoneNumber: formData.phoneNumber, address: formData.address }); Swal.fire('Thành công', 'Cập nhật thông tin thành công!', 'success').then(() => window.location.reload()); } catch (error) { toast.error(`Có lỗi xảy ra khi cập nhật thông tin!`); } };
  
  const handlePayWithWallet = async (orderId: string, amount: number) => { if (!user) return toast.error("Vui lòng đăng nhập lại."); try { Swal.fire({ title: 'Đang thanh toán...', didOpen: () => Swal.showLoading() }); const paymentData: IPaymentRequest = { orderId: Number(orderId), amount: amount }; await walletApi.payOrder(Number(user.id), paymentData); Swal.close(); await Swal.fire('Thành công!', 'Thanh toán thành công.', 'success'); fetchOrders(); } catch (error: any) { const msg = error?.response?.data || 'Ví không đủ số dư hoặc lỗi hệ thống.'; Swal.fire('Thất bại', String(msg), 'error'); } };
  
  const handleVnPayPayOrder = async (orderId: string, amount: number) => { try { const response = await api.post("/payment/vnpay/create", { orderId: orderId, amount: amount }); window.location.href = response.data.paymentUrl; } catch (error) { toast.error('Lỗi khởi tạo thanh toán VNPay'); } };
  const handlePaypalPayOrder = async (orderId: any, amount: number) => { try { const res = await api.post("/payment/paypal/create", { orderId, amount }); window.location.href = res.data.links[0]; } catch (error) { toast.error("Lỗi thanh toán PayPal"); } };
  const handleMoMoPayOrder = async (orderId: any, amount: number) => { try { const res = await api.post("/payment/momo/create", { orderId, amount }); window.location.href = res.data.payUrl; } catch (error) { toast.error("Lỗi thanh toán MoMo"); } }
  const handleReceiveOrder = async (orderId: string) => { try { await api.put(`/order/update-status?id=${orderId}&status=DELIVERED`); fetchOrders(); toast.success("Đã xác nhận nhận hàng!"); } catch (error) { toast.error('Lỗi cập nhật trạng thái'); } };

  return (
    <section className="account-page">
      <ToastContainer position="top-right" autoClose={2000} />
      <div className="account-container">
        
        {/* Profile Header */}
        <div className="profile-section shadow rounded">
          <img src={user?.avatar || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"} alt="Avatar" className="profile-avatar" />
          <div className="profile-info">
            <h2>{user?.username}</h2>
            <p>Email: {user?.email}</p>
            <p>SĐT: {user?.phoneNumber}</p>
            <p>Đ/C: {user?.address}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="account-tabs">
          <button className={`tab-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Thông tin</button>
          <button className={`tab-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>Đơn hàng</button>
          <button className={`tab-item ${activeTab === 'vouchers' ? 'active' : ''}`} onClick={() => setActiveTab('vouchers')}>Voucher</button>
          <button className={`tab-item ${activeTab === 'wallet' ? 'active' : ''}`} onClick={() => setActiveTab('wallet')}>Ví tiền</button>
          <button className={`tab-item ${activeTab === 'c2c' ? 'active' : ''}`} onClick={() => setActiveTab('c2c')}>C2C</button>
        </div>

        <div className="tab-content shadow rounded">
          {activeTab === 'profile' && (
            <div className="profile-tab active">
              <h3 className="mb-3">Cập nhật thông tin</h3>
              <form className="profile-form" onSubmit={handleUpdateProfile}>              
                <div className="form-group">
                  <label>Tên hiển thị</label>
                  <input type="text" id="name" value={formData.fullName} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input type="tel" id="phone" value={formData.phoneNumber} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Địa chỉ</label>
                  <textarea id="address" value={formData.address} onChange={handleInputChange} required style={{ resize: 'none' }}></textarea>
                </div>
                <button type="submit" className="btn btn-primary">Lưu thay đổi</button>
              </form>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="order-history active">            
              <h3 className="mb-3">Lịch sử đơn hàng</h3>
              {orders?.length > 0 ? (
                <div className="order-list">
                  {orders.map((order) => {
                    const displayPrice = order.finalAmount ?? order.totalAmount;
                    return (
                        <div key={order.orderId} className="order-item">
                        <div className="order-details">
                            <h4>Đơn hàng #{order.orderId}</h4>
                            <p className="text-muted" style={{fontSize: '0.9em'}}>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                            <p style={{marginTop: '5px'}}>
                                Tổng thanh toán: <strong style={{color: '#d32f2f', fontSize: '1.1em'}}>
                                    {displayPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                </strong>
                            </p>
                        </div>
                        <span className={`order-status ${order.orderStatus}`}>
                            {order.orderStatus === 'PENDING' ? 'Chờ xác nhận' : 
                             order.orderStatus === 'CONFIRMED' ? 'Đã xác nhận' :
                             order.orderStatus === 'PAID' ? 'Đã thanh toán' :
                             order.orderStatus === 'SHIPPED' ? 'Đang giao' :
                             order.orderStatus === 'DELIVERED' ? 'Hoàn thành' :
                             order.orderStatus === 'CANCELLED' ? 'Đã hủy' : order.orderStatus}
                        </span>
                        <div className="order-actions">
                            {order.orderStatus === 'CONFIRMED' && (
                                <Button variant="contained" color="success" size="small" style={{marginRight: '8px'}} onClick={() => showPaymentMethod(order)}>
                                    Thanh toán
                                </Button>
                            )}
                            <Button variant="outlined" size="small" onClick={() => showOrderDetails(order)}>
                                Chi tiết
                            </Button>
                            {order.orderStatus === 'DELIVERED' && (
                                <Button variant="contained" color="primary" size="small" style={{marginLeft: '8px'}} onClick={() => handleReceiveOrder(order.orderId)}>
                                    Đã nhận
                                </Button>
                            )}
                        </div>
                        </div>
                    );
                  })}
                </div>
              ) : (
                <p className="no-orders">Bạn chưa có đơn hàng nào.</p>
              )}
            </div>
          )}

          {activeTab === 'vouchers' && <div className="voucher-list active"><h3 className="mb-3">Kho Voucher</h3><VoucherList showAllVouchers={true} /></div>}
          {activeTab === 'wallet' && <div className="wallet-tab active"><WalletTab user={user} /></div>}
          {activeTab === 'c2c' && <div className="c2c-tab active"><C2CTab user={user} /></div>}
        </div>
      </div>
    </section>
  );
};

export default AccountPage;