export interface Warehouse {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    contactPerson: string;
    phone: string;
    email: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Batch {
    id: string;
    productId: string;
    batchNumber: string;
    quantity: number;
    unit: string;
    purchasePrice: number;
    sellingPrice: number;
    manufacturingDate: string;
    expiryDate?: string;
    supplier: string;
    warehouseId: string;
    status: 'active' | 'expired' | 'recalled' | 'sold_out';
    createdAt: string;
    updatedAt: string;
}

export interface InventoryItem {
    id: string;
    productId: string;
    warehouseId: string;
    currentStock: number;
    reservedStock: number;
    availableStock: number;
    reorderPoint: number;
    reorderQuantity: number;
    maxStock: number;
    lastRestocked: string;
    lastUpdated: string;
    createdAt: string;
}

export interface LowStockAlert {
    id: string;
    productId: string;
    productName: string;
    warehouseId: string;
    warehouseName: string;
    currentStock: number;
    reorderPoint: number;
    reorderQuantity: number;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'active' | 'acknowledged' | 'resolved';
    createdAt: string;
    acknowledgedAt?: string;
    acknowledgedBy?: string;
    resolvedAt?: string;
    resolvedBy?: string;
}

export interface ReorderRequest {
    id: string;
    productId: string;
    productName: string;
    warehouseId: string;
    warehouseName: string;
    currentStock: number;
    reorderQuantity: number;
    estimatedCost: number;
    status: 'pending' | 'approved' | 'ordered' | 'received' | 'cancelled';
    requestedBy: string;
    requestedAt: string;
    approvedBy?: string;
    approvedAt?: string;
    orderedAt?: string;
    receivedAt?: string;
    notes?: string;
}

export interface StockMovement {
    id: string;
    productId: string;
    productName: string;
    warehouseId: string;
    warehouseName: string;
    batchId?: string;
    batchNumber?: string;
    movementType: 'in' | 'out' | 'transfer' | 'adjustment';
    quantity: number;
    unit: string;
    reason: string;
    reference?: string; // Invoice number, transfer ID, etc.
    performedBy: string;
    performedAt: string;
    notes?: string;
}
