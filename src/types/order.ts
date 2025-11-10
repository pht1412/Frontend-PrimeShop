export interface Order {
    orderId: string;
    totalAmount: number;
    orderStatus: string;
    createdAt: string;
    fullName: string;
    phoneNumber: string;
    address: string;
    note: string;
    items: OrderItem[];
    admin: boolean;
    startDate: string;
    endDate: string;
}

export interface OrderItem {
    productId: string;
    productName: string;
    quantity: number;
    totalPrice: number;
}

