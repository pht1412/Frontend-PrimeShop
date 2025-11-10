import React, { useEffect, useState } from 'react';
import api from '../../api/api';
import './delivery.css'; // Import css file cùng folder
import UpdateStatusModal from './UpdateStatusModal';
import TrackingHistoryModal from './TrackingHistoryModal';
import { Button } from '@mui/material';

interface Order {
  id: number;
  orderId: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  orderStatus: string;
  estimatedDeliveryDate?: string;
}

const DeliveryDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.post('/admin/order/filter', {
        status: [
          'READY_TO_SHIP',
          'PROCESSING',
          'INVENTORY',
          'SHIPPING',
          'SHIPPED',
          'DELIVERED',
          'RETURNED',
          'REFUNDED',
          'FAILED_DELIVERY',
          'CANCELLED',
        ],
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Lỗi lấy danh sách đơn hàng:', error);
    }
  };

  const handleUpdateStatus = (order: Order) => {
    setSelectedOrder(order);
    setShowUpdateModal(true);
  };

  const handleShowTracking = (order: Order) => {
    setSelectedOrder(order);
    setShowTrackingModal(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="delivery-dashboard-container">
      <h2 className="delivery-title">Quản lý vận chuyển đơn hàng</h2>

      <table className="delivery-table">
        <thead>
          <tr>
            <th>Mã đơn</th>
            <th>Khách hàng</th>
            <th>Số điện thoại</th>
            <th>Địa chỉ</th>
            <th>Trạng thái</th>
            <th>Ngày giao dự kiến</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan={7} className="no-orders">
                Không có đơn hàng vận chuyển nào
              </td>
            </tr>
          ) : (
            orders.map(order => (
              <tr key={order.id}>
                <td>{order.orderId || order.id}</td>
                <td>{order.fullName}</td>
                <td>{order.phoneNumber}</td>
                <td>{order.address}</td>
                <td>
                  <span className={`status-badge status-${order.orderStatus.toLowerCase()}`}>
                    {order.orderStatus}
                  </span>
                </td>
                <td>{formatDate(order.estimatedDeliveryDate)}</td>
                <td>
                  <Button onClick={() => handleUpdateStatus(order)}>Cập nhật trạng thái</Button>
                  <Button onClick={() => handleShowTracking(order)}>Xem tracking</Button>

                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Modal cập nhật trạng thái */}
      {showUpdateModal && selectedOrder && (
        <UpdateStatusModal 
          order={selectedOrder} 
          open={showUpdateModal} 
          onClose={() => setShowUpdateModal(false)} 
          onSuccess={() => {
            setShowUpdateModal(false);
            fetchOrders();
          }}
        />
      )}

      {/* Modal lịch sử tracking */}
      {showTrackingModal && selectedOrder && (
        <TrackingHistoryModal 
          orderId={selectedOrder?.orderId || null} 
          open={showTrackingModal} 
          onClose={() => setShowTrackingModal(false)} 
        />
      )}
    </div>
  );
};

export default DeliveryDashboard;
