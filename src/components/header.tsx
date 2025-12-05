import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Gom import lại
import { 
  FaPhone, FaStore, FaBriefcase, FaShoppingCart, 
  FaUser, FaBars, FaSearch, FaSignOutAlt, FaChevronDown 
} from "react-icons/fa";
import "../assets/css/header.css";
import logo from "../assets/images/P.png";
import { useAuth } from "../context/AuthContext";
// import { useCart } from "../context/CartContext"; // Uncomment nếu đã cấu hình xong CartContext
import Swal from "sweetalert2";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isStoreDropdownOpen, setIsStoreDropdownOpen] = useState(false);
  
  // Auth Context
  const { user, logout } = useAuth();
  
  // State UI
  const [searchTerm, setSearchTerm] = useState(""); 
  const [cartItemCount, setCartItemCount] = useState(0); // Nếu có CartContext, hãy lấy từ đó
  
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleStoreDropdown = () => {
    setIsStoreDropdownOpen(!isStoreDropdownOpen);
  };

  // Logic kiểm tra User & Role (Ưu tiên lấy từ Context, fallback sang LocalStorage nếu cần)
  // Nếu useAuth đã xử lý việc persist user thì useEffect này có thể không cần thiết
  // Tuy nhiên, giữ lại để đảm bảo logic cũ của bạn vẫn chạy
  const [localUser, setLocalUser] = useState<any>(null);
  
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setLocalUser(JSON.parse(userData));
    }
  }, [user]); // Re-run khi user context thay đổi

  // Xác định user hiện tại (ưu tiên Context -> LocalStorage)
  const currentUser = user || localUser;

  // --- DEBUG ROLE (Có thể xóa sau khi test xong) ---
  useEffect(() => {
    if (currentUser) {
      console.log("=== THÔNG TIN USER HIỆN TẠI ===");
      console.log("User:", currentUser);
      console.log("Is Admin Check:", 
        currentUser.username === 'admin' || 
        currentUser.role === 'ADMIN'
      );
      console.log("===============================");
    }
  }, [currentUser]);

  // Kiểm tra quyền Admin
  // CẬP NHẬT: Thêm check username === 'admin' vì localStorage hiện tại chưa có role
  const isAdmin = currentUser && (
    currentUser.role === 'ADMIN' || 
    currentUser.roles?.includes('ADMIN') || 
    currentUser.roles?.includes('ROLE_ADMIN') ||
    currentUser.username === 'admin' // <--- Fallback cho trường hợp của bạn
  );

  // Mock data locations
  const storeLocations = [
    { name: "PrimeShop Quận 1", address: "123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh" },
    { name: "PrimeShop Quận 7", address: "456 Đường Nguyễn Hữu Thọ, Quận 7, TP. Hồ Chí Minh" },
    { name: "PrimeShop Hà Nội", address: "789 Đường Giải Phóng, Quận Hoàng Mai, Hà Nội" },
  ];

  // --- LOGIC TÌM KIẾM ---
  const handleSearch = () => {
    if (searchTerm.trim()) {
      setIsMenuOpen(false); // Đóng menu mobile nếu đang mở
      navigate(`/all-products?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <header className="header">
      {/* Section 1: Top Bar */}
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

      {/* Section 2: Main Header */}
      <section className="main-header">
        <div className="logo">
          <Link to="/home" className="logo-link">
            <img src={logo} alt="PrimeShop Logo" className="logo-image enlarged" />
          </Link>
          <p>Mua sắm thông minh, tiện lợi!</p>
        </div>

        {/* SEARCH BOX (DESKTOP) */}
        <div className="search-box">
          <div className="search-wrapper">
            <FaSearch 
              className="search-icon" 
              onClick={handleSearch} 
              style={{ cursor: 'pointer' }} 
            />
            <input 
              type="text" 
              placeholder="Tìm kiếm sản phẩm..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        {/* USER ACTIONS */}
        <div className="user-actions">
          {!currentUser ? (
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
                <FaUser className="icon" /> {currentUser.username}
              </Link>
              <button
                onClick={() => {
                  Swal.fire({
                    title: 'Xác nhận đăng xuất?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Đăng xuất',
                    cancelButtonText: 'Hủy',
                    confirmButtonColor: '#d33',
                    reverseButtons: true,
                  }).then((result) => {
                    if (result.isConfirmed) {
                      logout();
                      window.location.href = '/login';
                    }
                  });
                }}
                className="login-btn"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <FaSignOutAlt className="icon" /> Đăng xuất
              </button>
            </div>
          )}
          
          <Link to={currentUser ? "/cart" : "/login"} className="cart-btn">
            <FaShoppingCart className="icon" /> Giỏ hàng
            {cartItemCount > 0 && (
              <span className="cart-count">{cartItemCount}</span>
            )}
          </Link>
        </div>

        {/* Hamburger Mobile */}
        <button className="hamburger" onClick={toggleMenu}>
          <FaBars className={`hamburger-icon ${isMenuOpen ? "open" : ""}`} />
        </button>
      </section>

      {/* Section 3: Navigation Bar (Desktop) */}
      <nav className="navigation-container">
        <div className="nav-box">
          <Link to="/home" className="nav-item">Trang Chủ</Link>
          <Link to="/about" className="nav-item">Giới thiệu</Link>
          <Link to="/all-products" className="nav-item">Sản phẩm</Link>
          <Link to="/news" className="nav-item">Tin Tức</Link>
          <Link to="/faq" className="nav-item">Q&A</Link>
          <Link to={currentUser ? "/account" : "/login"} className="nav-item">Tài khoản</Link>
          <Link to="/minigame-list" className="nav-item">Mini Game</Link>
          
          {/* PHÂN QUYỀN ADMIN - ĐÃ ĐƯỢC KÍCH HOẠT CHO USERNAME 'admin' */}
          {isAdmin && (
               <Link to="/delivery-dashboard" className="nav-item">Đơn hàng</Link>
          )}
        </div>
      </nav>

      {/* Section 4: Mobile Menu */}
      <div className={`mobile-menu ${isMenuOpen ? "open" : ""}`}>
        <div className="mobile-menu-content">
          
          {/* SEARCH BOX (MOBILE) - ĐÃ SỬA LỖI */}
          <div className="mobile-search-box">
            <div className="search-wrapper">
              <FaSearch className="search-icon" onClick={handleSearch} />
              <input 
                type="text" 
                placeholder="Tìm kiếm sản phẩm..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>

          <Link to="/home" className="mobile-menu-item" onClick={toggleMenu}>Trang Chủ</Link>
          <Link to="/about" className="mobile-menu-item" onClick={toggleMenu}>Giới thiệu</Link>
          {/* Sửa link /products thành /all-products cho đồng bộ */}
          <Link to="/all-products" className="mobile-menu-item" onClick={toggleMenu}>Sản phẩm</Link>
          <Link to="/news" className="mobile-menu-item" onClick={toggleMenu}>Tin Tức</Link>
          
          {isAdmin && (
             <Link to="/delivery-dashboard" className="mobile-menu-item" onClick={toggleMenu}>Quản lý Đơn Hàng</Link>
          )}
          
          <Link to="/faq" className="mobile-menu-item" onClick={toggleMenu}>Q&A</Link>
          <Link to="/account" className="mobile-menu-item" onClick={toggleMenu}>
            <FaUser className="icon" /> Tài khoản
          </Link>
          
          <Link to="/cart" className="mobile-menu-item" onClick={toggleMenu}>
            <FaShoppingCart className="icon" /> Giỏ hàng {cartItemCount > 0 && `(${cartItemCount})`}
          </Link>
          
          {/* Mobile Store Dropdown */}
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
        </div>
      </div>
    </header>
  );
};

export default Header;