import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/footer.css'; // Đảm bảo file CSS riêng được import

// Import các icon mạng xã hội
import facebookIcon from '../assets/images//icons/fb.png';
import instagramIcon from '../assets/images//icons/ins.png';
import tiktokIcon from '../assets/images//icons/tiktok.png';
import zaloIcon from '../assets/images//icons/zalo.png';

// Import icon VNPay
import vnpayIcon from '../assets/images//icons/vnpay.png';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-column">
          <h3>PrimeShop</h3>
          <p>Địa chỉ: 10/80c Song Hành Xa Lộ Hà Nội, Phường Tân Phú, Thủ Đức, Hồ Chí Minh</p>
          <p>Điện thoại: 0123456789</p>
          <p>Email: contact@primeshop.com</p>
        </div>

        <div className="footer-column">
          <h3>Chính sách</h3>
          <p>
            <Link to="/warranty-policy">Chính sách bảo hành</Link>
          </p>
          <p>
            <Link to="/return-policy">Chính sách đổi trả</Link>
          </p>
          <p>
            <Link to="/privacy-policy">Chính sách bảo mật</Link>
          </p>
          <p>
            <Link to="/terms-of-use">Điều khoản sử dụng</Link>
          </p>
        </div>

        <div className="footer-column">
          <h3>Hướng dẫn</h3>
          <p>
            <Link to="/shopping-guide">Hướng dẫn mua hàng</Link>
          </p>
          <p>
            <Link to="/payment-guide">Hướng dẫn thanh toán</Link>
          </p>
          <p>
            <Link to="/installment-guide">Hướng dẫn trả góp</Link>
          </p>
          <p>
            <Link to="/voucher-guide">Hướng dẫn sử dụng voucher</Link>
          </p>
        </div>

        <div className="footer-column">
          <h3>Kết nối với chúng tôi</h3>
          <div className="social-icons">
            <a href="https://facebook.com/primeshop">
              <img src={facebookIcon} alt="Facebook" />
            </a>
            <a href="https://instagram.com/primeshop">
              <img src={instagramIcon} alt="Instagram" />
            </a>
            <a href="https://tiktok.com/@primeshop">
              <img src={tiktokIcon} alt="TikTok" />
            </a>
            <a href="https://zalo.me/primeshop">
              <img src={zaloIcon} alt="Zalo" />
            </a>
          </div>
          <h3>Phương thức thanh toán</h3>
          <div className="payment-icons">
            <img src={vnpayIcon} alt="VNPay" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;