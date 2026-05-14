// Mock Data for ERP
import { 
  Product, InventoryItem, BillOfMaterial, ManufacturingOrder, Customer, Vendor, 
  SalesOrder, Invoice, PurchaseOrder, RFQ, PricingRule, QualityCheck, Account, 
  JournalEntry, BankStatement, Payment, StockMove 
} from "../types/erp";

// Initial mock data for Deluce Food Industry
const initialProducts: Product[] = [
  { id: "p1", name: "Durum Wheat Semolina", description: "High-protein durum wheat semolina, ideal for pasta manufacturing. 14% protein content.", defaultCode: "DWS-001", type: "raw_material", category: "wheat", unit: "bag_20kg", cost: 15.0, price: 18.0, minReorderQty: 100, maxStockLevel: 2000, barcode: "123456789", active: true },
  { id: "p2", name: "Refined Wheat Flour", description: "Premium refined wheat flour (Maida). Used in pasta and bakery products.", defaultCode: "RWF-001", type: "raw_material", category: "wheat", unit: "bag_10kg", cost: 8.0, price: 10.0, minReorderQty: 50, maxStockLevel: 1000, barcode: "234567890", active: true },
  { id: "p3", name: "Premium Makhana", description: "Grade-A lotus seeds (Makhana) sourced from Bihar. Suitable for retail and industrial use.", defaultCode: "PM-001", type: "raw_material", category: "makhana", unit: "kg", cost: 12.5, price: 20.0, minReorderQty: 20, maxStockLevel: 500, barcode: "345678901", active: true },
  { id: "p4", name: "Deluce Penne Pasta", description: "Signature penne pasta made from 100% durum wheat semolina. Packed in cartons of 24 units (500g each).", defaultCode: "DPP-001", type: "finished_good", category: "pasta", unit: "carton_24", cost: 24.0, price: 45.99, minReorderQty: 10, maxStockLevel: 500, barcode: "456789012", active: true, labourCost: 4.0, electricityCost: 1.5, gstRate: 12, otherCosts: 2.0 },
  { id: "p5", name: "Mixed Spices Blend", description: "Proprietary blend of cumin, coriander, turmeric and black pepper. Used in pasta seasoning.", defaultCode: "MSB-001", type: "raw_material", category: "spices", unit: "kg", cost: 18.0, price: 32.0, minReorderQty: 10, maxStockLevel: 200, barcode: "567890123", active: true },
  { id: "p6", name: "Roasted Almonds", description: "Whole roasted almonds, unsalted. Distributed as snack and food ingredient.", defaultCode: "RA-001", type: "raw_material", category: "nuts", unit: "kg", cost: 22.0, price: 38.0, minReorderQty: 15, maxStockLevel: 150, barcode: "678901234", active: true },
  { id: "p7", name: "Deluce Fusilli Pasta", description: "Spiral-shaped fusilli pasta. Ideal for salads and heavy sauces. Carton of 24 units.", defaultCode: "DFP-001", type: "finished_good", category: "pasta", unit: "carton_24", cost: 22.0, price: 42.0, minReorderQty: 5, maxStockLevel: 300, barcode: "789012345", active: true, labourCost: 3.5, electricityCost: 1.5, gstRate: 12, otherCosts: 1.5 },
];

const initialInventory: InventoryItem[] = [
  { productId: "p1", quantity: 500, location: "dry_storage", lotNumber: "DWS-2024-001", expiryDate: "2025-06-01" },
  { productId: "p2", quantity: 200, location: "dry_storage", lotNumber: "RWF-2024-002", expiryDate: "2025-12-01" },
  { productId: "p3", quantity: 50, location: "dry_storage", lotNumber: "PM-2024-003", expiryDate: "2025-08-01" },
  { productId: "p4", quantity: 20, location: "finished_goods", lotNumber: "DPP-2024-010", expiryDate: "2026-12-01" },
  { productId: "p5", quantity: 25, location: "cold_storage", lotNumber: "MSB-2024-004", expiryDate: "2026-06-01" },
];

const initialBoms: BillOfMaterial[] = [
  {
    id: "b1",
    name: "Deluce Penne Pasta BOM",
    productId: "p4",
    productQty: 1, // 1 carton of 24
    components: [
      { productId: "p1", quantity: 0.5, unit: "bag_20kg", wastePercentage: 2 }, // Half a 20kg bag
      { productId: "p2", quantity: 0.2, unit: "bag_10kg", wastePercentage: 1 },
      { productId: "p5", quantity: 0.1, unit: "kg", wastePercentage: 0 },
    ],
    type: "normal",
    isActive: true,
    notes: "Standard recipe for 1 carton (24 pcs) of Penne Pasta"
  },
];

const initialMOs: ManufacturingOrder[] = [
  { id: "mo1", name: "MO-001", productId: "p4", productQty: 50, qtyProduced: 0, status: "draft", date: new Date().toISOString().split("T")[0], scheduledDate: new Date(Date.now() + 86400000).toISOString().split("T")[0], bomId: "b1", locationSrc: "dry_storage", locationDest: "finished_goods", priority: "1", origin: "sales_orders" },
];

const initialCustomers: Customer[] = [
  { id: "c1", name: "Big Mart Supermarket", email: "purchasing@bigmart.com", phone: "+1-555-0101", address: "123 Main Street, Chicago, IL", taxId: "TAX-001", creditLimit: 50000, credit: 0, category: ["retail", "large"], paymentTerm: "30 days" },
  { id: "c2", name: "Fresh Foods Inc", email: "orders@freshfoods.com", phone: "+1-555-0102", address: "456 Oak Avenue, Detroit, MI", taxId: "TAX-002", creditLimit: 30000, credit: 0, category: ["wholesale"], paymentTerm: "15 days" },
];

const initialVendors: Vendor[] = [
  { id: "v1", name: "ABC Flour Mills", email: "sales@abcmills.com", phone: "+1-555-0201", address: "789 Industrial Blvd, Gary, IN", paymentTerm: "45 days" },
  { id: "v2", name: "Premium Chocolate Co", email: "orders@premiumchoc.com", phone: "+1-555-0202", address: "321 Factory Road, Cleveland, OH", paymentTerm: "30 days" },
];

const initialSOs: SalesOrder[] = [
  { id: "so1", name: "SO-001", customerId: "c1", lines: [{ productId: "p4", qty: 10, unitPrice: 5.99, discount: 0, tax: 0.48 }], amountUntaxed: 59.90, amountTax: 4.80, amountTotal: 64.70, status: "sent", dateOrder: new Date().toISOString().split("T")[0], dateDelivery: new Date(Date.now() + 172800000).toISOString().split("T")[0], paymentTerm: "Net 30" },
];

const initialInvoices: Invoice[] = [];

const initialPOs: PurchaseOrder[] = [
  { id: "po1", name: "PO-001", vendorId: "v1", lines: [{ productId: "p1", qty: 200, unitPrice: 0.5, discount: 0, expectedDate: new Date(Date.now() + 259200000).toISOString().split("T")[0] }, { productId: "p2", qty: 100, unitPrice: 0.8, discount: 0, expectedDate: new Date(Date.now() + 259200000).toISOString().split("T")[0] }], amountUntaxed: 180.00, amountTax: 14.40, amountTotal: 194.40, status: "sent", dateOrder: new Date().toISOString().split("T")[0], datePlanned: new Date(Date.now() + 259200000).toISOString().split("T")[0] },
];

const initialRFQs: RFQ[] = [
  { id: "rfq1", name: "RFQ-001", vendorId: "v1", lines: [{ productId: "p1", qty: 500, expectedPrice: 0.45 }, { productId: "p2", qty: 200, expectedPrice: 0.75 }], status: "sent", date: new Date().toISOString().split("T")[0], expectedDelivery: new Date(Date.now() + 518400000).toISOString().split("T")[0], notes: "Quarterly flour and sugar procurement" },
  { id: "rfq2", name: "RFQ-002", vendorId: "v2", lines: [{ productId: "p3", qty: 100, expectedPrice: 3.20 }], status: "received", date: new Date().toISOString().split("T")[0], expectedDelivery: new Date(Date.now() + 259200000).toISOString().split("T")[0], notes: "Premium chocolate chips bulk order" },
];

const initialPricingRules: PricingRule[] = [
  { id: "pr1", productId: "p4", minQty: 100, price: 5.50, discount: 5, validFrom: new Date().toISOString().split("T")[0], isActive: true },
  { id: "pr2", productId: "p4", minQty: 500, price: 5.25, discount: 10, validFrom: new Date().toISOString().split("T")[0], isActive: true },
];

const initialQualityChecks: QualityCheck[] = [
  { id: "qc1", name: "Raw Material Inspection - Wheat Flour", productId: "p1", checkType: "incoming", priority: "major", status: "open", assignedTo: "emp1", dueDate: new Date(Date.now() + 86400000).toISOString().split("T")[0], description: "Check moisture content and protein levels", result: "pending" },
  { id: "qc2", name: "In-Process Quality Check - Cookie Mixing", productId: "p4", checkType: "in_process", priority: "critical", status: "in_progress", assignedTo: "emp2", dueDate: new Date().toISOString().split("T")[0], description: "Verify dough consistency and temperature", result: "pending" },
  { id: "qc3", name: "Final Product Inspection - Choco Cookies", productId: "p4", checkType: "final", priority: "major", status: "resolved", assignedTo: "emp1", dueDate: new Date(Date.now() - 86400000).toISOString().split("T")[0], description: "Check packaging integrity and weight", result: "pass", notes: "All 50 units passed inspection" },
];

const initialAccounts: Account[] = [
  { id: "acc1", code: "1010", name: "Cash", type: "asset", category: "cash", isActive: true, balance: 50000 },
  { id: "acc2", code: "1200", name: "Accounts Receivable", type: "asset", category: "receivable", isActive: true, balance: 64.70 },
  { id: "acc3", code: "1300", name: "Raw Materials Inventory", type: "asset", category: "stock", isActive: true, balance: 290.00 },
  { id: "acc4", code: "1400", name: "Finished Goods Inventory", type: "asset", category: "stock", isActive: true, balance: 40.00 },
  { id: "acc5", code: "2010", name: "Accounts Payable", type: "liability", category: "payable", isActive: true, balance: 194.40 },
  { id: "acc6", code: "3010", name: "Retained Earnings", type: "equity", category: "retained_earnings", isActive: true, balance: 0 },
  { id: "acc7", code: "4010", name: "Sales Revenue", type: "revenue", category: "revenue", isActive: true, balance: 0 },
  { id: "acc8", code: "5010", name: "Cost of Goods Sold", type: "expense", category: "cost_of_goods_sold", isActive: true, balance: 0 },
  { id: "acc9", code: "5020", name: "Operating Expenses", type: "expense", category: "expense", isActive: true, balance: 0 },
  { id: "acc10", code: "2100", name: "Sales Tax Payable", type: "liability", category: "tax", isActive: true, balance: 4.80 },
];

const initialJournalEntries: JournalEntry[] = [
  { id: "je1", name: "JE-001", date: new Date().toISOString().split("T")[0], type: "sales", reference: "SO-001", description: "Sales invoice to Big Mart", lines: [{ id: "je1l1", accountId: "acc2", debit: 64.70, credit: 0, description: "Accounts receivable", reference: "SO-001" }, { id: "je1l2", accountId: "acc7", debit: 0, credit: 59.90, description: "Sales revenue", reference: "SO-001" }, { id: "je1l3", accountId: "acc10", debit: 0, credit: 4.80, description: "Sales tax payable", reference: "SO-001" }], posted: true, postedDate: new Date().toISOString().split("T")[0] },
];

const initialBankStatements: BankStatement[] = [
  { id: "bs1", name: "March 2024 Bank Statement", accountId: "acc1", startDate: "2024-03-01", endDate: "2024-03-31", openingBalance: 45000, closingBalance: 50000, lines: [{ id: "bsl1", date: "2024-03-15", description: "Cash deposit - Sales", amount: 5000, reference: "DEP-001", reconciled: true, journalEntryId: "je1" }], reconciled: true },
];

const initialPayments: Payment[] = [
  { id: "pay1", name: "PAY-001", paymentMethod: "bank_transfer", amount: 194.40, date: new Date().toISOString().split("T")[0], reference: "PO-001", description: "Payment to ABC Flour Mills", vendorId: "v1", invoiceId: undefined, reconciled: true },
];

const initialStockMoves: StockMove[] = [];


export const defaultMockData = {
  initialProducts,
  initialInventory,
  initialBoms,
  initialMOs,
  initialCustomers,
  initialVendors,
  initialSOs,
  initialInvoices,
  initialPOs,
  initialRFQs,
  initialPricingRules,
  initialQualityChecks,
  initialAccounts,
  initialJournalEntries,
  initialBankStatements,
  initialPayments,
  initialStockMoves
};
