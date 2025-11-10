import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaPhone, FaStore, FaBriefcase, FaShoppingCart, FaHeart, FaUser, FaBars, FaSearch, FaSignOutAlt, FaChevronDown } from "react-icons/fa";
import "../assets/css/header.css";
import logo from "../assets/images/P.png";
import { User } from "../types/user";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { CartContext } from "../context/CartContext";
import Swal from "sweetalert2";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isStoreDropdownOpen, setIsStoreDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const [cartItemCount, setCartItemCount] = useState(0);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleStoreDropdown = () => {
    setIsStoreDropdownOpen(!isStoreDropdownOpen);
  };

  // Mock data: Danh sách địa chỉ cửa hàng
  const storeLocations = [
    { name: "PrimeShop Quận 1", address: "123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh" },
    { name: "PrimeShop Quận 7", address: "456 Đường Nguyễn Hữu Thọ, Quận 7, TP. Hồ Chí Minh" },
    { name: "PrimeShop Hà Nội", address: "789 Đường Giải Phóng, Quận Hoàng Mai, Hà Nội" },
  ];

  return (
    <header className="header">
      {/* Section 1: Title + Hotline & Nút tiện ích */}
      <section className="top-bar">
        <div className="welcome-text">Chào mừng đến với PrimeShop!</div>
        <div className="top-right">
          <p className="hotline">
            <FaPhone className="icon" /> <span className="bold">19000 9099</span>
          </p>
          <div className="store-dropdown">
            <button className="btn" onClick={toggleStoreDropdown}>
              <FaStore className="icon" /> Hệ thống cửa hàng
              <FaChevronDown className={`dropdown-icon ${isStoreDropdownOpen ? "open" : ""}`} />
            </button>
            {isStoreDropdownOpen && (
              <div className="dropdown-menu">
                {storeLocations.map((store, index) => (
                  <div key={index} className="dropdown-item">
                    <h4>{store.name}</h4>
                    <p>{store.address}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className="btn">
            <FaBriefcase className="icon" /> Tuyển dụng
          </button>
        </div>
      </section>

      {/* Section 2: Logo, Tìm kiếm, Nút chức năng */}
      <section className="main-header">
        <div className="logo">
          <Link to="/home" className="logo-link">
            <img src={logo} alt="PrimeShop Logo" className="logo-image enlarged" />
          </Link>
          <p>Mua sắm thông minh, tiện lợi!</p>
        </div>

        <div className="search-box">
          <div className="search-wrapper">
            <FaSearch className="search-icon" />
            <input type="text" placeholder="Tìm kiếm sản phẩm..." />
          </div>
        </div>

        <div className="user-actions">
          {!user ? (
            <>
              <Link to="/login" className="login-btn">
                <FaUser className="icon" /> Đăng nhập
              </Link>
              <Link to="/register" className="login-btn">
                <FaUser className="icon" /> Đăng ký
              </Link>
            </>
          ) : (
            <div className="user-actions">
              <Link to="/account" className="login-btn">
                <FaUser className="icon" /> {user.username}
              </Link>
              <Link
                to="#"
                onClick={() => {
                  Swal.fire({
                    title: 'Xác nhận đăng xuất?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Đăng xuất',
                    cancelButtonText: 'Hủy',
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    reverseButtons: true,
                  }).then((result) => {
                    if (result.isConfirmed) {
                      logout();
                      window.location.href = '/login';
                    }
                  });
                }}
                className="login-btn"
              >
                <FaSignOutAlt className="icon" /> Đăng xuất
              </Link>
            </div>
          )}
          <Link to={user ? "/cart" : "/login"} className="cart-btn">
            <FaShoppingCart className="icon" /> Giỏ hàng
            {cartItemCount > 0 && (
              <span className="cart-count">{cartItemCount}</span>
            )}
          </Link>
        </div>

        {/* Menu Hamburger cho mobile */}
        <button className="hamburger" onClick={toggleMenu}>
          <FaBars className={`hamburger-icon ${isMenuOpen ? "open" : ""}`} />
        </button>
      </section>

      {/* Thanh menu điều hướng */}
      <nav className="navigation-container">
        <div className="nav-box">
          <Link to="/home" className="nav-item">Trang Chủ</Link>
          <Link to="/about" className="nav-item">Giới thiệu</Link>
          <Link to="/all-products" className="nav-item">Sản phẩm</Link>
          <Link to="/news" className="nav-item">Tin Tức</Link>
          <Link to="/faq" className="nav-item">Q&A</Link>
          {user ? (
            <Link to="/account" className="nav-item">Tài khoản</Link>
          ) : (
            <Link to="/login" className="nav-item">Tài khoản</Link>
          )}
          <Link to="/minigame-list" className="nav-item">Mini Game</Link>
          <Link to="/delivery-dashboard" className="nav-item">Đơn hàng</Link>
          <Link to="/c2c" className="nav-item">Gian hàng C2C</Link>
        </div>
      </nav>

      {/* Menu mobile */}
      <div className={`mobile-menu ${isMenuOpen ? "open" : ""}`}>
        <div className="mobile-menu-content">
          <div className="mobile-search-box">
            <div className="search-wrapper">
              <FaSearch className="search-icon" />
              <input type="text" placeholder="Tìm kiếm sản phẩm..." />
            </div>
          </div>
          <Link to="/home" className="mobile-menu-item">Trang Chủ</Link>
          <Link to="/about" className="mobile-menu-item">Giới thiệu</Link>
          <Link to="/products" className="mobile-menu-item">Sản phẩm</Link>
          <Link to="/news" className="mobile-menu-item">Tin Tức</Link>
          <Link to="/order-tracking" className="mobile-menu-item">Kiểm Tra Đơn Hàng</Link>
          <Link to="/faq" className="mobile-menu-item">Q&A</Link>
          <Link to="/account" className="mobile-menu-item">
            <FaUser className="icon" /> Tài khoản
          </Link>
          <Link to="/wishlist" className="mobile-menu-item">
            <FaHeart className="icon" /> Yêu thích
          </Link>
          <Link to="/cart" className="mobile-menu-item">
            <FaShoppingCart className="icon" /> Giỏ hàng {cartItemCount > 0 && `(${cartItemCount})`}
          </Link>
          <div className="mobile-store-dropdown">
            <button className="mobile-menu-btn" onClick={toggleStoreDropdown}>
              <FaStore className="icon" /> Hệ thống cửa hàng
              <FaChevronDown className={`dropdown-icon ${isStoreDropdownOpen ? "open" : ""}`} />
            </button>
            {isStoreDropdownOpen && (
              <div className="mobile-dropdown-menu">
                {storeLocations.map((store, index) => (
                  <div key={index} className="mobile-dropdown-item">
                    <h4>{store.name}</h4>
                    <p>{store.address}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className="mobile-menu-btn">
            <FaBriefcase className="icon" /> Tuyển dụng
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;