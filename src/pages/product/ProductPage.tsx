import React, { useState, useEffect, use } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProductCard from "../../components/product-card/product-card";
import { mockProducts } from "../../mocks/mockData";
import styles from "./styles/ProductsPage.module.css";
import { Product } from "../../types/product";
import { Category, getAllCategories } from "../../api/category.api";
import { getAllProducts } from "../../api/product.api";
import api from "../../api/api";
import { fetchProducts, fetchCategories, fetchBrands } from "../../api/product.api";
import { useSearchParams } from "react-router-dom";

// const ProductsPage: React.FC = () => {
//   // State quản lý sản phẩm, tìm kiếm, bộ lọc và loading
//   const [products, setProducts] = useState<Product[]>([]);
//   const [searchTerm, setSearchTerm] = useState<string>("");
//   const [selectedCategory, setSelectedCategory] = useState<string>("all");
//   const [selectedBrand, setSelectedBrand] = useState<string>("all");
//   const [isLoading, setIsLoading] = useState<boolean>(true);
//   const [category, setCategory] = useState<Category[]>([]);

//   // Lấy danh sách danh mục và thương hiệu từ mock data
//   const categories = ["all", ...new Set(mockProducts.map((p) => p.category))];
//   const brands = ["all", ...new Set(mockProducts.map((p) => p.brand))];

//   const fetchProducts = async () => {
//     try {
//         const res = await api.get("/product");
//         setProducts(res.data);
//         const categories = ["all", ...new Set(products.map((p) => p.category))];
//     } catch (error) {
//         console.log("Lỗi khi lấy sản phẩm:", error);
//     }
//   }

//   const fetchCategories = async () => {
//     try {
//         const res = await api.get("/category");
//         setCategory(res.data);
//     } catch (error) {
//         console.log("Lỗi khi lấy danh mục:", error);
//     }
//   } 
  
//   useEffect(() => {
//     fetchCategories();
//     fetchProducts();
//   })

//   // Hàm tìm kiếm và lọc sản phẩm
//   const filterProducts = async () => {
//     setIsLoading(true);
//     const res = await api.get("/product");
//     const categories = ["all", ...new Set(res.data.map((p) => p.category))];
//     setTimeout(() => {      
//       const filtered = res.data.filter((product) => {
//         const matchesSearch = product.name
//           .toLowerCase()
//           .includes(searchTerm.toLowerCase());
//         const matchesCategory =
//           selectedCategory === "all" || product.category === selectedCategory;
//         const matchesBrand =
//           selectedBrand === "all" || product.brand === selectedBrand;
//         return matchesSearch && matchesCategory && matchesBrand;
//       });
//       setProducts(filtered);
//       setIsLoading(false);
//     }, 500); // Giả lập độ trễ để thấy hiệu ứng loading
//   };

//   // Cập nhật danh sách sản phẩm khi thay đổi tìm kiếm hoặc bộ lọc
//   useEffect(() => {
//     filterProducts();
//   }, [searchTerm, selectedCategory, selectedBrand]);

//   // Xử lý tìm kiếm
//   const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchTerm(e.target.value);
//   };

//   return (
//     <div className={styles.productsPage}>
//       {/* Thông báo Toastify */}
//       <ToastContainer position="top-right" autoClose={2000} />

//       {/* Header */}
//       <header className={styles.header}>
//         <h1>Danh sách sản phẩm</h1>
//       </header>

//       {/* Bộ lọc và tìm kiếm */}
//       <div className={styles.filters}>
//         <div className={styles.searchBar}>
//           <input
//             type="text"
//             value={searchTerm}
//             onChange={handleSearch}
//             placeholder="Tìm kiếm sản phẩm..."
//             className={styles.searchInput}
//             aria-label="Tìm kiếm sản phẩm"
//           />
//         </div>

//         <div className={styles.filterGroup}>
//           <div className={styles.filter}>
//             <label htmlFor="category">Danh mục:</label>
//             <select
//               id="category"
//               value={selectedCategory}
//               onChange={(e) => setSelectedCategory(e.target.value)}
//               className={styles.filterSelect}
//             >
//               {categories.map((category) => (
//                 <option key={category} value={category}>
//                   {category === "all" ? "- Tất cả -" : category}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className={styles.filter}>
//             <label htmlFor="brand">Thương hiệu:</label>
//             <select
//               id="brand"
//               value={selectedBrand}
//               onChange={(e) => setSelectedBrand(e.target.value)}
//               className={styles.filterSelect}
//             >
//               {brands.map((brand) => (
//                 <option key={brand} value={brand}>
//                   {brand === "all" ? "- Tất cả -" : brand}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* Trạng thái loading */}
//       {isLoading && (
//         <div className={styles.loading}>
//           <p>Đang tải sản phẩm...</p>
//         </div>
//       )}

//       {/* Danh sách sản phẩm */}
//       {!isLoading && products.length === 0 ? (
//         <div className={styles.empty}>
//           <p>Không tìm thấy sản phẩm nào.</p>
//         </div>
//       ) : (
//         <div className={styles.productsGrid}>
//           {products.map((product) => (
//             <ProductCard
//               key={product.slug}
//               name={product.name}
//               price={product.price}
//               originalPrice={product.originalPrice}
//               discount={product.discount}
//               image={product.image}
//               brand={product.brand}
//             //   screenType={product.screenType}
//             //   screenSize={product.screenSize}
//             //   storageOptions={product.storageOptions}
//               rating={product.rating}
//               sold={product.sold}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// const ProductsPage: React.FC = () => {
//     const [products, setProducts] = useState<Product[]>([]);
//     const [categories, setCategories] = useState<string[]>(["all"]);
//     const [brands, setBrands] = useState<string[]>(["all"]);
//     const [searchTerm, setSearchTerm] = useState("");
//     const [selectedCategory, setSelectedCategory] = useState("all");
//     const [selectedBrand, setSelectedBrand] = useState("all");
//     const [isLoading, setIsLoading] = useState(true);
  
//     const fetchCategories = async () => {
//         const res = await api.get("/category");
//         return res.data;
//     }

//     // Load danh mục và thương hiệu một lần
//     useEffect(() => {
//       const loadMeta = async () => {
//         try {
//           const [catData, brandData] = await Promise.all([
//             fetchCategories(),
//             fetchBrands(),
//           ]);
//           setCategories(["all", ...catData]);
//           setBrands(["all", ...brandData]);
//         } catch (err) {
//           console.error("Lỗi tải danh mục hoặc thương hiệu:", err);
//         }
//       };
  
//       loadMeta();
//     }, []);
  
//     // Load sản phẩm mỗi khi filter hoặc search thay đổi
//     useEffect(() => {
//       const loadProducts = async () => {
//         setIsLoading(true);
//         try {
//           const params: any = {};
  
//           if (searchTerm) params.search = searchTerm;
//           if (selectedCategory !== "all") params.category = selectedCategory;
//           if (selectedBrand !== "all") params.brand = selectedBrand;
  
//           const data = await fetchProducts(params);
//           setProducts(data);
//         } catch (err) {
//           console.error("Lỗi tải sản phẩm:", err);
//         } finally {
//           setIsLoading(false);
//         }
//       };
  
//       loadProducts();
//     }, [searchTerm, selectedCategory, selectedBrand]);
  
//     return (
//       <div className={styles.productsPage}>
//         <ToastContainer position="top-right" autoClose={2000} />
  
//         <header className={styles.header}>
//           <h1>Danh sách sản phẩm</h1>
//         </header>
  
//         <div className={styles.filters}>
//           <input
//             type="text"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             placeholder="Tìm kiếm sản phẩm..."
//             className={styles.searchInput}
//           />
  
//           <div className={styles.filterGroup}>
//             <div className={styles.filter}>
//               <label>Danh mục:</label>
//               <select
//                 value={selectedCategory}
//                 onChange={(e) => setSelectedCategory(e.target.value)}
//               >
//                 {categories.map((cat) => (
//                   <option key={cat} value={cat}>
//                     {cat === "all" ? "- Tất cả -" : cat}
//                   </option>
//                 ))}
//               </select>
//             </div>
  
//             <div className={styles.filter}>
//               <label>Thương hiệu:</label>
//               <select
//                 value={selectedBrand}
//                 onChange={(e) => setSelectedBrand(e.target.value)}
//               >
//                 {brands.map((brand) => (
//                   <option key={brand} value={brand}>
//                     {brand === "all" ? "- Tất cả -" : brand}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>
//         </div>
  
//         {isLoading ? (
//           <p className={styles.loading}>Đang tải sản phẩm...</p>
//         ) : products.length === 0 ? (
//           <p className={styles.empty}>Không tìm thấy sản phẩm nào.</p>
//         ) : (
//           <div className={styles.productsGrid}>
//             {products.map((product) => (
//               <ProductCard key={product.slug} {...product} />
//             ))}
//           </div>
//         )}
//       </div>
//     );
// };

const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  // State UI
  const [products, setProducts] = useState({content: [], totalPages: 0, number: 0});
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesSlug, setCategoriesSlug] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState(0);

  // Lấy giá trị filter từ URL
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "all";
  const brand = searchParams.get("brand") || "all";
  const minPrice = searchParams.get("minPrice") || "all";
  const maxPrice = searchParams.get("maxPrice") || "all";
  const priceRanges = [
      { label: "- Tất cả -", minPrice: "", maxPrice: "" },
      { label: "1 triệu", minPrice: "1000000", maxPrice: "1000000" },
      { label: "2 triệu", minPrice: "2000000", maxPrice: "2000000" },
      { label: "5 triệu", minPrice: "5000000", maxPrice: "5000000" },
      { label: "10 triệu", minPrice: "10000000", maxPrice: "10000000" },
      { label: "20 triệu", minPrice: "20000000", maxPrice: "20000000" },
  ];

  useEffect(() => {
      const fetchFilters = async () => {
          try {
              const [resCategories, resBrands] = await Promise.all([
                  api.get("/category/all").catch(console.log),
                  api.get("/product/brands")
              ]);
              setCategories(["all", ...resCategories.data]); 
              setCategoriesSlug(["all", ...resCategories.data.map((c: Category) => c.slug)]);
              console.log(resCategories.data);
              setBrands(["all", ...resBrands.data]);
          } catch (err) {
              console.error("Lỗi khi tải filters:", err);
          }
      };
      fetchFilters();
  }, []);

  // Load danh mục và thương hiệu khi mở trang
  useEffect(() => {
      const fetchProducts = async () => {
          setIsLoading(true);
          try {
            const res = await api.get("/product/all-products", {
              params: {
                search: search || undefined,
                category: category !== "all" ? category : undefined,
                brand: brand !== "all" ? brand : undefined,
                minPrice: minPrice !== "all" ? minPrice : undefined,
                maxPrice: maxPrice !== "all" ? maxPrice : undefined,
                page: currentPage,
                size: 12
              },
            });
            setProducts(res.data); // res.data là List<ProductResponse>
          } catch (error) {
            console.error("Lỗi khi gọi API sản phẩm:", error);
          } finally {
            setIsLoading(false);
          }
        };
      fetchProducts();
  }, [search, category, brand, minPrice, maxPrice, currentPage]);
  
  // useEffect(() => {
  //     const fetchProducts = async () => {
  //         setIsLoading(true);
  //         try {
  //             const res = await api.get("/product", {
  //             params: {
  //                 search: search || undefined,
  //                 category: category !== "all" ? category : undefined,
  //                 brand: brand !== "all" ? brand : undefined
  //             }
  //             });
  //             setProducts(res.data);
  //         } catch (err) {
  //             console.error("Lỗi tải sản phẩm:", err);
  //         } finally {
  //             setIsLoading(false);
  //         }
  //     };
  
  //     fetchProducts();
  // }, [search, category, brand]);

  // Cập nhật URL khi user tương tác
  const updateParam = (key: string, value: string) => {
      const params = new URLSearchParams(searchParams);
      if (value === "all" || value === "") {
          params.delete(key);
      } else {
          params.set(key, value);
      }
      setSearchParams(params);
  };

  return (
      <div className={styles.productsPage}>
        <ToastContainer position="top-right" autoClose={2000} />
        <header className={styles.header}>
          <h1>Danh sách sản phẩm</h1>
        </header>
  
        {/* Bộ lọc và tìm kiếm */}
        <div className={styles.filters}>
          <div className={styles.searchBar}>
            <input
              type="text"
              value={search}
              onChange={(e) => updateParam("search", e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              className={styles.searchInput}
              aria-label="Tìm kiếm sản phẩm"
            />
          </div>
  
          <div className={styles.filterGroup}>
            <div className={styles.filter}>
              <label>Danh mục:</label>
              <select
                value={category}
                onChange={(e) => updateParam("category", e.target.value)}
                className={styles.filterSelect}
              >
                {categoriesSlug.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "all" ? "- Tất cả -" : categories.find(c => c.slug === cat)?.name}
                  </option>
                ))}
              </select>
            </div>
  
            <div className={styles.filter}>
              <label>Thương hiệu:</label>
              <select
                value={brand}
                onChange={(e) => updateParam("brand", e.target.value)}
                className={styles.filterSelect}
              >
                {brands.map((b) => (
                  <option key={b} value={b}>
                    {b === "all" ? "- Tất cả -" : b}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filter}>
              <label>Giá từ:</label>
              <select
                  value={minPrice}
                  className={styles.filterSelect}
                  onChange={(e) => updateParam("minPrice", e.target.value)}
              >
                  {priceRanges.map((range, index) => (
                      <option key={index} value={range.minPrice}>
                          {range.label}
                      </option>
                  ))}
              </select>
            </div>

            <div className={styles.filter}>
              <label>Đến:</label>
              <select
                  value={maxPrice}
                  className={styles.filterSelect}
                  onChange={(e) => updateParam("maxPrice", e.target.value)}
              >
                  {priceRanges.map((range, index) => (
                      <option key={index} value={range.maxPrice}>
                          {range.label}
                      </option>
                  ))}
              </select>
            </div>

            
          </div>
        </div>    
        {/* Loading & sản phẩm */}
        {isLoading ? (
          <div className={styles.loading}><p>Đang tải sản phẩm...</p></div>
        ) : products.content.length === 0 ? (
          <div className={styles.empty}><p>Không tìm thấy sản phẩm nào.</p></div>
        ) : (
          <div className={styles.productsGrid}>
            {products.content.map((p) => (
              <ProductCard key={p.slug} {...p} />
            ))}
          </div>
        )}

        <div className="pagination">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
            disabled={currentPage === 0}
          >
            Trang trước
          </button>
          {Array.from({ length: products.totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              className={currentPage === i ? "active" : ""}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, products.totalPages - 1))
            }
            disabled={currentPage === products.totalPages - 1}
          >
            Trang sau
          </button>
        </div>
      </div>
    );
};

export default ProductsPage;