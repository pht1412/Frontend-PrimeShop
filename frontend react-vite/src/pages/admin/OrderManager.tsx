import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import "../../assets/css/admin.css";
import api from "../../api/api";
import { Order } from "../../types/order";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Select,
  MenuItem,
  Button
} from "@mui/material";
import Swal from "sweetalert2";
import dayjs from "dayjs";

const OrderManager = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [filters, setFilters] = useState({
    orderId: "",
    status: "all",
    search: "",
    startDate: "",
    endDate: ""
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [orderDetails, setOrderDetails] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    try {
      const response = await api.get("/order/all-orders", {
        params: {
          orderId: filters.orderId || undefined,
          status: filters.status !== "all" ? filters.status : undefined,
          search: filters.search || undefined,
          startDate: filters.startDate ? dayjs(filters.startDate).format("YYYY-MM-DDTHH:mm:ss") : undefined,
          endDate: filters.endDate ? dayjs(filters.endDate).format("YYYY-MM-DDTHH:mm:ss") : undefined
        }
      });
      setOrders(response.data);
      setFilteredOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Không thể tải danh sách đơn hàng",
        confirmButtonText: "OK"
      });
    }
  };

  const showDetails = (order: Order) => {
  Swal.fire({
    title: `Chi tiết đơn hàng #${order.orderId}`,
    html: `
      <p><strong>Người nhận:</strong> ${order.fullName}</p>
      <p><strong>Số điện thoại:</strong> ${order.phoneNumber}</p>
      <p><strong>Địa chỉ:</strong> ${order.address}</p>
      <p><strong>Ghi chú:</strong> ${order.note || "Không có"}</p>
      <p><strong>Ngày đặt:</strong> ${order.createdAt.split("T")[0]}</p>
      <p><strong>Tổng tiền:</strong> ${order.totalAmount.toLocaleString("vi-VN", {style:"currency", currency:"VND"})}</p>
      <p><strong>Sản phẩm:</strong></p>
      <ul>
        ${order.items && order.items.length > 0
          ? order.items.map(item => 
              `<li>${item.productName} - Số lượng: ${item.quantity}</li>`
            ).join("")
          : "<li>Không có sản phẩm</li>"
        }
      </ul>
    `,
    confirmButtonText: "Đóng"
  });
};


  const handleApprove = async (orderId: string) => {
    try {
      await api.put(`/admin/order/update-status?id=${orderId}&status=CONFIRMED`);
      await Swal.fire("Thành công", "Đã duyệt đơn hàng", "success");
      fetchOrders();
    } catch (error) {
      console.error("Error approving order:", error);
      Swal.fire("Lỗi", "Không thể duyệt đơn hàng", "error");
    }
  };

  const handleDelivery = async (orderId: string) => {
  try {
    await api.put(`/admin/order/update-status?id=${orderId}&status=PROCESSING`);

    await Swal.fire({
      title: "Thành công",
      text: "Đã chuyển đơn hàng sang đơn vị vận chuyển",
      icon: "success",
      confirmButtonText: "OK"
    });
    
    // Không điều hướng nữa, chỉ làm mới danh sách đơn
    fetchOrders();
  } catch (error) {
    console.error("Error delivering order:", error);
    Swal.fire("Lỗi", "Không thể chuyển đơn hàng sang vận chuyển", "error");
  }
};


  const handleDeliverySuccess = async (orderId: string) => {
    try {
      await api.put(`/admin/order/update-status?id=${orderId}&status=DELIVERED`);
      Swal.fire("Thành công", "Cập nhật trạng thái giao hàng thành công", "success");
      fetchOrders();
    } catch (error) {
      console.error("Error updating delivery:", error);
      Swal.fire("Lỗi", "Không thể cập nhật trạng thái giao hàng", "error");
    }
  };

  const handleDelete = async (orderId: string) => {
    try {
      await api.delete(`/admin/order/delete?id=${orderId}&status=DELETED`);
      Swal.fire("Thành công", "Đã xóa đơn hàng", "success");
      fetchOrders();
    } catch (error) {
      console.error("Error deleting order:", error);
      Swal.fire("Lỗi", "Không thể xóa đơn hàng", "error");
    }
  };

  const handleFilterChange = (field: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      <h1>Quản lý đơn hàng</h1>

      <form className="flex flex-wrap gap-4 mb-4">
        <Select
          label="Trạng thái"
          value={filters.status}
          onChange={e => handleFilterChange("status", e.target.value)}
          style={{ minWidth: 150 }}
        >
          <MenuItem value="all">Tất cả</MenuItem>
          <MenuItem value="PENDING">Chờ xác nhận</MenuItem>
          <MenuItem value="CONFIRMED">Đã xác nhận</MenuItem>
          <MenuItem value="PAID">Đã thanh toán</MenuItem>
          <MenuItem value="PROCESSING">Đang xử lý</MenuItem>
          <MenuItem value="SHIPPED">Đang giao</MenuItem>
          <MenuItem value="DELIVERED">Hoàn thành</MenuItem>
          <MenuItem value="CANCELLED">Đã hủy</MenuItem>
        </Select>

        <TextField
          label="Mã đơn"
          type="number"
          value={filters.orderId}
          onChange={e => handleFilterChange("orderId", e.target.value)}
        />

        <TextField
          label="Ngày bắt đầu"
          type="date"
          value={filters.startDate}
          onChange={e => handleFilterChange("startDate", e.target.value)}
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          label="Ngày kết thúc"
          type="date"
          value={filters.endDate}
          onChange={e => handleFilterChange("endDate", e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      </form>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mã đơn</TableCell>
              <TableCell>Loại đơn</TableCell>
              <TableCell>Khách hàng</TableCell>
              <TableCell>Tổng tiền</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Ngày đặt</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow><TableCell colSpan={7} align="center">Không có đơn hàng</TableCell></TableRow>
            ) : (
              orders.map(order => (
                <TableRow key={order.orderId}>
                  <TableCell>{order.orderId}</TableCell>
                  <TableCell>{order.admin ? "Offline" : "Online"}</TableCell>
                  <TableCell>{order.fullName}</TableCell>
                  <TableCell>{order.totalAmount.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</TableCell>
                  <TableCell>{order.orderStatus}</TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString("vi-VN")}</TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => showDetails(order)}>Chi tiết</Button>
                    {order.orderStatus === "PENDING" && (
                      <Button size="small" color="primary" onClick={() => handleApprove(order.orderId)}>Duyệt</Button>
                    )}
                    {order.orderStatus === "PAID" && (
                      <Button size="small" color="secondary" onClick={() => handleDelivery(order.orderId)}>Chuyển vận chuyển</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default OrderManager;
