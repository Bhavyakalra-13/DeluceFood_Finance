import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch,
  increment,
} from 'firebase/firestore';
import db from '@/utils/firestore';
import { COLLECTIONS } from './collections';
import type {
  Product,
  Employee,
  InventoryItem,
  BillOfMaterial,
  ManufacturingOrder,
  SalesOrder,
  Invoice,
  Customer,
  Vendor,
  PurchaseOrder,
  RFQ,
  PricingRule,
  QualityCheck,
  StockMove,
  Account,
  JournalEntry,
  BankStatement,
  Payment,
} from '@/types/erp';

type Entity =
  | Product
  | Employee
  | InventoryItem
  | BillOfMaterial
  | ManufacturingOrder
  | SalesOrder
  | Invoice
  | Customer
  | Vendor
  | PurchaseOrder
  | RFQ
  | PricingRule
  | QualityCheck
  | StockMove
  | Account
  | JournalEntry
  | BankStatement
  | Payment;

function toFirestoreData(data: Entity): Record<string, unknown> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...rest } = data as Entity & { id?: string };
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(rest)) {
    if (value === undefined) continue;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      cleaned[key] = value;
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

export const erpService = {
  async getAll<T>(collectionName: string): Promise<T[]> {
    const snap = await getDocs(collection(db, collectionName));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as T));
  },

  async getById<T>(collectionName: string, id: string): Promise<T | null> {
    const snap = await getDoc(doc(db, collectionName, id));
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as T) : null;
  },

  async create<T extends Entity>(collectionName: string, data: T): Promise<string> {
    const docRef = await addDoc(collection(db, collectionName), toFirestoreData(data));
    return docRef.id;
  },

  async update<T extends Entity>(collectionName: string, id: string, data: Partial<T>): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await updateDoc(doc(db, collectionName, id), data as any);
  },

  async delete(collectionName: string, id: string): Promise<void> {
    await deleteDoc(doc(db, collectionName, id));
  },

  async query<T>(collectionName: string, field: string, operator: '==' | '>' | '<' | '>=', value: unknown): Promise<T[]> {
    const q = query(collection(db, collectionName), where(field, operator, value));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as T));
  },

  subscribe<T>(collectionName: string, callback: (data: T[]) => void): () => void {
    const unsub = onSnapshot(collection(db, collectionName), snap => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as T)));
    });
    return unsub;
  },

  subscribeOrdered<T>(collectionName: string, field: string, callback: (data: T[]) => void): () => void {
    const q = query(collection(db, collectionName), orderBy(field));
    const unsub = onSnapshot(q, snap => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as T)));
    });
    return unsub;
  },

  async batchCreate<T extends Entity>(collectionName: string, items: T[]): Promise<string[]> {
    const batch = writeBatch(db);
    const ids: string[] = [];
    for (const item of items) {
      const ref = doc(collection(db, collectionName));
      ids.push(ref.id);
      batch.set(ref, toFirestoreData(item));
    }
    await batch.commit();
    return ids;
  },

  async batchUpdate(collectionName: string, updates: { id: string; data: Record<string, unknown> }[]): Promise<void> {
    const batch = writeBatch(db);
    for (const { id, data } of updates) {
      batch.update(doc(db, collectionName, id), data as any);
    }
    await batch.commit();
  },

  async incrementField(collectionName: string, id: string, field: string, value: number): Promise<void> {
    await updateDoc(doc(db, collectionName, id), { [field]: increment(value) });
  },
};

export const productService = {
  getAll: () => erpService.getAll<Product>(COLLECTIONS.PRODUCTS),
  getById: (id: string) => erpService.getById<Product>(COLLECTIONS.PRODUCTS, id),
  create: (data: Product) => erpService.create(COLLECTIONS.PRODUCTS, data),
  update: (id: string, data: Partial<Product>) => erpService.update(COLLECTIONS.PRODUCTS, id, data),
  delete: (id: string) => erpService.delete(COLLECTIONS.PRODUCTS, id),
  subscribe: (callback: (data: Product[]) => void) => erpService.subscribe<Product>(COLLECTIONS.PRODUCTS, callback),
};

export const inventoryService = {
  getAll: () => erpService.getAll<InventoryItem>(COLLECTIONS.INVENTORY),
  create: (data: InventoryItem) => erpService.create(COLLECTIONS.INVENTORY, data),
  update: (id: string, data: Partial<InventoryItem>) => erpService.update(COLLECTIONS.INVENTORY, id, data),
  delete: (id: string) => erpService.delete(COLLECTIONS.INVENTORY, id),
  subscribe: (callback: (data: InventoryItem[]) => void) => erpService.subscribe<InventoryItem>(COLLECTIONS.INVENTORY, callback),
  getByProduct: (productId: string) => erpService.query<InventoryItem>(COLLECTIONS.INVENTORY, 'productId', '==', productId),
};

export const bomService = {
  getAll: () => erpService.getAll<BillOfMaterial>(COLLECTIONS.BOMS),
  getById: (id: string) => erpService.getById<BillOfMaterial>(COLLECTIONS.BOMS, id),
  create: (data: BillOfMaterial) => erpService.create(COLLECTIONS.BOMS, data),
  update: (id: string, data: Partial<BillOfMaterial>) => erpService.update(COLLECTIONS.BOMS, id, data),
  delete: (id: string) => erpService.delete(COLLECTIONS.BOMS, id),
  subscribe: (callback: (data: BillOfMaterial[]) => void) => erpService.subscribe<BillOfMaterial>(COLLECTIONS.BOMS, callback),
};

export const manufacturingOrderService = {
  getAll: () => erpService.getAll<ManufacturingOrder>(COLLECTIONS.MANUFACTURING_ORDERS),
  getById: (id: string) => erpService.getById<ManufacturingOrder>(COLLECTIONS.MANUFACTURING_ORDERS, id),
  create: (data: ManufacturingOrder) => erpService.create(COLLECTIONS.MANUFACTURING_ORDERS, data),
  update: (id: string, data: Partial<ManufacturingOrder>) => erpService.update(COLLECTIONS.MANUFACTURING_ORDERS, id, data),
  delete: (id: string) => erpService.delete(COLLECTIONS.MANUFACTURING_ORDERS, id),
  subscribe: (callback: (data: ManufacturingOrder[]) => void) => erpService.subscribe<ManufacturingOrder>(COLLECTIONS.MANUFACTURING_ORDERS, callback),
};

export const salesOrderService = {
  getAll: () => erpService.getAll<SalesOrder>(COLLECTIONS.SALES_ORDERS),
  getById: (id: string) => erpService.getById<SalesOrder>(COLLECTIONS.SALES_ORDERS, id),
  create: (data: SalesOrder) => erpService.create(COLLECTIONS.SALES_ORDERS, data),
  update: (id: string, data: Partial<SalesOrder>) => erpService.update(COLLECTIONS.SALES_ORDERS, id, data),
  delete: (id: string) => erpService.delete(COLLECTIONS.SALES_ORDERS, id),
  subscribe: (callback: (data: SalesOrder[]) => void) => erpService.subscribe<SalesOrder>(COLLECTIONS.SALES_ORDERS, callback),
};

export const invoiceService = {
  getAll: () => erpService.getAll<Invoice>(COLLECTIONS.INVOICES),
  getById: (id: string) => erpService.getById<Invoice>(COLLECTIONS.INVOICES, id),
  create: (data: Invoice) => erpService.create(COLLECTIONS.INVOICES, data),
  update: (id: string, data: Partial<Invoice>) => erpService.update(COLLECTIONS.INVOICES, id, data),
  delete: (id: string) => erpService.delete(COLLECTIONS.INVOICES, id),
  subscribe: (callback: (data: Invoice[]) => void) => erpService.subscribe<Invoice>(COLLECTIONS.INVOICES, callback),
};

export const customerService = {
  getAll: () => erpService.getAll<Customer>(COLLECTIONS.CUSTOMERS),
  getById: (id: string) => erpService.getById<Customer>(COLLECTIONS.CUSTOMERS, id),
  create: (data: Customer) => erpService.create(COLLECTIONS.CUSTOMERS, data),
  update: (id: string, data: Partial<Customer>) => erpService.update(COLLECTIONS.CUSTOMERS, id, data),
  delete: (id: string) => erpService.delete(COLLECTIONS.CUSTOMERS, id),
  subscribe: (callback: (data: Customer[]) => void) => erpService.subscribe<Customer>(COLLECTIONS.CUSTOMERS, callback),
};

export const vendorService = {
  getAll: () => erpService.getAll<Vendor>(COLLECTIONS.VENDORS),
  getById: (id: string) => erpService.getById<Vendor>(COLLECTIONS.VENDORS, id),
  create: (data: Vendor) => erpService.create(COLLECTIONS.VENDORS, data),
  update: (id: string, data: Partial<Vendor>) => erpService.update(COLLECTIONS.VENDORS, id, data),
  delete: (id: string) => erpService.delete(COLLECTIONS.VENDORS, id),
  subscribe: (callback: (data: Vendor[]) => void) => erpService.subscribe<Vendor>(COLLECTIONS.VENDORS, callback),
};

export const purchaseOrderService = {
  getAll: () => erpService.getAll<PurchaseOrder>(COLLECTIONS.PURCHASE_ORDERS),
  getById: (id: string) => erpService.getById<PurchaseOrder>(COLLECTIONS.PURCHASE_ORDERS, id),
  create: (data: PurchaseOrder) => erpService.create(COLLECTIONS.PURCHASE_ORDERS, data),
  update: (id: string, data: Partial<PurchaseOrder>) => erpService.update(COLLECTIONS.PURCHASE_ORDERS, id, data),
  delete: (id: string) => erpService.delete(COLLECTIONS.PURCHASE_ORDERS, id),
  subscribe: (callback: (data: PurchaseOrder[]) => void) => erpService.subscribe<PurchaseOrder>(COLLECTIONS.PURCHASE_ORDERS, callback),
};

export const rfqService = {
  getAll: () => erpService.getAll<RFQ>(COLLECTIONS.RFQS),
  getById: (id: string) => erpService.getById<RFQ>(COLLECTIONS.RFQS, id),
  create: (data: RFQ) => erpService.create(COLLECTIONS.RFQS, data),
  update: (id: string, data: Partial<RFQ>) => erpService.update(COLLECTIONS.RFQS, id, data),
  delete: (id: string) => erpService.delete(COLLECTIONS.RFQS, id),
  subscribe: (callback: (data: RFQ[]) => void) => erpService.subscribe<RFQ>(COLLECTIONS.RFQS, callback),
};

export const pricingRuleService = {
  getAll: () => erpService.getAll<PricingRule>(COLLECTIONS.PRICING_RULES),
  create: (data: PricingRule) => erpService.create(COLLECTIONS.PRICING_RULES, data),
  update: (id: string, data: Partial<PricingRule>) => erpService.update(COLLECTIONS.PRICING_RULES, id, data),
  delete: (id: string) => erpService.delete(COLLECTIONS.PRICING_RULES, id),
  subscribe: (callback: (data: PricingRule[]) => void) => erpService.subscribe<PricingRule>(COLLECTIONS.PRICING_RULES, callback),
};

export const qualityCheckService = {
  getAll: () => erpService.getAll<QualityCheck>(COLLECTIONS.QUALITY_CHECKS),
  getById: (id: string) => erpService.getById<QualityCheck>(COLLECTIONS.QUALITY_CHECKS, id),
  create: (data: QualityCheck) => erpService.create(COLLECTIONS.QUALITY_CHECKS, data),
  update: (id: string, data: Partial<QualityCheck>) => erpService.update(COLLECTIONS.QUALITY_CHECKS, id, data),
  delete: (id: string) => erpService.delete(COLLECTIONS.QUALITY_CHECKS, id),
  subscribe: (callback: (data: QualityCheck[]) => void) => erpService.subscribe<QualityCheck>(COLLECTIONS.QUALITY_CHECKS, callback),
};

export const stockMoveService = {
  getAll: () => erpService.getAll<StockMove>(COLLECTIONS.STOCK_MOVES),
  getById: (id: string) => erpService.getById<StockMove>(COLLECTIONS.STOCK_MOVES, id),
  create: (data: StockMove) => erpService.create(COLLECTIONS.STOCK_MOVES, data),
  update: (id: string, data: Partial<StockMove>) => erpService.update(COLLECTIONS.STOCK_MOVES, id, data),
  delete: (id: string) => erpService.delete(COLLECTIONS.STOCK_MOVES, id),
  subscribe: (callback: (data: StockMove[]) => void) => erpService.subscribe<StockMove>(COLLECTIONS.STOCK_MOVES, callback),
};

export const employeeService = {
  getAll: () => erpService.getAll<Employee>(COLLECTIONS.EMPLOYEES),
  getById: (id: string) => erpService.getById<Employee>(COLLECTIONS.EMPLOYEES, id),
  create: (data: Employee) => erpService.create(COLLECTIONS.EMPLOYEES, data),
  update: (id: string, data: Partial<Employee>) => erpService.update(COLLECTIONS.EMPLOYEES, id, data),
  delete: (id: string) => erpService.delete(COLLECTIONS.EMPLOYEES, id),
  subscribe: (callback: (data: Employee[]) => void) => erpService.subscribe<Employee>(COLLECTIONS.EMPLOYEES, callback),
};

export const accountService = {
  getAll: () => erpService.getAll<Account>(COLLECTIONS.ACCOUNTS),
  getById: (id: string) => erpService.getById<Account>(COLLECTIONS.ACCOUNTS, id),
  create: (data: Account) => erpService.create(COLLECTIONS.ACCOUNTS, data),
  update: (id: string, data: Partial<Account>) => erpService.update(COLLECTIONS.ACCOUNTS, id, data),
  delete: (id: string) => erpService.delete(COLLECTIONS.ACCOUNTS, id),
  subscribe: (callback: (data: Account[]) => void) => erpService.subscribe<Account>(COLLECTIONS.ACCOUNTS, callback),
};

export const journalEntryService = {
  getAll: () => erpService.getAll<JournalEntry>(COLLECTIONS.JOURNAL_ENTRIES),
  getById: (id: string) => erpService.getById<JournalEntry>(COLLECTIONS.JOURNAL_ENTRIES, id),
  create: (data: JournalEntry) => erpService.create(COLLECTIONS.JOURNAL_ENTRIES, data),
  update: (id: string, data: Partial<JournalEntry>) => erpService.update(COLLECTIONS.JOURNAL_ENTRIES, id, data),
  delete: (id: string) => erpService.delete(COLLECTIONS.JOURNAL_ENTRIES, id),
  subscribe: (callback: (data: JournalEntry[]) => void) => erpService.subscribe<JournalEntry>(COLLECTIONS.JOURNAL_ENTRIES, callback),
};

export const bankStatementService = {
  getAll: () => erpService.getAll<BankStatement>(COLLECTIONS.BANK_STATEMENTS),
  getById: (id: string) => erpService.getById<BankStatement>(COLLECTIONS.BANK_STATEMENTS, id),
  create: (data: BankStatement) => erpService.create(COLLECTIONS.BANK_STATEMENTS, data),
  update: (id: string, data: Partial<BankStatement>) => erpService.update(COLLECTIONS.BANK_STATEMENTS, id, data),
  delete: (id: string) => erpService.delete(COLLECTIONS.BANK_STATEMENTS, id),
  subscribe: (callback: (data: BankStatement[]) => void) => erpService.subscribe<BankStatement>(COLLECTIONS.BANK_STATEMENTS, callback),
};

export const paymentService = {
  getAll: () => erpService.getAll<Payment>(COLLECTIONS.PAYMENTS),
  getById: (id: string) => erpService.getById<Payment>(COLLECTIONS.PAYMENTS, id),
  create: (data: Payment) => erpService.create(COLLECTIONS.PAYMENTS, data),
  update: (id: string, data: Partial<Payment>) => erpService.update(COLLECTIONS.PAYMENTS, id, data),
  delete: (id: string) => erpService.delete(COLLECTIONS.PAYMENTS, id),
  subscribe: (callback: (data: Payment[]) => void) => erpService.subscribe<Payment>(COLLECTIONS.PAYMENTS, callback),
};

export const erpDataService = {
  products: productService,
  inventory: inventoryService,
  boms: bomService,
  manufacturingOrders: manufacturingOrderService,
  salesOrders: salesOrderService,
  invoices: invoiceService,
  customers: customerService,
  vendors: vendorService,
  purchaseOrders: purchaseOrderService,
  rfqs: rfqService,
  pricingRules: pricingRuleService,
  qualityChecks: qualityCheckService,
  stockMoves: stockMoveService,
  employees: employeeService,
  accounts: accountService,
  journalEntries: journalEntryService,
  bankStatements: bankStatementService,
  payments: paymentService,
};