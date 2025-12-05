import React, { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProductCard from "../../components/product-card/product-card";
import styles from "./styles/ProductsPage.module.css";
import { Category } from "../../api/category.api";
import api from "../../api/api";
import { useSearchParams } from "react-router-dom";

const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State UI
  const [products, setProducts] = useState({ content: [], totalPages: 0, number: 0 });
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Lấy trang hiện tại từ URL hoặc mặc định là 0. 
  // Lưu ý: Backend thường tính từ 0, UI thường hiển thị từ 1.
  const pageParam = parseInt(searchParams.get("page") || "0");
  const [currentPage, setCurrentPage] = useState(pageParam);

  // Lấy giá trị filter từ URL
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "all";
  const brand = searchParams.get("brand") || "all";
  const minPrice = searchParams.get("minPrice") || "all";
  const maxPrice = searchParams.get("maxPrice") || "all";

  const priceRanges = [
    { label: "- Tất cả -", minPrice: "", maxPrice: "" },
    { label: "Dưới 1 triệu", minPrice: "0", maxPrice: "1000000" },
    { label: "1 - 5 triệu", minPrice: "1000000", maxPrice: "5000000" },
    { label: "5 - 10 triệu", minPrice: "5000000", maxPrice: "10000000" },
    { label: "10 - 20 triệu", minPrice: "10000000", maxPrice: "20000000" },
    { label: "Trên 20 triệu", minPrice: "20000000", maxPrice: "" },
  ];

  // Load danh mục và thương hiệu một lần
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [resCategories, resBrands] = await Promise.all([
          api.get("/category/all").catch(() => ({ data: [] })),
          api.get("/product/brands").catch(() => ({ data: [] }))
        ]);
        setCategories(resCategories.data);
        setBrands(["all", ...resBrands.data]);
      } catch (err) {
        console.error("Lỗi khi tải filters:", err);
      }
    };
    fetchFilters();
  }, []);

  // Load sản phẩm khi filter hoặc page thay đổi
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        // Cuộn lên đầu trang mỗi khi load lại data
        window.scrollTo({ top: 0, behavior: 'smooth' });

        const res = await api.get("/product/all-products", {
          params: {
            search: search || undefined,
            category: category !== "all" ? category : undefined,
            brand: brand !== "all" ? brand : undefined,
            minPrice: minPrice !== "all" ? minPrice : undefined,
            maxPrice: maxPrice !== "all" ? maxPrice : undefined,
            page: currentPage,
            size: 12 // Hiển thị 12 sản phẩm mỗi trang cho đẹp grid
          },
        });
        setProducts(res.data);
      } catch (error) {
        console.error("Lỗi khi gọi API sản phẩm:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [search, category, brand, minPrice, maxPrice, currentPage]);

  // Hàm cập nhật URL Params
  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === "all" || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    // Khi filter thay đổi, reset về trang 0
    if (key !== "page") {
      params.set("page", "0");
      setCurrentPage(0);
    }
    setSearchParams(params);
  };

  // Hàm chuyển trang
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    setSearchParams(params);
  };

  // --- THUẬT TOÁN PHÂN TRANG THÔNG MINH ---
  const renderPagination = () => {
    const totalPages = products.totalPages;
    const current = currentPage + 1; // UI hiển thị từ 1, logic chạy từ 0
    const delta = 2; // Số lượng trang hiển thị xung quanh trang hiện tại
    const range = [];
    const rangeWithDots = [];

    // Logic: Luôn hiện trang đầu, trang cuối, và khoảng xung quanh current
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= current - delta && i <= current + delta)) {
        range.push(i);
      }
    }

    let l;
    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return (
      <div className={styles.pagination}>
        <button
          onClick={() => handlePageChange(Math.max(currentPage - 1, 0))}
          disabled={currentPage === 0}
        >
          &lt; Trước
        </button>

        {rangeWithDots.map((page, index) => 
          page === '...' ? (
            <span key={`dots-${index}`} className={styles.dots}>...</span>
          ) : (
            <button
              key={index}
              onClick={() => handlePageChange((page as number) - 1)}
              className={currentPage === (page as number) - 1 ? styles.active : ""}
            >
              {page}
            </button>
          )
        )}

        <button
          onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages - 1))}
          disabled={currentPage >= totalPages - 1}
        >
          Sau &gt;
        </button>
      </div>
    );
  };

  return (
    <div className={styles.productsPage}>
      <ToastContainer position="top-right" autoClose={2000} />
      
      <header className={styles.header}>
        <h1>Tất cả sản phẩm</h1>
      </header>

      {/* Bộ lọc và tìm kiếm */}
      <div className={styles.filters}>
        <div className={styles.searchBar}>
          <input
            type="text"
            value={search}
            onChange={(e) => updateParam("search", e.target.value)}
            placeholder="Tìm kiếm tên sản phẩm..."
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterGroup}>
          <div className={styles.filter}>
            <label>Danh mục</label>
            <select
              value={category}
              onChange={(e) => updateParam("category", e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">- Tất cả -</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filter}>
            <label>Thương hiệu</label>
            <select
              value={brand}
              onChange={(e) => updateParam("brand", e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">- Tất cả -</option>
              {brands.map((b, idx) => (
                <option key={idx} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className={styles.filter}>
            <label>Khoảng giá</label>
            <div style={{display: 'flex', gap: '10px'}}>
               {/* Logic chọn khoảng giá kết hợp */}
               <select
                 value={minPrice}
                 onChange={(e) => updateParam("minPrice", e.target.value)}
                 className={styles.filterSelect}
                 style={{flex: 1}}
               >
                 {priceRanges.map((r, i) => <option key={i} value={r.minPrice}>{r.minPrice ? new Intl.NumberFormat('vi-VN').format(Number(r.minPrice)) : 'Min'}</option>)}
               </select>
               <span style={{alignSelf: 'center'}}>-</span>
               <select
                 value={maxPrice}
                 onChange={(e) => updateParam("maxPrice", e.target.value)}
                 className={styles.filterSelect}
                 style={{flex: 1}}
               >
                  {priceRanges.map((r, i) => <option key={i} value={r.maxPrice}>{r.maxPrice ? new Intl.NumberFormat('vi-VN').format(Number(r.maxPrice)) : 'Max'}</option>)}
               </select>
            </div>
          </div>
        </div>
      </div>

      {/* Loading & Sản phẩm */}
      {isLoading ? (
        <div className={styles.loading}><p>Đang tải dữ liệu...</p></div>
      ) : products.content.length === 0 ? (
        <div className={styles.empty}><p>Không tìm thấy sản phẩm phù hợp.</p></div>
      ) : (
        <>
          <div className={styles.productsGrid}>
            {products.content.map((p: any) => (
              <ProductCard key={p.id || p.slug} {...p} />
            ))}
          </div>
          
          {/* Gọi hàm render pagination thông minh */}
          {products.totalPages > 1 && renderPagination()}
        </>
      )}
    </div>
  );
};

export default ProductsPage;