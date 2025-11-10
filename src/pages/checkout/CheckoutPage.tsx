import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../../components/Login-register/style.css"; // Sử dụng style.css đã có
import "./checkout.css"; // CSS riêng cho checkout
import { Cart } from "../../types/cart";
import api from "../../api/api";
import { User } from "../../types/user";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  SelectChangeEvent,
  Chip,
  Box,
  Typography,
  Divider
} from "@mui/material";

interface CheckoutForm {
  fullName: string;
  address: string;
  city: string;
  district: string;
  phone: string;
  email: string;
  note: string;
  paymentMethod: string;
  voucherCodes: string[]; // Đổi từ voucherCode thành voucherCodes
}

interface ShippingResponse {
  shippingFee: number;
}

interface VoucherInfo {
  code: string;
  discountType: 'PERCENT' | 'FIXED' | 'FREESHIP'; // Thêm 'FREESHIP'
  discountValue: number;
  minOrderValue: number;
  isValid: boolean;
  message?: string;
}

interface Voucher {
  code: string;
  discountType: 'PERCENT' | 'FIXED' | 'FREESHIP' ;
  discountValue: number;
  minOrderValue: number;
  isValid?: boolean;
  message?: string;
}

// Helper function to format currency
const formatCurrency = (value: number): string => {
  return value.toLocaleString("vi-VN");
};

const CheckoutPage = () => {
  const [formData, setFormData] = useState<CheckoutForm>({
    fullName: "",
    address: "", 
    city: "",
    district: "",
    phone: "",
    email: "",
    note: "",
    paymentMethod: "cod",
    voucherCodes: [], // Khởi tạo là mảng rỗng
  });
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<Cart | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [shippingZone, setShippingZone] = useState<string>("");
  const [freeShippingReason, setFreeShippingReason] = useState<string>("");
  const [appliedVouchers, setAppliedVouchers] = useState<Voucher[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Vietnamese cities and districts data
  const cities = [
    { value: "hanoi", label: "Hà Nội" },
    { value: "hcm", label: "TP. Hồ Chí Minh" },
    { value: "danang", label: "Đà Nẵng" },
    { value: "haiphong", label: "Hải Phòng" },
    { value: "cantho", label: "Cần Thơ" },
    { value: "binhduong", label: "Bình Dương" },
    { value: "baivi", label: "Bà Rịa - Vũng Tàu" },
    { value: "soctrang", label: "Sóc Trăng" }
  ];

  const districts = {
    hanoi: [
      { value: "baidinh", label: "Ba Đình" },
      { value: "hoankiem", label: "Hoàn Kiếm" },
      { value: "tayho", label: "Tây Hồ" },
      { value: "longbien", label: "Long Biên" },
      { value: "caugiay", label: "Cầu Giấy" },
      { value: "dongda", label: "Đống Đa" },
      { value: "haibatrung", label: "Hai Bà Trưng" },
      { value: "hoangmai", label: "Hoàng Mai" }
    ],
    hcm: [
      { value: "district1", label: "Quận 1" },
      { value: "district2", label: "Quận 2" },
      { value: "district3", label: "Quận 3" },
      { value: "district4", label: "Quận 4" },
      { value: "district5", label: "Quận 5" },
      { value: "district6", label: "Quận 6" },
      { value: "district7", label: "Quận 7" },
      { value: "district8", label: "Quận 8" },
      { value: "district9", label: "Quận 9" },
      { value: "district10", label: "Quận 10" },
      { value: "district11", label: "Quận 11" },
      { value: "district12", label: "Quận 12" }
    ],
    danang: [
      { value: "haichau", label: "Hải Châu" },
      { value: "thanhkhe", label: "Thanh Khê" },
      { value: "sontra", label: "Sơn Trà" },
      { value: "nguhanhson", label: "Ngũ Hành Sơn" },
      { value: "lienchieu", label: "Liên Chiểu" },
      { value: "camle", label: "Cẩm Lệ" }
    ],
    haiphong: [
      { value: "hongbang", label: "Hồng Bàng" },
      { value: "ngoquyen", label: "Ngô Quyền" },
      { value: "lechan", label: "Lê Chân" },
      { value: "haian", label: "Hải An" },
      { value: "kienan", label: "Kiến An" },
      { value: "doso", label: "Đồng Sơn" }
    ],
    cantho: [
      { value: "ninhkieu", label: "Ninh Kiều" },
      { value: "binhthuy", label: "Bình Thủy" },
      { value: "cairang", label: "Cái Răng" },
      { value: "othu", label: "Ô Môn" },
      { value: "thotnot", label: "Thốt Nốt" }
    ],
    binhduong: [
      { value: "thudaumot", label: "Thủ Dầu Một" },
      { value: "bencat", label: "Bến Cát" },
      { value: "tanuyen", label: "Tân Uyên" },
      { value: "dian", label: "Dĩ An" },
      { value: "thuanan", label: "Thuận An" }
    ],
    soctrang: [
      { value: "soctrang", label: "TP. Sóc Trăng" },
      { value: "nganam", label: "Thị xã Ngã Năm" },
      { value: "vinhchau", label: "Thị xã Vĩnh Châu" },
      { value: "kesach", label: "Huyện Kế Sách" },
      { value: "mytu", label: "Huyện Mỹ Tú" },
      { value: "myxuyen", label: "Huyện Mỹ Xuyên" },
      { value: "chauhanh", label: "Huyện Châu Thành" },
      { value: "longphu", label: "Huyện Long Phú" },
      { value: "tranđe", label: "Huyện Trần Đề" },
      { value: "thanhtri", label: "Huyện Thạnh Trị" },
      { value: "culaodung", label: "Huyện Cù Lao Dung" }
    ],
    baivi: [
      { value: "vungtau", label: "Vũng Tàu" },
      { value: "baria", label: "Bà Rịa" },
      { value: "chauduc", label: "Châu Đức" },
      { value: "xuyenmoc", label: "Xuyên Mộc" },
      { value: "longdien", label: "Long Điền" },
      { value: "datdo", label: "Đất Đỏ" }
    ]
  };

  const fetchCart = async () => {
    try {
      const res = await api.get("/cart");
      setCart(res.data);

      // Lấy discount và voucher nếu có
      setDiscountAmount(res.data.discount || 0);
      setAppliedVoucher(res.data.voucher || null);
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
      // Pre-fill form data with user info
      setFormData({
        fullName: res.data.fullName || "",
        address: res.data.address || "",
        city: res.data.city || "",
        district: res.data.district || "",
        phone: res.data.phoneNumber || "",
        email: res.data.email || "",
        note: '',
        paymentMethod: "cod",
        voucherCodes: [] // Khởi tạo rỗng, sẽ được cập nhật từ cart state
      });
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  // Thêm hàm kiểm tra voucher FREESHIP
  const isFreeshipVoucher = () => {
    return appliedVouchers.some(v => v.discountType === "FREESHIP");
  };

  // Sửa hàm calculateShipping
  const calculateShipping = async () => {
    if (!formData.city || !formData.district || !formData.address) return;

    setShippingLoading(true);
    setShippingError(null);

    try {
      // Nếu có voucher FREESHIP thì miễn phí ship
      if (isFreeshipVoucher()) { // Đổi tên hàm ở đây
        setShippingFee(0);
        setFreeShippingReason("Miễn phí vận chuyển với voucher FREESHIP");
        setShippingLoading(false);
        return;
      }

      // Nếu không, gọi API như bình thường
      const { data } = await api.get("/shipping/calculate", {
        params: {
          address: formData.address,
          city: formData.city,
          district: formData.district,
          voucherCodes: formData.voucherCodes.join(","),
        }
      });

      setShippingFee(data.shippingFee);
      setShippingError(null);

      if (data.shippingFee === 0) {
        setFreeShippingReason("Miễn phí vận chuyển");
      } else {
        setFreeShippingReason("");
      }
    } catch (error: any) {
      console.error("Shipping calculation error:", error);
      
      // Handle different types of Axios errors
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        
        if (error.response.status === 404) {
          setShippingError("API endpoint không tồn tại. Vui lòng liên hệ admin!");
        } else if (error.response.status === 400) {
          setShippingError("Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin!");
        } else if (error.response.status === 500) {
          setShippingError("Lỗi server. Vui lòng thử lại sau!");
        } else {
          setShippingError(`Lỗi server (${error.response.status}): ${error.response.data?.message || 'Không tính được phí ship'}`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
        setShippingError("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng!");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error setting up request:", error.message);
        setShippingError("Lỗi kết nối. Vui lòng thử lại!");
      }
      
      setShippingFee(0);
    } finally {
      setShippingLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    fetchUser();
  }, []);

  // Lấy voucher từ cart state khi navigate từ cart
  useEffect(() => {
    if (location.state?.vouchers) {
      console.log("📦 Vouchers received from cart:", location.state.vouchers);
      
      // Lưu mảng voucher vào state
      setAppliedVouchers(location.state.vouchers as Voucher[]);
      
      // Đồng bộ voucherCodes cho các API cần code
      const voucherCodes = (location.state.vouchers as Voucher[]).map(v => v.code);
      setFormData(prev => ({
        ...prev,
        voucherCodes: voucherCodes
      }));
      
      console.log("✅ Vouchers synchronized:", voucherCodes);
    }
  }, [location.state]);

  // Calculate shipping when city, district, address, or voucher code changes
  useEffect(() => {
    if (formData.city && formData.district && formData.address) {
      // Add a small delay to prevent excessive API calls
      const timeoutId = setTimeout(() => {
        calculateShipping();
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [formData.city, formData.district, formData.voucherCodes, formData.address]);

  // Loại bỏ useEffect validate voucher vì không cần thiết nữa

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "phone" && !/^\d*$/.test(value)) return;
    
    setFormData({ ...formData, [name]: value });
    setMessage(null);
    
    // Reset district when city changes
    if (name === "city") {
      setFormData(prev => ({ ...prev, [name]: value, district: "" }));
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    
    setFormData({ ...formData, [name]: value });
    setMessage(null);
    
    // Reset district when city changes
    if (name === "city") {
      setFormData(prev => ({ ...prev, [name]: value, district: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Đảm bảo voucherCodes được gửi đúng cách
      const voucherCodes = appliedVouchers.map(v => v.code);
      console.log("📤 Sending order with vouchers:", voucherCodes);
      
      const orderData = {
        fullName: formData.fullName,
        phoneNumber: formData.phone,
        address: formData.address,
        city: formData.city,
        district: formData.district,
        note: formData.note,
        paymentMethod: formData.paymentMethod,
        voucherCodes: voucherCodes, // <-- Sử dụng voucherCodes từ appliedVouchers
        shippingFee: shippingFee
      };

      console.log("📦 Order data:", orderData);
      await api.post("/order/create", orderData);
      
      Swal.fire({
        title: "Đặt hàng thành công!",
        text: "Trong vòng 24 giờ tới đơn hàng của bạn sẽ được xử lý. Vui lòng thanh toán trong 48 giờ tiếp theo kể từ lúc được xử lý hoặc đơn hàng của bạn sẽ bị hủy.",
        icon: "success"
      });
      navigate("/account");
    } catch (error) {
      console.error("❌ Order creation failed:", error);
      setMessage("Có lỗi xảy ra khi đặt hàng!");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setMessage("Vui lòng nhập họ tên!");
      return false;
    }
    if (!formData.address.trim()) {
      setMessage("Vui lòng nhập địa chỉ!");
      return false;
    }
    if (!formData.city) {
      setMessage("Vui lòng chọn thành phố!");
      return false;
    }
    if (!formData.district) {
      setMessage("Vui lòng chọn quận/huyện!");
      return false;
    }
    if (!/^\d{10}$/.test(formData.phone)) {
      setMessage("Số điện thoại phải là 10 chữ số!");
      return false;
    }
    return true;
  };

  // Calculate totals
  const subtotal = cart?.items.reduce((total, item) => total + (item.price * item.quantity), 0) || 0;
  const finalTotal = subtotal - discountAmount + shippingFee;

  // Check if subtotal meets voucher minimum requirement
  const meetsVoucherRequirement = subtotal >= 200000;

  return (
    <div className="checkout-container">
      <h2 className="checkout-title">Thanh toán</h2>
      <div className="checkout-content">
        <div className="checkout-form">
          {message && (
            <div className={message.includes("10") ? "error-message" : "success-message"}>
              {message}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="fullName">Họ và tên</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Nhập họ và tên"
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="address">Địa chỉ</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Nhập địa chỉ giao hàng"
                required
                disabled={loading}
              />
            </div>
            <div className="input-group">
              <FormControl fullWidth>
                <InputLabel id="city-label">Thành phố</InputLabel>
                <Select
                  labelId="city-label"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleSelectChange}
                  label="Thành phố"
                  disabled={loading}
                  required
                >
                  {cities.map((city) => (
                    <MenuItem key={city.value} value={city.value}>
                      {city.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            <div className="input-group">
              <FormControl fullWidth>
                <InputLabel id="district-label">Quận/Huyện</InputLabel>
                <Select
                  labelId="district-label"
                  id="district"
                  name="district"
                  value={formData.district}
                  onChange={handleSelectChange}
                  label="Quận/Huyện"
                  disabled={loading || !formData.city}
                  required
                >
                  {formData.city && districts[formData.city as keyof typeof districts]?.map((district) => (
                    <MenuItem key={district.value} value={district.value}>
                      {district.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            <div className="input-group">
              <label htmlFor="phone">Số điện thoại</label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Nhập số điện thoại (10 chữ số)"
                required
                disabled={loading}
              />
            </div>
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Nhập email"
                required
                disabled={loading}
                readOnly
              />
            </div>
            
             {/* VOUCHER DISPLAY - HIỂN THỊ VOUCHER ĐÃ ÁP DỤNG TỪ CART 
            {appliedVouchers.length > 0 && (
              <div className="input-group">
                <label>Mã giảm giá đã áp dụng</label>
                <div style={{ 
                  padding: '12px', 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: '4px',
                  border: '1px solid #dee2e6'
                }}>
                  {appliedVouchers.map(voucher => (
                    <div key={voucher.code} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '8px',
                      padding: '8px',
                      backgroundColor: 'white',
                      borderRadius: '4px',
                      border: '1px solid #e9ecef'
                    }}>
                      <div>
                        <strong>{voucher.code}</strong>
                        <span style={{ 
                          marginLeft: '8px',
                          color: voucher.discountType === 'FREESHIP' ? '#28a745' : '#007bff',
                          fontSize: '12px'
                        }}>
                          {voucher.discountType === "FREESHIP"
                            ? "Miễn phí vận chuyển"
                            : voucher.discountType === "PERCENT"
                            ? `Giảm ${voucher.discountValue}%`
                            : `Giảm ${voucher.discountValue.toLocaleString("vi-VN")} VNĐ`}
                        </span>
                      </div>
                      <Chip
                        label="Đã áp dụng"
                        color="success"
                        size="small"
                        variant="outlined"
                      />
                    </div>
                  ))}
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#6c757d', 
                    marginTop: '8px',
                    fontStyle: 'italic'
                  }}>
                    💡 Voucher đã được kiểm tra và áp dụng từ giỏ hàng
                  </div>
                </div>
              </div>
            )} */}

            <div className="form-group">
              <label htmlFor="note">Ghi chú</label>
              <textarea
                id="note"
                name="note"
                value={formData.note}
                onChange={handleChange}
                placeholder="Nhập ghi chú cho đơn hàng (nếu có)"
                style={{ resize: "none" }}
                disabled={loading}
              ></textarea>
            </div>
            <div className="input-group">
              <label htmlFor="paymentMethod">Phương thức thanh toán</label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="cod">Thanh toán khi nhận hàng (COD)</option>
                <option value="bank">Chuyển khoản ngân hàng</option>
                <option value="wallet">Ví điện tử</option>
              </select>
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Đang xử lý..." : "Xác nhận đơn hàng"}
            </button>
          </form>
        </div>
        <div className="checkout-cart">
          <h3 className="cart-title">Giỏ hàng của bạn</h3>
          {cart?.items.map((item) => (
            <div key={item.id} className="cart-item">
              <img
                src={item.imageUrl}
                alt={item.productName}
                className="cart-item-image"
                onError={(e) =>
                  (e.currentTarget.src =
                    "https://via.placeholder.com/50?text=Image+Not+Found")
                }
              />
              <div className="cart-item-details">
                <span>{item.productName}</span>
                <span>Số lượng: {item.quantity}</span>
                <span>
                  Giá: {formatCurrency(item.price * item.quantity)} VNĐ
                </span>
              </div>
            </div>
          ))}
          
          {/* Order Summary */}
          <div className="cart-total">
            <div className="summary-item">
              <span>Tổng tiền hàng:</span>
              <span>{formatCurrency(subtotal)} VNĐ</span>
            </div>
            {discountAmount > 0 && (
              <div className="summary-item discount">
                <span>Giảm giá:</span>
                <span>-{formatCurrency(discountAmount)} VNĐ</span>
              </div>
            )}
            
            {/* Shipping Information */}
            <Divider style={{ margin: '8px 0' }} />
            <div className="summary-item">
              <span>
                Phí ship: 
                {shippingLoading && <CircularProgress size={16} style={{ marginLeft: 8 }} />}
              </span>
              <span>
                {shippingFee === 0 ? (
                  <Box display="flex" alignItems="center">
                    <Typography variant="body2" color="success.main" fontWeight="bold">
                      Miễn phí
                    </Typography>
                    {freeShippingReason && (
                      <Chip
                        label={freeShippingReason}
                        size="small"
                        color="success"
                        variant="outlined"
                        style={{ marginLeft: 8 }}
                      />
                    )}
                  </Box>
                ) : (
                  <Box display="flex" alignItems="center">
                    <Typography variant="body2">
                      {formatCurrency(shippingFee)} VNĐ
                    </Typography>
                    {shippingZone && (
                      <Chip
                        label={shippingZone}
                        size="small"
                        variant="outlined"
                        style={{ marginLeft: 8 }}
                      />
                    )}
                  </Box>
                )}
                {/* {!shippingLoading && (
                  <button
                    type="button"
                    onClick={calculateShipping}
                    style={{
                      marginLeft: 8,
                      padding: '4px 8px',
                      fontSize: '12px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                    disabled={!formData.city || !formData.district || !formData.address}
                  >
                    Tính lại
                  </button>
                )} */}
              </span>
            </div>
            
            {shippingError && (
              <Alert severity="error" style={{ marginTop: 8, marginBottom: 8 }}>
                {shippingError}
              </Alert>
            )}

            {/* Applied Vouchers - CẢI THIỆN HIỂN THỊ */}
            {appliedVouchers.length > 0 && (
              <div className="summary-item">
                <span>Voucher đã áp dụng:</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {appliedVouchers.map(voucher => (
                    <Chip
                      key={voucher.code}
                      label={
                        voucher.discountType === "FREESHIP"
                          ? `${voucher.code} - Miễn phí vận chuyển`
                          : `${voucher.code} - ${voucher.discountType === "PERCENT"
                            ? `Giảm ${voucher.discountValue}%`
                            : `Giảm ${voucher.discountValue.toLocaleString("vi-VN")} VNĐ`}`
                      }
                      color={voucher.discountType === "FREESHIP" ? "success" : "primary"}
                      size="small"
                      variant="outlined"
                      style={{ alignSelf: 'flex-start' }}
                    />
                  ))}
                </div>
              </div>
            )}

            <Divider style={{ margin: '8px 0' }} />
            <div className="summary-item total">
              <strong>Tổng cộng:</strong>
              <strong>{formatCurrency(finalTotal)} VNĐ</strong>
            </div>

            {/* Voucher Requirements */}
            {!meetsVoucherRequirement && (
              <Alert severity="info" style={{ marginTop: 8 }}>
                💡 Mua thêm {formatCurrency(200000 - subtotal)} VNĐ để được áp dụng voucher FREESHIP!
              </Alert>
            )}
          </div>
          <Link to="/cart" className="back-link">
            Quay lại giỏ hàng
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;