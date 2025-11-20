export interface Invoice {
    id: string;
    invoiceDate: string;
    price: number;
    quantity: number;
    taxRate: number;
    discount: number;
    paymentStatus: 'Paid' | 'Pending' | 'Overdue' | 'Cancelled';
    customerId?: string;
    customerName?: string;
    dueDate?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Product {
    id: string;
    name: string;
    price: number;
    stock: number;
    category?: string;
    description?: string;
    sku?: string;
    unit?: string;
    createdAt?: string;
    updatedAt?: string;
}
