import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  LocalShipping as LocalShippingIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationOnIcon,
  Storage as StorageIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import api from '../../api/api';
import './delivery.css';

interface TrackingEvent {
  id: number;
  status: string;
  location: string;
  timestamp: string; // ISO string
}

interface TrackingHistoryModalProps {
  orderId: string | null;  // mã đơn hàng dạng string
  open: boolean;
  onClose: () => void;
}

const TrackingHistoryModal: React.FC<TrackingHistoryModalProps> = ({
  orderId,
  open,
  onClose
}) => {
  const [trackingHistory, setTrackingHistory] = useState<TrackingEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && orderId) {
      fetchTrackingHistory();
    } else {
      setTrackingHistory([]);
      setError(null);
    }
  }, [open, orderId]);

  const fetchTrackingHistory = async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/delivery/orders/${orderId}/tracking`);
      console.log('Tracking data received:', response.data);

      if (Array.isArray(response.data)) {
        setTrackingHistory(response.data);
      } else {
        setTrackingHistory([]);
        setError('Dữ liệu lịch sử tracking không hợp lệ');
      }
    } catch (err) {
      console.error('Lỗi lấy lịch sử tracking:', err);
      setError('Không thể tải lịch sử vận chuyển');
      setTrackingHistory([]);
    } finally {
      setLoading(false);
    }
  };

  // Lấy màu cho status (chú ý các màu phải là keys có trong palette MUI)
  const getColorByStatus = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'grey';
      case 'CONFIRMED':
        return 'info';
      case 'PAID':
        return 'primary';
      case 'PROCESSING':
        return 'warning';
      case 'INVENTORY':
        return 'secondary';
      case 'READY_TO_SHIP':
        return 'warning';
      case 'SHIPPING':
        return 'info';
      case 'DELIVERED':
        return 'success';
      case 'FAILED_DELIVERY':
        return 'error';
      default:
        return 'grey';
    }
  };

  const getLabelByStatus = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Chờ xử lý';
      case 'CONFIRMED':
        return 'Đã xác nhận';
      case 'PAID':
        return 'Đã thanh toán';
      case 'PROCESSING':
        return 'Đang xử lý';
      case 'INVENTORY':
        return 'Tồn kho';
      case 'READY_TO_SHIP':
        return 'Chờ giao';
      case 'SHIPPING':
        return 'Đang giao';
      case 'DELIVERED':
        return 'Đã giao';
      case 'FAILED_DELIVERY':
        return 'Giao thất bại';
      default:
        return status;
    }
  };

  const getIconByStatus = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <ScheduleIcon />;
      case 'CONFIRMED':
        return <CheckIcon />;
      case 'PAID':
        return <CheckIcon />;
      case 'PROCESSING':
        return <CircularProgress size={20} color="warning" />;
      case 'INVENTORY':
        return <StorageIcon />;
      case 'READY_TO_SHIP':
        return <ScheduleIcon />;
      case 'SHIPPING':
        return <LocalShippingIcon />;
      case 'DELIVERED':
        return <CheckCircleIcon />;
      case 'FAILED_DELIVERY':
        return <ErrorIcon />;
      default:
        return <LocationOnIcon />;
    }
  };

  const formatDateTime = (timestamp: string) => {
    const dateObj = new Date(timestamp);
    return {
      date: dateObj.toLocaleDateString('vi-VN'),
      time: dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      className="delivery-dialog"
    >
      <DialogTitle className="delivery-dialog-title">
        <Box display="flex" alignItems="center" gap={1}>
          <LocationOnIcon color="primary" />
          Lịch sử vận chuyển đơn hàng #{orderId}
        </Box>
      </DialogTitle>

      <DialogContent
        dividers
        className="delivery-dialog-content"
        style={{ minHeight: 300, maxHeight: '70vh' }}
      >
        {loading && (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && trackingHistory.length === 0 && (
          <Paper className="delivery-no-tracking" elevation={0}>
            <Typography variant="body1" color="textSecondary">
              Chưa có lịch sử vận chuyển cho đơn hàng này
            </Typography>
          </Paper>
        )}

        {!loading && !error && trackingHistory.length > 0 && (
          <List className="delivery-tracking-list">
            {trackingHistory.map((event, idx) => {
              // Tránh lỗi khi event thiếu thông tin cần thiết
              if (!event || !event.status || !event.timestamp) return null;

              const { date, time } = formatDateTime(event.timestamp);
              const colorKey = getColorByStatus(event.status);

              return (
                <React.Fragment key={event.id}>
                  <ListItem alignItems="flex-start" className="delivery-tracking-item">
                    <ListItemIcon>
                      <Box
                        className="status-icon"
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          backgroundColor: (theme) => {
                            const paletteEntry = theme.palette[colorKey];
                            if (typeof paletteEntry === 'string') {
                              return paletteEntry;
                            }
                            return paletteEntry?.main ?? theme.palette.grey[500];
                          },
                          color: '#fff',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          boxShadow: (theme) =>
                            `0 0 8px ${
                              (typeof theme.palette[colorKey] === 'string'
                                ? theme.palette[colorKey]
                                : theme.palette[colorKey]?.main) || theme.palette.grey[500]
                            }66`
                        }}
                      >
                        {getIconByStatus(event.status)}
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                          <Chip
                            label={getLabelByStatus(event.status)}
                            color={colorKey as
                              | 'default'
                              | 'primary'
                              | 'secondary'
                              | 'error'
                              | 'info'
                              | 'success'
                              | 'warning'}
                            size="small"
                          />
                          <Typography variant="caption" color="textSecondary">
                            {date} lúc {time}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" color="textSecondary">
                          {event.location || '-'}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {idx < trackingHistory.length - 1 && <Divider component="li" />}
                </React.Fragment>
              );
            })}
          </List>
        )}
      </DialogContent>

      <DialogActions className="delivery-dialog-actions">
        <Button onClick={onClose} className="btn-close">
          Đóng
        </Button>
        {trackingHistory.length > 0 && (
          <Button onClick={fetchTrackingHistory} disabled={loading} className="btn-refresh">
            Làm mới
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default TrackingHistoryModal;
