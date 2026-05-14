// ERP Types
export type ProductType = "raw_material" | "finished_good" | "semi_finished";
export type ProductCategory = "baking" | "dairy" | "packaging" | "seasoning" | "wheat" | "nuts" | "makhana" | "spices" | "pasta";

export interface Product {
  id: string;
  name: string;
  description?: string;
  defaultCode?: string;
  type: ProductType;
  category?: ProductCategory;
  unit: string;
  quantityPerUnit?: number;
  cost: number;
  price: number;
  minReorderQty: number;
  maxStockLevel: number;
  barcode?: string;
  active: boolean;
  // Cost breakdown (for finished goods)
  labourCost?: number;
  electricityCost?: number;
  gstRate?: number;
  otherCosts?: number;
}

export interface Employee {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  department?: string;
  position?: string;
  salary: number;
  hireDate: string;
  status: "active" | "inactive";
  leaves: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeId: string;
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  dueDate?: string;
}

export type WarehouseLocation = "factory" | "cold_storage" | "dry_storage" | "finished_goods" | "shipping_area" | "company_stock" | "raw_material" | "packaging_material";

export interface InventoryItem {
  productId: string;
  quantity: number;
  location: WarehouseLocation;
  lotNumber?: string;
  expiryDate?: string;
  batchNumber?: string;
}

export interface BomComponent {
  productId: string;
  quantity: number;
  unit: string;
  wastePercentage?: number;
}

export type BoMType = "normal" | "phantom" | "subcontracting";

export interface BillOfMaterial {
  id: string;
  name: string;
  productId: string; // The finished good
  productQty: number;
  components: BomComponent[];
  type: BoMType;
  isActive: boolean;
  notes?: string;
}

export type MOStatus = "draft" | "confirmed" | "progress" | "done" | "cancelled";

export interface ManufacturingOrder {
  id: string;
  name: string;
  productId: string;
  productQty: number;
  qtyProduced: number;
  status: MOStatus;
  date: string;
  scheduledDate: string;
  bomId: string;
  locationSrc: WarehouseLocation;
  locationDest: WarehouseLocation;
  priority: "0" | "1" | "2";
  origin?: string;
}

export type SalesOrderStatus = "draft" | "sent" | "sale" | "done" | "cancelled";

export interface SalesOrderLine {
  productId: string;
  qty: number;
  unitPrice: number;
  discount?: number;
  tax?: number;
}

export interface SalesOrder {
  id: string;
  name: string;
  customerId: string;
  lines: SalesOrderLine[];
  amountUntaxed: number;
  amountTax: number;
  amountTotal: number;
  status: SalesOrderStatus;
  dateOrder: string;
  dateDelivery?: string;
  paymentTerm?: string;
  note?: string;
}

export type InvoiceStatus = "draft" | "posted" | "paid" | "cancelled";
export type PaymentMethod = "cash" | "bank_transfer" | "credit_card" | "cheque";

export interface Invoice {
  id: string;
  name: string;
  salesOrderId?: string;
  customerId: string;
  invoiceLines: SalesOrderLine[];
  amountUntaxed: number;
  amountTax: number;
  amountTotal: number;
  amountDue: number;
  amountPaid: number;
  status: InvoiceStatus;
  invoiceDate: string;
  dueDate: string;
  paymentMethod?: PaymentMethod;
  paymentDate?: string;
}

export type AccountType = "asset" | "liability" | "equity" | "revenue" | "expense";
export type AccountCategory = "receivable" | "payable" | "bank" | "cash" | "stock" | "cost_of_goods_sold" | "revenue" | "expense" | "tax" | "retained_earnings";

export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  category: AccountCategory;
  parentId?: string;
  isActive: boolean;
  balance: number;
}

export type JournalEntryType = "sales" | "purchase" | "payment" | "receipt" | "inventory" | "manufacturing" | "manual";

export interface JournalEntryLine {
  id: string;
  accountId: string;
  debit: number;
  credit: number;
  description: string;
  reference?: string;
}

export interface JournalEntry {
  id: string;
  name: string;
  date: string;
  type: JournalEntryType;
  reference?: string;
  description: string;
  lines: JournalEntryLine[];
  posted: boolean;
  postedDate?: string;
}

export interface BankStatement {
  id: string;
  name: string;
  accountId: string;
  startDate: string;
  endDate: string;
  openingBalance: number;
  closingBalance: number;
  lines: BankStatementLine[];
  reconciled: boolean;
}

export interface BankStatementLine {
  id: string;
  date: string;
  description: string;
  amount: number;
  reference?: string;
  reconciled: boolean;
  journalEntryId?: string;
}

export interface Payment {
  id: string;
  name: string;
  paymentMethod: PaymentMethod;
  amount: number;
  date: string;
  reference: string;
  description: string;
  invoiceId?: string;
  vendorId?: string;
  reconciled: boolean;
}

export interface TaxReport {
  period: string;
  salesTaxCollected: number;
  purchaseTaxPaid: number;
  taxDue: number;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  creditLimit: number;
  credit: number;
  category?: string[];
  paymentTerm?: string;
  currency?: string;
}

export interface Vendor {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  paymentTerm?: string;
  bankDetails?: string;
  companyDetails?: string;
}

export type PurchaseOrderStatus = "draft" | "sent" | "purchase" | "done" | "cancelled";
export type RFQStatus = "draft" | "sent" | "received" | "accepted" | "rejected";

export interface RFQLine {
  productId: string;
  qty: number;
  expectedPrice?: number;
}

export interface RFQ {
  id: string;
  name: string;
  vendorId: string;
  lines: RFQLine[];
  status: RFQStatus;
  date: string;
  expectedDelivery?: string;
  notes?: string;
}

export interface PricingRule {
  id: string;
  productId: string;
  customerCategory?: string;
  minQty: number;
  price: number;
  discount?: number;
  validFrom: string;
  validTo?: string;
  isActive: boolean;
}

export interface PurchaseOrderLine {
  productId: string;
  qty: number;
  unitPrice: number;
  discount?: number;
  expectedDate?: string;
}

export interface PurchaseOrder {
  id: string;
  name: string;
  vendorId: string;
  lines: PurchaseOrderLine[];
  amountUntaxed: number;
  amountTax: number;
  amountTotal: number;
  status: PurchaseOrderStatus;
  dateOrder: string;
  datePlanned: string;
  rfqId?: string;
  taxInclusive?: boolean;
  destination?: WarehouseLocation;
  billPdf?: string;
}

export type StockMoveType = "incoming" | "outgoing" | "internal";
export type QCPriority = "critical" | "major" | "minor";
export type QCStatus = "open" | "in_progress" | "resolved" | "closed" | "non_conformance";

export interface QualityCheck {
  id: string;
  name: string;
  productId: string;
  checkType: "incoming" | "in_process" | "final";
  priority: QCPriority;
  status: QCStatus;
  assignedTo?: string;
  dueDate: string;
  description: string;
  result?: "pass" | "fail" | "pending";
  notes?: string;
  nonConformance?: string;
  correctiveAction?: string;
}

export interface StockMove {
  id: string;
  productId: string;
  productQty: number;
  locationSrc: WarehouseLocation;
  locationDest: WarehouseLocation;
  moveType: StockMoveType;
  status: "draft" | "confirmed" | "done" | "cancelled";
  date: string;
  origin?: string;
  reference?: string;
  qcCheckId?: string;
  lotNumber?: string;
}

export interface ErpContextType {
  products: Product[];
  inventory: InventoryItem[];
  boms: BillOfMaterial[];
  manufacturingOrders: ManufacturingOrder[];
  salesOrders: SalesOrder[];
  invoices: Invoice[];
  customers: Customer[];
  vendors: Vendor[];
  purchaseOrders: PurchaseOrder[];
  rfqs: RFQ[];
  pricingRules: PricingRule[];
  qualityChecks: QualityCheck[];
  stockMoves: StockMove[];
  employees: Employee[];
  accounts: Account[];
  journalEntries: JournalEntry[];
  bankStatements: BankStatement[];
  payments: Payment[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateInventory: (productId: string, location: WarehouseLocation, quantityChange: number, lotNumber?: string) => void;
  addBom: (bom: BillOfMaterial) => void;
  createMO: (mo: ManufacturingOrder) => void;
  updateMOStatus: (moId: string, newStatus: MOStatus, actualProduced?: number, actualConsumed?: {productId: string, quantity: number}[]) => void;
  createSO: (so: SalesOrder) => void;
  updateSOStatus: (soId: string, newStatus: SalesOrderStatus) => void;
  createInvoice: (invoice: Invoice) => void;
  updateInvoiceStatus: (invoiceId: string, newStatus: InvoiceStatus) => void;
  addCustomer: (customer: Customer) => void;
  addVendor: (vendor: Vendor) => void;
  addEmployee: (employee: Employee) => void;
  createPO: (po: PurchaseOrder) => void;
  updatePOStatus: (poId: string, newStatus: PurchaseOrderStatus) => void;
  updatePO: (poId: string, updates: Partial<PurchaseOrder>) => void;
  createRFQ: (rfq: RFQ) => void;
  updateRFQStatus: (rfqId: string, newStatus: RFQStatus) => void;
  addPricingRule: (rule: PricingRule) => void;
  createQualityCheck: (qc: QualityCheck) => void;
  updateQualityCheckStatus: (qcId: string, newStatus: QCStatus, result?: "pass" | "fail" | "pending") => void;
  processStockMove: (move: StockMove) => void;
  createAccount: (account: Account) => void;
  createJournalEntry: (entry: JournalEntry) => void;
  postJournalEntry: (entryId: string) => void;
  createBankStatement: (statement: BankStatement) => void;
  createPayment: (payment: Payment) => void;
  reconcileBankLine: (lineId: string, journalEntryId?: string) => void;
}

