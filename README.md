
🎨 PrimeShop - Frontend (React + Vite)
📝 Giới thiệu
Đây là mã nguồn Frontend của hệ thống thương mại điện tử PrimeShop. Giao diện được thiết kế với mục tiêu tối ưu hóa trải nghiệm mua sắm, tốc độ phản hồi nhanh và tương thích tốt trên nhiều thiết bị.
Dự án kết nối trực tiếp với PrimeShop Backend API để xử lý dữ liệu thực tế.

✨ Tính năng giao diện nổi bật
[x] Responsive Design: Giao diện hiển thị tốt trên cả Desktop và Mobile.
[x] Smart Search & Filter: Tìm kiếm sản phẩm thông minh và lọc theo danh mục, mức giá.
[x] Shopping Cart: Luồng thêm/xóa/cập nhật giỏ hàng mượt mà bằng State Management.
[x] Checkout Integration: Tích hợp giao diện thanh toán cổng VNPay và MoMo.
[x] Admin Dashboard: Trang quản trị trực quan dành cho việc quản lý đơn hàng và sản phẩm.

💻 Công nghệ sử dụng
Library: ReactJS (Hooks)
Build Tool: Vite (Tối ưu tốc độ phát triển)
Styling: Tailwind CSS (Layout nhanh) & Material UI (Component chuyên nghiệp)
API Client: Axios (Xử lý HTTP Requests)
Icons: FontAwesome / Lucide React

🛠 Hướng dẫn cài đặt (Setup)
1. Cài đặt môi trường
Đảm bảo máy đã cài Node.js (Phiên bản 16.x trở lên).
2. Cài đặt thư viện
# Di chuyển vào thư mục dự án
cd Frontend-PrimeShop
# Cài đặt các dependencies
npm install
3. Cấu hình API
Mở file .env hoặc cấu hình trong mã nguồn để trỏ đến URL của Backend:
VITE_API_URL=http://localhost:8080/api
4. Khởi chạy dự án
npm run dev
📁 Cấu trúc thư mục 
Tôi thiết kế cấu trúc thư mục nhằm đảm bảo dự án không bị "phình" và dễ dàng cho việc Teamwork:
src/components/: Chứa các thành phần giao diện dùng chung (Button, Card, Navbar).
src/pages/: Các trang chính của hệ thống (Home, ProductDetail, Cart, Checkout).
src/services/: Quản lý các hàm gọi API sang Backend.
src/routes/: Quản lý điều hướng đúng với các quyền trong hệ thống
src/assets/: Chứa hình ảnh, icons và các file css toàn cục.
src/layouts/: Chứa các bố cục riêng biệt đành cho quyền đang sở hữu
src/assets/css/: Chứa đầy đủ thiết kế và trang trí của hệ thống.
src/types/: Dùng để định nghĩa kiểu dữ liệu (TypeScript types/interfaces) dùng chung cho toàn project.
