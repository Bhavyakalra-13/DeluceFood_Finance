"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { defaultMockData } from "../data/mockErpData";
import { ErpContextType, Product, InventoryItem, BillOfMaterial, ManufacturingOrder, SalesOrder, Invoice, Customer, Vendor, PurchaseOrder, RFQ, PricingRule, QualityCheck, StockMove, Employee, Account, JournalEntry, BankStatement, Payment, WarehouseLocation, MOStatus, SalesOrderStatus, InvoiceStatus, PurchaseOrderStatus, RFQStatus, QCStatus } from "../types/erp";
import { erpDataService } from "@/lib/backend";
import { seedDefaultAdmin } from "@/lib/backend/authService";

export * from "../types/erp";

const ErpContext = createContext<ErpContextType | undefined>(undefined);

export const ErpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [useFirestore, setUseFirestore] = useState(false);

  const [products, setProducts] = useState<Product[]>(defaultMockData.initialProducts);
  const [inventory, setInventory] = useState<InventoryItem[]>(defaultMockData.initialInventory);
  const [boms, setBoms] = useState<BillOfMaterial[]>(defaultMockData.initialBoms);
  const [manufacturingOrders, setManufacturingOrders] = useState<ManufacturingOrder[]>(defaultMockData.initialMOs);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>(defaultMockData.initialSOs);
  const [invoices, setInvoices] = useState<Invoice[]>(defaultMockData.initialInvoices);
  const [customers, setCustomers] = useState<Customer[]>(defaultMockData.initialCustomers);
  const [vendors, setVendors] = useState<Vendor[]>(defaultMockData.initialVendors);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(defaultMockData.initialPOs);
  const [rfqs, setRFQs] = useState<RFQ[]>(defaultMockData.initialRFQs);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>(defaultMockData.initialPricingRules);
  const [qualityChecks, setQualityChecks] = useState<QualityCheck[]>(defaultMockData.initialQualityChecks);
  const [stockMoves, setStockMoves] = useState<StockMove[]>(defaultMockData.initialStockMoves);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [accounts, setAccounts] = useState<Account[]>(defaultMockData.initialAccounts);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(defaultMockData.initialJournalEntries);
  const [bankStatements, setBankStatements] = useState<BankStatement[]>(defaultMockData.initialBankStatements);
  const [payments, setPayments] = useState<Payment[]>(defaultMockData.initialPayments);

  useEffect(() => {
    const initFirestore = async () => {
      try {
        console.log("🔄 Initializing Firebase...");
        
        // Seed default admin user if not exists
        await seedDefaultAdmin();

        console.log("📡 Fetching Firestore data...");

        let firestoreProducts: any[] = [];
        let firestoreInventory: any[] = [];
        let firestoreBoms: any[] = [];
        let firestoreMOs: any[] = [];
        let firestoreSOs: any[] = [];
        let firestoreInvoices: any[] = [];
        let firestoreCustomers: any[] = [];
        let firestoreVendors: any[] = [];
        let firestorePOs: any[] = [];
        let firestoreRFQs: any[] = [];
        let firestorePricingRules: any[] = [];
        let firestoreQualityChecks: any[] = [];
        let firestoreStockMoves: any[] = [];
        let firestoreEmployees: any[] = [];
        let firestoreAccounts: any[] = [];
        let firestoreJournalEntries: any[] = [];
        let firestoreBankStatements: any[] = [];
        let firestorePayments: any[] = [];

        try {
          [firestoreProducts, firestoreInventory, firestoreBoms, firestoreMOs, firestoreSOs, firestoreInvoices, firestoreCustomers, firestoreVendors, firestorePOs, firestoreRFQs, firestorePricingRules, firestoreQualityChecks, firestoreStockMoves, firestoreEmployees, firestoreAccounts, firestoreJournalEntries, firestoreBankStatements, firestorePayments] = await Promise.all([
            erpDataService.products.getAll(),
            erpDataService.inventory.getAll(),
            erpDataService.boms.getAll(),
            erpDataService.manufacturingOrders.getAll(),
            erpDataService.salesOrders.getAll(),
            erpDataService.invoices.getAll(),
            erpDataService.customers.getAll(),
            erpDataService.vendors.getAll(),
            erpDataService.purchaseOrders.getAll(),
            erpDataService.rfqs.getAll(),
            erpDataService.pricingRules.getAll(),
            erpDataService.qualityChecks.getAll(),
            erpDataService.stockMoves.getAll(),
            erpDataService.employees.getAll(),
            erpDataService.accounts.getAll(),
            erpDataService.journalEntries.getAll(),
            erpDataService.bankStatements.getAll(),
            erpDataService.payments.getAll(),
          ]);
          console.log("✅ Firestore read successful");
        } catch (readError) {
          console.error("❌ Firestore read error:", readError);
          firestoreProducts = [];
          firestoreCustomers = [];
          firestoreVendors = [];
        }

        const hasData = (firestoreProducts?.length || 0) > 0 || 
          (firestoreCustomers?.length || 0) > 0 || 
          (firestoreVendors?.length || 0) > 0;

        // If Firestore is empty, seed with mock data
        if (!hasData) {
          console.log("Seeding Firestore with initial data...");
          try {
            await Promise.all([
              ...defaultMockData.initialProducts.map(p => erpDataService.products.create(p)),
              ...defaultMockData.initialCustomers.map(c => erpDataService.customers.create(c)),
              ...defaultMockData.initialVendors.map(v => erpDataService.vendors.create(v)),
              ...defaultMockData.initialInventory.map(i => erpDataService.inventory.create(i)),
              ...defaultMockData.initialInvoices.map(i => erpDataService.invoices.create(i)),
              ...defaultMockData.initialAccounts.map(a => erpDataService.accounts.create(a)),
              ...defaultMockData.initialBoms.map(b => erpDataService.boms.create(b)),
              ...defaultMockData.initialMOs.map(m => erpDataService.manufacturingOrders.create(m)),
              ...defaultMockData.initialSOs.map(s => erpDataService.salesOrders.create(s)),
              ...defaultMockData.initialPOs.map(p => erpDataService.purchaseOrders.create(p)),
            ]);
            // Reload all data from Firestore after seeding
            const [
              newProducts, newCustomers, newVendors, newInventory, 
              newInvoices, newAccounts, newBoms, newMOs, newSOs, newPOs
            ] = await Promise.all([
              erpDataService.products.getAll(),
              erpDataService.customers.getAll(),
              erpDataService.vendors.getAll(),
              erpDataService.inventory.getAll(),
              erpDataService.invoices.getAll(),
              erpDataService.accounts.getAll(),
              erpDataService.boms.getAll(),
              erpDataService.manufacturingOrders.getAll(),
              erpDataService.salesOrders.getAll(),
              erpDataService.purchaseOrders.getAll(),
            ]);
            setProducts(newProducts);
            setCustomers(newCustomers);
            setVendors(newVendors);
            setInventory(newInventory);
            setInvoices(newInvoices);
            setAccounts(newAccounts);
            setBoms(newBoms);
            setManufacturingOrders(newMOs);
            setSalesOrders(newSOs);
            setPurchaseOrders(newPOs);
            setUseFirestore(true);
            console.log("Firestore seeded successfully!");
          } catch (seedError) {
            console.error("Failed to seed Firestore:", seedError);
          }
        } else {
          setProducts((firestoreProducts?.length || 0) > 0 ? firestoreProducts : defaultMockData.initialProducts);
          setInventory((firestoreInventory?.length || 0) > 0 ? firestoreInventory : defaultMockData.initialInventory);
          setBoms((firestoreBoms?.length || 0) > 0 ? firestoreBoms : defaultMockData.initialBoms);
          setManufacturingOrders((firestoreMOs?.length || 0) > 0 ? firestoreMOs : defaultMockData.initialMOs);
          setSalesOrders((firestoreSOs?.length || 0) > 0 ? firestoreSOs : defaultMockData.initialSOs);
          setInvoices((firestoreInvoices?.length || 0) > 0 ? firestoreInvoices : defaultMockData.initialInvoices);
          setCustomers((firestoreCustomers?.length || 0) > 0 ? firestoreCustomers : defaultMockData.initialCustomers);
          setVendors((firestoreVendors?.length || 0) > 0 ? firestoreVendors : defaultMockData.initialVendors);
          setPurchaseOrders((firestorePOs?.length || 0) > 0 ? firestorePOs : defaultMockData.initialPOs);
          setRFQs((firestoreRFQs?.length || 0) > 0 ? firestoreRFQs : defaultMockData.initialRFQs);
          setPricingRules((firestorePricingRules?.length || 0) > 0 ? firestorePricingRules : defaultMockData.initialPricingRules);
          setQualityChecks((firestoreQualityChecks?.length || 0) > 0 ? firestoreQualityChecks : defaultMockData.initialQualityChecks);
          setStockMoves((firestoreStockMoves?.length || 0) > 0 ? firestoreStockMoves : defaultMockData.initialStockMoves);
          setEmployees((firestoreEmployees?.length || 0) > 0 ? firestoreEmployees : []);
          setAccounts((firestoreAccounts?.length || 0) > 0 ? firestoreAccounts : defaultMockData.initialAccounts);
          setJournalEntries((firestoreJournalEntries?.length || 0) > 0 ? firestoreJournalEntries : defaultMockData.initialJournalEntries);
          setBankStatements((firestoreBankStatements?.length || 0) > 0 ? firestoreBankStatements : defaultMockData.initialBankStatements);
          setPayments((firestorePayments?.length || 0) > 0 ? firestorePayments : defaultMockData.initialPayments);
          setUseFirestore(true);
        }
      } catch (error) {
        console.log("Using mock data - Firestore not available:", error);
      } finally {
        setIsLoaded(true);
      }
    };

    initFirestore();
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const syncToFirestore = useCallback(async (service: any, action: 'create' | 'update' | 'delete', data?: any, id?: string, updateData?: any) => {
    if (!useFirestore) return;
    try {
      if (action === 'create' && data && service.create) {
        await service.create(data);
      } else if (action === 'update' && id && updateData && service.update) {
        await service.update(id, updateData);
      } else if (action === 'delete' && id && service.delete) {
        await service.delete(id);
      }
    } catch (error) {
      console.error("Firestore sync error:", error);
    }
  }, [useFirestore]);

  const addProduct = async (product: Product) => {
    setProducts(prev => [...prev, product]);
    await syncToFirestore(erpDataService.products, 'create', product);
  };

  const updateProduct = async (id: string, productUpdate: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...productUpdate } : p));
    await syncToFirestore(erpDataService.products, 'update', undefined, id, productUpdate);
  };

  const deleteProduct = async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    await syncToFirestore(erpDataService.products, 'delete', undefined, id);
  };

  const updateInventory = (productId: string, location: WarehouseLocation, quantityChange: number, lotNumber?: string) => {
    setInventory(prev => {
      const existing = prev.find(i => i.productId === productId && i.location === location && i.lotNumber === lotNumber);
      if (existing) {
        const newQuantity = existing.quantity + quantityChange;
        if (newQuantity <= 0) {
          return prev.filter(i => i !== existing);
        }
        return prev.map(i => i === existing ? { ...i, quantity: newQuantity } : i);
      }
      if (quantityChange > 0) {
        return [...prev, { productId, location, quantity: quantityChange, lotNumber }];
      }
      return prev;
    });
  };

  const addBom = async (bom: BillOfMaterial) => {
    setBoms(prev => [...prev, bom]);
    await syncToFirestore(erpDataService.boms, 'create', bom);
  };

  const createMO = (mo: ManufacturingOrder) => {
    setManufacturingOrders(prev => [...prev, mo]);
    const bom = boms.find(b => b.id === mo.bomId);
    if (bom) {
      bom.components.forEach(comp => {
        const totalQty = comp.quantity * mo.productQty * (1 + (comp.wastePercentage || 0) / 100);
        processStockMove({
          id: `sm-mo-${Date.now()}-${comp.productId}`,
          productId: comp.productId,
          productQty: totalQty,
          locationSrc: mo.locationSrc,
          locationDest: mo.locationSrc,
          moveType: "outgoing",
          status: "draft",
          date: mo.date,
          origin: mo.name,
        });
      });
    }
    syncToFirestore(erpDataService.manufacturingOrders, 'create', mo);
  };

  const updateMOStatus = (moId: string, newStatus: MOStatus, actualProduced?: number, actualConsumed?: { productId: string, quantity: number }[]) => {
    setManufacturingOrders(prev => {
      const mo = prev.find(m => m.id === moId);
      if (!mo) return prev;

      const bom = boms.find(b => b.id === mo.bomId);

      if (mo.status !== "done" && newStatus === "done" && bom) {
        if (actualConsumed) {
          actualConsumed.forEach(comp => {
            updateInventory(comp.productId, mo.locationSrc, -comp.quantity);
            processStockMove({
              id: `sm-consume-${Date.now()}-${comp.productId}`,
              productId: comp.productId,
              productQty: comp.quantity,
              locationSrc: mo.locationSrc,
              locationDest: mo.locationDest,
              moveType: "internal",
              status: "done",
              date: new Date().toISOString().split("T")[0],
              origin: mo.name,
            });
          });
        } else {
          bom.components.forEach(comp => {
            const totalQty = comp.quantity * mo.productQty * (1 + (comp.wastePercentage || 0) / 100);
            updateInventory(comp.productId, mo.locationSrc, -totalQty);
            processStockMove({
              id: `sm-consume-${Date.now()}-${comp.productId}`,
              productId: comp.productId,
              productQty: totalQty,
              locationSrc: mo.locationSrc,
              locationDest: mo.locationDest,
              moveType: "internal",
              status: "done",
              date: new Date().toISOString().split("T")[0],
              origin: mo.name,
            });
          });
        }

        const producedQty = actualProduced !== undefined ? actualProduced : mo.productQty;
        updateInventory(mo.productId, "company_stock", producedQty);
        processStockMove({
          id: `sm-produce-${Date.now()}`,
          productId: mo.productId,
          productQty: producedQty,
          locationSrc: mo.locationSrc,
          locationDest: "company_stock",
          moveType: "incoming",
          status: "done",
          date: new Date().toISOString().split("T")[0],
          origin: mo.name,
        });
      }

      return prev.map(m => {
        if (m.id === moId) {
          return { ...m, status: newStatus, qtyProduced: newStatus === "done" ? (actualProduced !== undefined ? actualProduced : m.productQty) : m.qtyProduced };
        }
        return m;
      });
    });
    syncToFirestore(erpDataService.manufacturingOrders, 'update', undefined, moId, { status: newStatus });
  };

  const createSO = (so: SalesOrder) => {
    setSalesOrders(prev => [...prev, so]);
    so.lines.forEach(line => {
      processStockMove({
        id: `sm-so-${Date.now()}-${line.productId}`,
        productId: line.productId,
        productQty: line.qty,
        locationSrc: "finished_goods",
        locationDest: "shipping_area",
        moveType: "outgoing",
        status: "draft",
        date: so.dateOrder,
        origin: so.name,
        reference: so.name,
      });
    });
    syncToFirestore(erpDataService.salesOrders, 'create', so);
  };

  const updateSOStatus = (soId: string, newStatus: SalesOrderStatus) => {
    setSalesOrders(prev => {
      const so = prev.find(s => s.id === soId);
      if (!so) return prev;

      if (so.status !== "done" && newStatus === "done") {
        so.lines.forEach(line => {
          updateInventory(line.productId, "finished_goods", -line.qty);
        });
        setStockMoves(prevMoves => prevMoves.map(move =>
          move.origin === soId ? { ...move, status: "done" } : move
        ));
      }

      if (so.status !== "done" && newStatus === "done") {
        createInvoice({
          id: `inv${Date.now()}`,
          name: `INV-${Date.now()}`,
          salesOrderId: so.id,
          customerId: so.customerId,
          invoiceLines: so.lines,
          amountUntaxed: so.amountUntaxed,
          amountTax: so.amountTax,
          amountTotal: so.amountTotal,
          amountDue: so.amountTotal,
          amountPaid: 0,
          status: "draft",
          invoiceDate: new Date().toISOString().split("T")[0],
          dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
        });
      }

      return prev.map(s => s.id === soId ? { ...s, status: newStatus } : s);
    });
    syncToFirestore(erpDataService.salesOrders, 'update', undefined, soId, { status: newStatus });
  };

  const createInvoice = (invoice: Invoice) => {
    setInvoices(prev => [...prev, invoice]);
    syncToFirestore(erpDataService.invoices, 'create', invoice);
  };

  const updateInvoiceStatus = (invoiceId: string, newStatus: InvoiceStatus) => {
    setInvoices(prev => prev.map(i => {
      if (i.id === invoiceId) {
        const updated = { ...i, status: newStatus };
        if (newStatus === "paid") {
          updated.paymentDate = new Date().toISOString().split("T")[0];
          updated.amountPaid = updated.amountTotal;
          updated.amountDue = 0;
        }
        return updated;
      }
      return i;
    }));
    syncToFirestore(erpDataService.invoices, 'update', undefined, invoiceId, { status: newStatus });
  };

  const addCustomer = async (customer: Customer) => {
    setCustomers(prev => [...prev, customer]);
    await syncToFirestore(erpDataService.customers, 'create', customer);
  };

  const addVendor = async (vendor: Vendor) => {
    setVendors(prev => [...prev, vendor]);
    await syncToFirestore(erpDataService.vendors, 'create', vendor);
  };

  const addEmployee = async (employee: Employee) => {
    setEmployees(prev => [...prev, employee]);
    await syncToFirestore(erpDataService.employees, 'create', employee);
  };

  const createRFQ = async (rfq: RFQ) => {
    setRFQs(prev => [...prev, rfq]);
    await syncToFirestore(erpDataService.rfqs, 'create', rfq);
  };

  const updateRFQStatus = async (rfqId: string, newStatus: RFQStatus) => {
    setRFQs(prev => prev.map(r => r.id === rfqId ? { ...r, status: newStatus } : r));
    await syncToFirestore(erpDataService.rfqs, 'update', undefined, rfqId, { status: newStatus });
  };

  const addPricingRule = async (rule: PricingRule) => {
    setPricingRules(prev => [...prev, rule]);
    await syncToFirestore(erpDataService.pricingRules, 'create', rule);
  };

  const createQualityCheck = async (qc: QualityCheck) => {
    setQualityChecks(prev => [...prev, qc]);
    await syncToFirestore(erpDataService.qualityChecks, 'create', qc);
  };

  const updateQualityCheckStatus = async (qcId: string, newStatus: QCStatus, result?: "pass" | "fail" | "pending") => {
    setQualityChecks(prev => prev.map(q => {
      if (q.id === qcId) {
        const updated = { ...q, status: newStatus };
        if (result) updated.result = result;
        return updated;
      }
      return q;
    }));
    await syncToFirestore(erpDataService.qualityChecks, 'update', undefined, qcId, { status: newStatus, result });
  };

  const createPO = (po: PurchaseOrder) => {
    setPurchaseOrders(prev => [...prev, po]);
    po.lines.forEach(line => {
      processStockMove({
        id: `sm-po-${Date.now()}-${line.productId}`,
        productId: line.productId,
        productQty: line.qty,
        locationSrc: "shipping_area",
        locationDest: po.destination || "dry_storage",
        moveType: "incoming",
        status: "draft",
        date: po.dateOrder,
        origin: po.name,
        reference: po.name,
      });
    });
    syncToFirestore(erpDataService.purchaseOrders, 'create', po);
  };

  const updatePOStatus = (poId: string, newStatus: PurchaseOrderStatus) => {
    setPurchaseOrders(prev => {
      const po = prev.find(p => p.id === poId);
      if (!po) return prev;

      if (po.status !== "done" && newStatus === "done") {
        po.lines.forEach(line => {
          updateInventory(line.productId, po.destination || "dry_storage", line.qty);
        });
        setStockMoves(prevMoves => prevMoves.map(move =>
          move.origin === poId ? { ...move, status: "done" } : move
        ));
      }

      return prev.map(p => p.id === poId ? { ...p, status: newStatus } : p);
    });
    syncToFirestore(erpDataService.purchaseOrders, 'update', undefined, poId, { status: newStatus });
  };

  const updatePO = (poId: string, updates: Partial<PurchaseOrder>) => {
    setPurchaseOrders(prev => prev.map(p => p.id === poId ? { ...p, ...updates } : p));
    syncToFirestore(erpDataService.purchaseOrders, 'update', undefined, poId, updates);
  };

  const createAccount = async (account: Account) => {
    setAccounts(prev => [...prev, account]);
    await syncToFirestore(erpDataService.accounts, 'create', account);
  };

  const createJournalEntry = async (entry: JournalEntry) => {
    setJournalEntries(prev => [...prev, entry]);
    await syncToFirestore(erpDataService.journalEntries, 'create', entry);
  };

  const postJournalEntry = async (entryId: string) => {
    setJournalEntries(prev => prev.map(e => {
      if (e.id === entryId) {
        return { ...e, posted: true, postedDate: new Date().toISOString().split("T")[0] };
      }
      return e;
    }));
    await syncToFirestore(erpDataService.journalEntries, 'update', undefined, entryId, { posted: true, postedDate: new Date().toISOString().split("T")[0] });
  };

  const createBankStatement = async (statement: BankStatement) => {
    setBankStatements(prev => [...prev, statement]);
    await syncToFirestore(erpDataService.bankStatements, 'create', statement);
  };

  const createPayment = async (payment: Payment) => {
    setPayments(prev => [...prev, payment]);
    await syncToFirestore(erpDataService.payments, 'create', payment);
  };

  const reconcileBankLine = (lineId: string, journalEntryId?: string) => {
    setBankStatements(prev => prev.map(bs => ({
      ...bs,
      lines: bs.lines.map(line => {
        if (line.id === lineId) {
          return { ...line, reconciled: true, journalEntryId };
        }
        return line;
      })
    })));
  };

  const processStockMove = (move: StockMove) => {
    setStockMoves(prev => [...prev, move]);
    syncToFirestore(erpDataService.stockMoves, 'create', move);
  };

  return (
    <ErpContext.Provider
      value={{
        products,
        inventory,
        boms,
        manufacturingOrders,
        salesOrders,
        invoices,
        customers,
        vendors,
        purchaseOrders,
        rfqs,
        pricingRules,
        qualityChecks,
        stockMoves,
        employees,
        accounts,
        journalEntries,
        bankStatements,
        payments,
        addProduct,
        updateProduct,
        deleteProduct,
        updateInventory,
        addBom,
        createMO,
        updateMOStatus,
        createSO,
        updateSOStatus,
        createInvoice,
        updateInvoiceStatus,
        addCustomer,
        addVendor,
        addEmployee,
        createRFQ,
        updateRFQStatus,
        addPricingRule,
        createQualityCheck,
        updateQualityCheckStatus,
        createPO,
        updatePOStatus,
        updatePO,
        processStockMove,
        createAccount,
        createJournalEntry,
        postJournalEntry,
        createBankStatement,
        createPayment,
        reconcileBankLine,
      }}
    >
      {children}
    </ErpContext.Provider>
  );
};

export const useErp = () => {
  const context = useContext(ErpContext);
  if (context === undefined) {
    throw new Error("useErp must be used within an ErpProvider");
  }
  return context;
};