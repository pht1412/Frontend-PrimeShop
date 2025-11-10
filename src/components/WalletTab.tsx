// src/components/WalletTab.tsx
import React, { useState, useEffect, useCallback } from 'react';
import * as walletApi from '../api/wallet.api';
// <-- SỬA LỖI 1: Import đúng tên interface đã thống nhất
import { IWalletBalance, ITransaction, IQrResponse } from '../api/wallet.api'; 
import Swal from 'sweetalert2';
import { Button } from '@mui/material';
import '../assets/css/account.css'; // Chúng ta sẽ dùng file này sau
import { User } from '../types/user';

// --- (Định nghĩa Props) ---
interface WalletTabProps {
 user: User | null;
}

// --- (Hàm formatCurrency - Giữ nguyên) ---
const formatCurrency = (amount: number | null | undefined): string => {
 if (amount === undefined || amount === null) return '0 ₫';
 return amount.toLocaleString('vi-VN', {
  style: 'currency',
  currency: 'VND'
 });
};

// --- (Component chính) ---
const WalletTab: React.FC<WalletTabProps> = ({ user }) => {
 // --- (State) ---
 const [balance, setBalance] = useState<number>(0);
 const [points, setPoints] = useState<number>(0);
 const [isActive, setIsActive] = useState<boolean>(false);
 const [isLoading, setIsLoading] = useState<boolean>(true); 

 const [transactions, setTransactions] = useState<ITransaction[]>([]); // <-- SỬA LỖI 1
 const [txLoading, setTxLoading] = useState<boolean>(false);
 const [showTxHistory, setShowTxHistory] = useState<boolean>(false);

 // --- (Hàm gọi API) ---
 
 const fetchWalletData = useCallback(async (userId: number) => {
  setIsLoading(true);
  try {
   const response = await walletApi.getBalance(userId);
      // <-- SỬA LỖI 1: Dùng đúng kiểu IWalletBalance
   const data: IWalletBalance = response.data; 

      // <-- SỬA LỖI 2: Dùng đúng trường 'walletActive' từ API
   if (data.walletActive) { 
    setBalance(data.balance);
    setPoints(data.points || 0); 
    setIsActive(true); // Ví đã kích hoạt
   } else {
    setIsActive(false); // Ví chưa kích hoạt
   }
  } catch (error) {
   console.error("Error fetching balance:", error);
   setIsActive(false); // Mặc định là chưa kích hoạt nếu có lỗi
  } finally {
   setIsLoading(false);
  }
 }, []); 

 // --- (Effects) ---
 useEffect(() => {
  if (user && user.id) {
   fetchWalletData(Number(user.id));
  } else {
   setIsLoading(true);
  }
 }, [user, fetchWalletData]); 

 // --- (Hàm xử lý sự kiện) ---

 // Kích hoạt ví (Đã đúng logic)
 const handleActivate = async () => {
  if (!user) return;
  setIsLoading(true); // Thêm loading
  try {
   await walletApi.activateWallet(Number(user.id));
   await Swal.fire({
    title: 'Thành công!',
    text: 'Ví Prime của bạn đã được kích hoạt.',
    icon: 'success',
    confirmButtonText: 'Tuyệt vời'
   });
   // Tải lại dữ liệu ví sau khi kích hoạt thành công
   fetchWalletData(Number(user.id));
  } catch (error) {
   console.error("Error activating wallet:", error);
   Swal.fire('Lỗi', 'Không thể kích hoạt ví. Vui lòng thử lại.', 'error');
   setIsLoading(false); // Tắt loading nếu lỗi
  }
 };

 // Hiển thị Popup QR (Đã sửa)
 const showQrPopup = (qrCodeBase64: string) => {
  let timerInterval: number;
  Swal.fire({
   title: 'Quét mã QR để nạp tiền',
   html: `
    <div class="qr-code-container"> 
      <img src="data:image/png;base64,${qrCodeBase64}" alt="Mã QR nạp tiền" style="width: 250px; height: 250px;" />
    </div>
    <p style="margin-top: 15px; color: red;">
      Mã sẽ hết hạn sau <b>10</b> giây
    </p>
   `,
   showConfirmButton: false,
   timer: 10000, // Yêu cầu 10 giây
   timerProgressBar: true,
   didOpen: () => {
    const timerElement = Swal.getHtmlContainer()?.querySelector('b');
    if (timerElement) {
     timerInterval = setInterval(() => {
      const timeLeft = Math.ceil((Swal.getTimerLeft() || 0) / 1000);
      timerElement.textContent = timeLeft.toString();
     }, 1000);
    }
   },
   willClose: () => {
    clearInterval(timerInterval);
   }
  });
 };

 // Xử lý Nạp tiền (Đã sửa)
 const handleDeposit = async () => {
  if (!user) return;
  const { value: amountStr } = await Swal.fire<string>({
   title: 'Nạp tiền vào Ví Prime',
   input: 'number',
   inputLabel: 'Nhập số tiền bạn muốn nạp',
   inputPlaceholder: 'Ví dụ: 500000',
   inputAttributes: { min: '10000', step: '1000' },
   showCancelButton: true,
   confirmButtonText: 'Tạo mã QR',
   cancelButtonText: 'Hủy',
   inputValidator: (value) => {
    if (!value || parseInt(value, 10) < 10000) {
     return 'Số tiền nạp tối thiểu là 10.000 ₫';
    }
    return null;
   }
  });

  if (amountStr) {
   try {
    const amount = parseInt(amountStr, 10);
    const response = await walletApi.generateDepositQr(Number(user.id), amount);
        const qrData: IQrResponse = response.data;
        // <-- SỬA LỖI 3: Dùng đúng trường 'qrCode' từ API
    showQrPopup(qrData.qrCode); 
   } catch (error) {
    console.error("Error generating deposit QR:", error);
    Swal.fire('Lỗi', 'Không thể tạo mã QR. Vui lòng thử lại.', 'error');
   }
  }
 };

 // Tải và hiển thị Lịch sử giao dịch (Đã đúng logic)
 const handleToggleTxHistory = async () => {
  if (!user) return;
  if (showTxHistory) {
   setShowTxHistory(false);
   return;
  }
  setShowTxHistory(true);
  
  if (transactions.length === 0) { // Chỉ tải nếu chưa tải
   setTxLoading(true);
   try {
    const response = await walletApi.getTransactions(Number(user.id));
    setTransactions(response.data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
   } catch (error) {
    console.error("Error fetching transactions:", error);
    Swal.fire('Lỗi', 'Không thể tải lịch sử giao dịch.', 'error');
    setShowTxHistory(false);
   } finally {
    setTxLoading(false);
   }
  }
 };

 // Format ngày tháng (Đã đúng)
 const formatTxDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN')}`;
 };

 // --- (Render) ---

 // 1. Trạng thái Loading
 if (isLoading) {
  return <div className="wallet-loading">Đang tải dữ liệu Ví Prime...</div>;
 }


 // 2. Trạng thái Chưa kích hoạt
 // Logic này BÂY GIỜ ĐÃ ĐÚNG do 'fetchWalletData' đã được sửa
 if (!isActive) {
  return (
   <div className="activate-wallet-container">
    <h3>Kích hoạt Ví Prime</h3>
    <p>Bạn chưa kích hoạt Ví Prime. Hãy kích hoạt để nhận ưu đãi và thanh toán tiện lợi!</p>
    <Button variant="contained" color="primary" onClick={handleActivate}>
      Kích hoạt ngay
    </Button>
  </div>
 );
 }
 // 3. Trạng thái Đã kích hoạt (Giao diện chính)
 return (
   <div className="wallet-dashboard">
   <div className="wallet-card">
    <div className="balance-details">
     <span className="balance-label">Số dư khả dụng</span>
     <span className="balance-amount">{formatCurrency(balance)}</span>
     <span className="points-display">
      {points.toLocaleString('vi-VN')} điểm tích lũy
     </span>
    </div>
    <div className="wallet-card-actions">
     <Button variant="contained" color="primary" onClick={handleDeposit}>
      Nạp tiền
     </Button>
     <Button variant="outlined" color="secondary" onClick={handleToggleTxHistory}>
      {showTxHistory ? 'Ẩn lịch sử' : 'Lịch sử giao dịch'}
     </Button>
    </div>
   </div>

   {/* Khung lịch sử giao dịch */}
   {showTxHistory && (
    <div className="transaction-history-container">
     <h4>Lịch sử giao dịch</h4>
     {txLoading ? (
      <div className="wallet-loading">Đang tải lịch sử...</div>
     ) : transactions.length > 0 ? (
      <ul className="transaction-list">
       {transactions.map(tx => (
        <li key={tx.id} className="transaction-item">
         <div className="tx-info">
          <span className="tx-description">{tx.description}</span>
          <span className="tx-date">{formatTxDate(tx.createdAt)}</span>
         </div>
         <div className={`tx-amount ${
                      // Logic này rất hay, giữ nguyên
          tx.type.includes('DEPOSIT') 
          ? 'positive' 
          : 'negative'
          }`}>
          {tx.type.includes('DEPOSIT') ? '+' : '-'} {formatCurrency(tx.amount)}
         </div>
        </li>
       ))}
      </ul>
     ) : (
      <p className="no-transactions">Bạn chưa có giao dịch nào.</p>
     )}
    </div>
   )}
  </div>
 );
}
export default WalletTab;