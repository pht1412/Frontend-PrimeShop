// =========================
// 🎯 MOCK DATA
// =========================

export const mockCategories = [
  { name: "Điện thoại", slug: "dien-thoai" },
  { name: "Laptop", slug: "laptop" },
  { name: "Tai nghe", slug: "tai-nghe" },
  { name: "Tablet", slug: "tablet" },
];

export const mockBrands = ["Apple", "Samsung", "Xiaomi", "Sony", "Dell"];

// 40 sản phẩm FE tự tạo
export const mockProducts = Array.from({ length: 80 }).map((_, i) => ({
  id: i + 1,
  name: `Sản phẩm ${i + 1}`,
  slug: `san-pham-${i + 1}`,
  price: 1000000 + Math.floor(Math.random() * 20000000),
  brand: mockBrands[Math.floor(Math.random() * mockBrands.length)],
  category: mockCategories[Math.floor(Math.random() * mockCategories.length)].slug,
  image: "https://via.placeholder.com/250",
  rating: (Math.random() * 5).toFixed(1),
  sold: Math.floor(Math.random() * 5000),
}));

// =========================
// 🎯 MOCK API HANDLER
// =========================

export const mockApi = {
  get: async (url, { params } = {}) => {
    await new Promise((res) => setTimeout(res, 300)); // giả delay API

    if (url === "/category/all") {
      return { data: mockCategories };
    }

    if (url === "/product/brands") {
      return { data: mockBrands };
    }

    if (url === "/product/all-products") {
      let filtered = [...mockProducts];

      // SEARCH
      if (params?.search) {
        filtered = filtered.filter((p) =>
          p.name.toLowerCase().includes(params.search.toLowerCase())
        );
      }

      // CATEGORY
      if (params?.category) {
        filtered = filtered.filter((p) => p.category === params.category);
      }

      // BRAND
      if (params?.brand) {
        filtered = filtered.filter((p) => p.brand === params.brand);
      }

      // PRICE
      if (params?.minPrice) {
        filtered = filtered.filter((p) => p.price >= Number(params.minPrice));
      }

      if (params?.maxPrice) {
        filtered = filtered.filter((p) => p.price <= Number(params.maxPrice));
      }

      const page = params.page || 0;
      const size = params.size || 12;

      const start = page * size;
      const end = start + size;

      const pageData = filtered.slice(start, end);

      return {
        data: {
          content: pageData,
          totalPages: Math.ceil(filtered.length / size),
          number: page,
        },
      };
    }

    return { data: [] };
  },
};
