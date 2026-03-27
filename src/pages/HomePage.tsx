import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../assets/css/home.css";
import ProductCard from "../components/product-card/product-card";
import { mockProducts, mockNews } from "../mocks/mockData";
import { Product } from "../types/product";
import api from "../api/api";
import { News } from "../types/news";
// import C2CFeaturedSection from '../components/productC2C-card/C2CFeaturedSection'; // <--- BỔ SUNG DÒNG NÀY

const HomePage: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(2 * 60 * 60); // 2 giờ
  const [selectedCategory, setSelectedCategory] = useState<string>("Tất cả");
  const [products, setProducts] = useState<Product[]>([]);
  const [hotSaleProducts, setHotSaleProducts] = useState<Product[]>([]);
  const [discountProducts, setDiscountProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [news, setNews] = useState<News[]>([]);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/category");
      setCategories(["Tất cả", ...response.data]);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get("/product");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchHotSaleProducts = async () => {
    try {
      const response = await api.get("/product/hot-sale");
      setHotSaleProducts(response.data);
    } catch (error) {
      console.error("Error fetching hot sale products:", error);
    }
  };

  const fetchDiscountProducts = async () => {
    try {
      const response = await api.get("/product/discount");
      setDiscountProducts(response.data);
    } catch (error) {
      console.error("Error fetching discount products:", error);
    }
  };

  const fetchNews = async () => {
    try {
      const response = await api.get("/news");
      setNews(response.data.content);
    } catch (error) {
      console.error("Error fetching news:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchHotSaleProducts();
    fetchDiscountProducts();
    fetchNews();
    console.log(news);
  }, []);

  const filteredProducts = mockProducts.filter(
    (product) => product.category === selectedCategory
  );

  // Timer cho Khuyến Mãi Online
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (<>
    {/* Banner trái/phải cố định */}
  <img
    src="/public/banners/Banner_vertical.png"
    alt="Banner trái"
    className="floating-banner left-fixed"
  />
  <img
    src="/public/banners/banner-right.png"
    alt="Banner phải"
    className="floating-banner right-fixed"
  />
    <div className="body-container">
      {/* Danh mục sản phẩm */}
      <section className="product-category">
        <div className="category-header">
          <img
            src="/public/banners/banner1_afterHeader.png"
            alt="Khuyến mãi online"
            className="banner-image"
          />
            <div className="countdown-timer" aria-live="polite">
            <span className="timer-label">Kết thúc trong:</span>
            {formatTime(timeLeft)}
          </div>
        </div>
        <div className="category-tabs" role="tablist">
          {categories.map((category) => (
            <button
              key={category}
              className={selectedCategory === category ? "active" : ""}
              onClick={() => setSelectedCategory(category)}
              role="tab"
              aria-selected={selectedCategory === category}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Hiển thị sản phẩm theo danh mục */}
        <div className="product-list">
          {discountProducts.filter(product =>
            selectedCategory === 'Tất cả' || product.category === selectedCategory
          ).length > 0 ? (
            discountProducts
              .filter(product =>
                selectedCategory === 'Tất cả' || product.category === selectedCategory
              )
              .slice(0, 8)
              .map((product) => (
                <ProductCard key={product.slug} {...product} />
              ))
          ) : (
            <p className="no-product">Chưa có sản phẩm nào.</p>
          )}
        </div>

        {/* Nút xem tất cả sản phẩm */}
        <Link to="/all-products" className="view-all-btn">
          Xem tất cả sản phẩm
        </Link>
      </section>

      {/* HOT SALE */}
      <section className="hot-sale-container">
        <h2 className="hot-sale-title">🔥 HOT SALE</h2>
        <div className="hot-sale-products">
          {hotSaleProducts.slice(0, 8).map((product) => (
            <ProductCard key={product.slug} {...product} />
          ))}
        </div>
        <Link to="/all-products" className="view-all-btn">
          Xem tất cả sản phẩm
        </Link>
      </section>


      {/* Giao diện C2C */}
      {/* <C2CFeaturedSection /> */}

      

      {/* Tin tức sản phẩm công nghệ */}
      <section className="tech-news">
        <h1 className="news-title">📰 Tin tức sản phẩm công nghệ</h1>
        <div className="news-content">
          <div className="news-text">
            <p>
              Khám phá những sản phẩm công nghệ mới nhất với các tính năng vượt
              trội, mang đến trải nghiệm tuyệt vời cho người dùng.
            </p>
            <p>
              Các dòng sản phẩm từ Apple, Samsung và nhiều thương hiệu khác đang
              chờ bạn khám phá!
            </p>
            <Link to="/news/39" className="news-readmore-btn">
              Xem thêm
            </Link>
          </div>
          <div className="news-image">
            <img
              src="/images/news/news4/SS-gap4.png"
              alt="Tin tức công nghệ"
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </div>
      </section>
      

      {/* Tin tức công nghệ */}
      <section className="general-tech-news">
        <h1 className="news-title">🌐Tin tức công nghệ</h1>
        <div className="news-list">
          {news.slice(0, 2).map((news) => (
            <Link key={news.id} to={`/news/${news.id}`} className="news-item">
              <img src={news.imageUrl} alt={news.title} className="news-image" />
              <div className="news-info">
                <h3 className="news-item-title">{news.title}</h3>
                <p className="news-excerpt">{news.excerpt}</p>
                <span className="news-date">
                  {new Date(news.publishedAt).toLocaleDateString("vi-VN")}
                </span>
              </div>
            </Link>
          ))}
        </div>
        <Link to="/news" className="view-all-btn">
          Xem tất cả tin tức
        </Link>
      </section>
    </div>
  </>);
};

export default HomePage;