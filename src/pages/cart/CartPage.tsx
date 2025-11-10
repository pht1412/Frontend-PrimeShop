import React, { useEffect, useState } from 'react';
import '../../assets/css/cart.css';
import api from '../../api/api';
import { Cart } from '../../types/cart';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import Button from '@mui/material/Button';
import VoucherComboBox from '../../components/VoucherComboBox';

interface Voucher {
  id: number;
  code: string;
  discountType: 'PERCENT' | 'FIXED' | 'FREESHIP';
  discountValue: number;
  minOrderValue: number;
  startDate: string;
  endDate: string;
  maxUsage: number;
  currentUsage: number;
  isActive: boolean;
  isValid: boolean;
  remainingUsage: number;
}

interface VoucherInfo {
  code: string;
  discountType: 'PERCENT' | 'FIXED' | 'FREESHIP';
  discountValue: number;
  minOrderValue: number;
  isValid: boolean;
  message?: string;
}

const CartPage = () => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedVouchers, setSelectedVouchers] = useState<Voucher[]>([]);
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [freeShippingReason, setFreeShippingReason] = useState<string>('');
  const [voucherInfoList, setVoucherInfoList] = useState<VoucherInfo[]>([]);
  const [totalDiscount, setTotalDiscount] = useState(0);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await api.get("/cart");
      setCart(res.data);
      setShippingFee(res.data.shippingFee || 0);
      setTotalDiscount(res.data.discount || 0);
      setVoucherInfoList(res.data.appliedVouchers || []);
      setFreeShippingReason(res.data.freeShippingReason || "");
      if (res.data.vouchers) setSelectedVouchers(res.data.vouchers);
    } catch (err) {
      console.error("Lỗi khi tải giỏ hàng:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (productSlug: string, delta: number) => {
    try {
      await api.post("/cart/add", { productSlug, quantity: delta });
      await fetchCart();
    } catch (err) {
      console.error("Không thể cập nhật số lượng:", err);
    }
  };

  const handleRemoveItem = async (productSlug: string) => {
    try {
      await api.post("/cart/remove", { productSlug });
      await fetchCart();
    } catch (err) {
      console.error("Không thể xóa sản phẩm:", err);
    }
  };

  const recalculateCartWithVouchers = async (vouchers: Voucher[]) => {
    try {
      setLoading(true);
      const res = await api.post("/cart/apply-multi-voucher", {
        cartId: cart?.id,
        voucherCodes: vouchers.map(v => v.code)
      });
      setCart(res.data);
      setSelectedVouchers(res.data.vouchers || vouchers);
      setShippingFee(res.data.shippingFee || 0);
      setTotalDiscount(res.data.discount || 0);
      setVoucherInfoList(res.data.appliedVouchers || []);
      setFreeShippingReason(res.data.freeShippingReason || "");
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Có lỗi khi áp dụng voucher. Vui lòng thử lại!',
        confirmButtonColor: '#2563eb',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVoucherApplied = async (voucher: Voucher) => {
    if (selectedVouchers.find(v => v.code === voucher.code)) return;
    const newList = [...selectedVouchers, voucher];
    await recalculateCartWithVouchers(newList);
  };

  const handleVoucherRemoved = async (voucher: Voucher) => {
    const newList = selectedVouchers.filter(v => v.code !== voucher.code);
    await recalculateCartWithVouchers(newList);
  };

  if (!cart || !Array.isArray(cart.items)) return (
    <div className="cart-page">
      <p className="text-center my-5 text-lg text-gray-600">Đang tải giỏ hàng...</p>
    </div>
  );

  const subtotal = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const finalTotal = subtotal - totalDiscount + shippingFee;

  return (
    <div className="cart-page">
      <h1>Giỏ hàng</h1>
      {cart.items.length === 0 ? (
        <div className="cart-empty">
          <span className="block mb-4 text-xl text-gray-600">Giỏ hàng trống 😢</span>
          <Link to="/all-products" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
            Quay lại mua sắm
          </Link>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            {cart.items.map((item) => (
              <div key={item.productSlug} className="cart-item">
                <img
                  src={item.imageUrl}
                  alt={item.productName}
                  className="cart-item-image"
                />
                <div className="cart-item-details">
                  <h3 className="cart-item-name">{item.productName}</h3>
                  <p className="cart-item-price">
                    Đơn giá: {item.price.toLocaleString("vi-VN")} VND
                  </p>
                  <div className="cart-item-quantity">
                    <button
                      onClick={() => updateQuantity(item.productSlug, -(item.quantity - 1))}
                      className="quantity-btn"
                      disabled={item.quantity <= 1}
                    >
                      Hủy
                    </button>
                    <button
                      onClick={() => updateQuantity(item.productSlug, -1)}
                      className="quantity-btn"
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productSlug, 1)}
                      className="quantity-btn"
                    >
                      +
                    </button>
                    <button
                      onClick={() => updateQuantity(item.productSlug, 10)}
                      className="quantity-btn"
                    >
                      +10
                    </button>
                    <button
                      onClick={() => updateQuantity(item.productSlug, 100)}
                      className="quantity-btn"
                    >
                      +100
                    </button>
                    <Button
                      variant="contained"
                      color="error"
                      sx={{ ml: 4 }}
                      onClick={() => {
                        Swal.fire({
                          title: 'Xác nhận xóa?',
                          text: `Bạn có chắc chắn muốn xóa ${item.productName} khỏi giỏ hàng?`,
                          icon: 'warning',
                          showCancelButton: true,
                          confirmButtonText: 'Xóa',
                          cancelButtonText: 'Hủy',
                          confirmButtonColor: '#dc2626',
                          cancelButtonColor: '#3b82f6',
                          reverseButtons: true
                        }).then((result) => {
                          if (result.isConfirmed) {
                            handleRemoveItem(item.productSlug);
                          }
                        });
                      }}
                    >
                      Xóa khỏi giỏ hàng
                    </Button>
                  </div>
                  <p className="cart-item-subtotal">
                    Tổng: {(item.price * item.quantity).toLocaleString("vi-VN")} VND
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <div className="voucher-section">
              <VoucherComboBox
                orderValue={subtotal}
                onVoucherApplied={handleVoucherApplied}
                onVoucherRemoved={handleVoucherRemoved}
                appliedVouchers={selectedVouchers}
              />
            </div>
            <div className="order-summary">
              <div>Tổng tiền hàng: {subtotal.toLocaleString("vi-VN")} VNĐ</div>
              {totalDiscount > 0 && <div>Giảm giá: -{totalDiscount.toLocaleString("vi-VN")} VNĐ</div>}
              <div className="free-shipping-info">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🚚</span>
                  <strong>Miễn phí vận chuyển</strong>
                </div>
                <div className="text-sm text-gray-600">• Đơn hàng từ 2,000,000 VNĐ</div>
                <div className="text-sm text-gray-600">• Hoặc sử dụng mã FREESHIP</div>
                {subtotal < 2000000 && (
                  <div className="text-sm font-semibold text-red-600 mt-1">
                    Còn {(2000000 - subtotal).toLocaleString("vi-VN")} VNĐ để được miễn phí ship
                  </div>
                )}
              </div>
              <div className="font-semibold">
                Tổng thanh toán: {finalTotal.toLocaleString("vi-VN")} VNĐ
              </div>
            </div>
            <Link
              to="/checkout"
              state={{ vouchers: selectedVouchers }}
              className="checkout-btn"
            >
              Tiến hành thanh toán
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;