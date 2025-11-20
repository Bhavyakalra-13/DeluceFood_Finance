import { collection, getDocs, query, where } from "firebase/firestore";
import db from "./firestore";
import { DateRange, Expense } from "@/types/financial";
import { Invoice, Product } from "@/types/invoice";

export interface DashboardStats {
    totalRevenue: number;
    totalInvoices: number;
    pendingPayments: number;
    activeCustomers: number;
    revenueGrowthRate: number;
    invoiceGrowthRate: number;
    paymentGrowthRate: number;
    customerGrowthRate: number;
}

export interface FinancialCalculations {
    // Revenue calculations
    totalRevenue: number;
    accountsReceivable: number;

    // Expense calculations
    totalOperatingExpenses: number;
    salaries: number;
    rent: number;
    utilities: number;
    marketing: number;
    depreciation: number;
    otherOperatingExpenses: number;

    // Inventory calculations
    inventoryValue: number;
    openingInventory: number;
    purchases: number;
    closingInventory: number;
    totalCOGS: number;

    // Cash calculations
    cash: number;
    beginningCash: number;
    endingCash: number;

    // Tax calculations
    gstCollected: number;
    gstPaid: number;
    incomeTax: number;
}

export class FinancialCalculationService {
    private static instance: FinancialCalculationService;

    private constructor() { }

    public static getInstance(): FinancialCalculationService {
        if (!FinancialCalculationService.instance) {
            FinancialCalculationService.instance = new FinancialCalculationService();
        }
        return FinancialCalculationService.instance;
    }

    async calculateDashboardStats(dateRange: DateRange): Promise<DashboardStats> {
        try {
            console.log("Calculating dashboard stats for date range:", dateRange);

            // Get current period data
            const currentData = await this.getFinancialDataForPeriod(dateRange);
            console.log("Current period data:", currentData);

            // Get previous period data for growth calculations
            const previousPeriodStart = new Date(dateRange.startDate);
            const previousPeriodEnd = new Date(dateRange.endDate);
            const periodLength = previousPeriodEnd.getTime() - previousPeriodStart.getTime();

            previousPeriodEnd.setTime(previousPeriodStart.getTime());
            previousPeriodStart.setTime(previousPeriodStart.getTime() - periodLength);

            const previousData = await this.getFinancialDataForPeriod({
                startDate: previousPeriodStart.toISOString().split('T')[0],
                endDate: previousPeriodEnd.toISOString().split('T')[0]
            });
            console.log("Previous period data:", previousData);

            // Calculate growth rates
            const revenueGrowthRate = this.calculateGrowthRate(
                previousData.totalRevenue,
                currentData.totalRevenue
            );
            const invoiceGrowthRate = this.calculateGrowthRate(
                previousData.totalInvoices,
                currentData.totalInvoices
            );
            const paymentGrowthRate = this.calculateGrowthRate(
                previousData.pendingPayments,
                currentData.pendingPayments
            );
            const customerGrowthRate = this.calculateGrowthRate(
                previousData.activeCustomers,
                currentData.activeCustomers
            );

            const result = {
                totalRevenue: currentData.totalRevenue,
                totalInvoices: currentData.totalInvoices,
                pendingPayments: currentData.pendingPayments,
                activeCustomers: currentData.activeCustomers,
                revenueGrowthRate,
                invoiceGrowthRate,
                paymentGrowthRate,
                customerGrowthRate
            };

            console.log("Dashboard stats result:", result);
            return result;
        } catch (error) {
            console.error("Error calculating dashboard stats:", error);
            throw error;
        }
    }

    async calculateFinancialData(dateRange: DateRange): Promise<FinancialCalculations> {
        try {
            console.log("Calculating financial data for date range:", dateRange);

            // Get invoices for revenue calculation
            const invoicesQuery = query(
                collection(db, "invoices"),
                where("invoiceDate", ">=", dateRange.startDate),
                where("invoiceDate", "<=", dateRange.endDate)
            );
            const invoicesSnapshot = await getDocs(invoicesQuery);
            const invoices = invoicesSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Invoice[];
            console.log("Found invoices for financial data:", invoices.length, invoices);

            // Calculate revenue
            const totalRevenue = this.calculateTotalRevenue(invoices);
            const accountsReceivable = this.calculateAccountsReceivable(invoices);
            console.log("Revenue calculations:", { totalRevenue, accountsReceivable });

            // Get expenses for operating expenses calculation
            const expensesQuery = query(
                collection(db, "expenses"),
                where("date", ">=", dateRange.startDate),
                where("date", "<=", dateRange.endDate),
                where("status", "==", "approved")
            );
            const expensesSnapshot = await getDocs(expensesQuery);
            const expenses = expensesSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Expense[];
            console.log("Found expenses:", expenses.length, expenses);

            // Calculate operating expenses
            const operatingExpenses = this.calculateOperatingExpenses(expenses);
            console.log("Operating expenses:", operatingExpenses);

            // Get inventory data
            const productsQuery = query(collection(db, "products"));
            const productsSnapshot = await getDocs(productsQuery);
            const products = productsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Product[];
            console.log("Found products:", products.length, products);

            // Calculate inventory values
            const inventoryValue = this.calculateInventoryValue(products);
            const inventoryCalculations = this.calculateInventoryCalculations(inventoryValue);
            console.log("Inventory calculations:", { inventoryValue, ...inventoryCalculations });

            // Calculate cash (simplified - in real app, this would come from bank transactions)
            const cash = this.calculateCash(totalRevenue, operatingExpenses.totalOperatingExpenses);

            // Calculate taxes
            const taxCalculations = this.calculateTaxes(totalRevenue, operatingExpenses.totalOperatingExpenses);
            console.log("Tax calculations:", taxCalculations);

            const result = {
                totalRevenue,
                accountsReceivable,
                ...operatingExpenses,
                inventoryValue,
                ...inventoryCalculations,
                cash,
                beginningCash: cash * 0.8, // Simplified calculation
                endingCash: cash,
                ...taxCalculations
            };

            console.log("Final financial calculations result:", result);
            return result;
        } catch (error) {
            console.error("Error calculating financial data:", error);
            throw error;
        }
    }

    private async getFinancialDataForPeriod(dateRange: DateRange) {
        console.log("Getting financial data for period:", dateRange);

        // Get invoices
        const invoicesQuery = query(
            collection(db, "invoices"),
            where("invoiceDate", ">=", dateRange.startDate),
            where("invoiceDate", "<=", dateRange.endDate)
        );
        const invoicesSnapshot = await getDocs(invoicesQuery);
        const invoices = invoicesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Invoice[];
        console.log("Found invoices:", invoices.length, invoices);

        // Get customers
        const customersQuery = query(collection(db, "customers"));
        const customersSnapshot = await getDocs(customersQuery);
        const customers = customersSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        console.log("Found customers:", customers.length, customers);

        const totalRevenue = this.calculateTotalRevenue(invoices);
        const pendingPayments = this.calculateAccountsReceivable(invoices);
        const activeCustomers = customers.length;
        const totalInvoices = invoices.length;

        console.log("Calculated values:", {
            totalRevenue,
            pendingPayments,
            activeCustomers,
            totalInvoices
        });

        return {
            totalRevenue,
            pendingPayments,
            activeCustomers,
            totalInvoices
        };
    }

    private calculateTotalRevenue(invoices: Invoice[]): number {
        return invoices.reduce((sum, invoice) => {
            const price = Number(invoice.price) || 0;
            const quantity = Number(invoice.quantity) || 0;
            const taxRate = Number(invoice.taxRate) || 0;
            const discount = Number(invoice.discount) || 0;
            const subtotal = price * quantity;
            const taxAmount = (subtotal * taxRate) / 100;
            const total = subtotal + taxAmount - discount;
            return sum + total;
        }, 0);
    }

    private calculateAccountsReceivable(invoices: Invoice[]): number {
        return invoices
            .filter((invoice) => invoice.paymentStatus !== "Paid")
            .reduce((sum, invoice) => {
                const price = Number(invoice.price) || 0;
                const quantity = Number(invoice.quantity) || 0;
                const taxRate = Number(invoice.taxRate) || 0;
                const discount = Number(invoice.discount) || 0;
                const subtotal = price * quantity;
                const taxAmount = (subtotal * taxRate) / 100;
                const total = subtotal + taxAmount - discount;
                return sum + total;
            }, 0);
    }

    private calculateOperatingExpenses(expenses: Expense[]): {
        totalOperatingExpenses: number;
        salaries: number;
        rent: number;
        utilities: number;
        marketing: number;
        depreciation: number;
        otherOperatingExpenses: number;
    } {
        const expensesByCategory = expenses.reduce((acc, expense) => {
            const category = expense.category || 'other';
            const amount = Number(expense.amount) || 0;
            acc[category] = (acc[category] || 0) + amount;
            return acc;
        }, {} as Record<string, number>);

        const salaries = expensesByCategory['Salaries'] || expensesByCategory['salaries'] || 0;
        const rent = expensesByCategory['Rent'] || expensesByCategory['rent'] || 0;
        const utilities = expensesByCategory['Utilities'] || expensesByCategory['utilities'] || 0;
        const marketing = expensesByCategory['Marketing'] || expensesByCategory['marketing'] || 0;
        const depreciation = expensesByCategory['Depreciation'] || expensesByCategory['depreciation'] || 0;
        const otherOperatingExpenses = (Object.entries(expensesByCategory) as [string, number][])
            .filter(([category]) => !['Salaries', 'salaries', 'Rent', 'rent', 'Utilities', 'utilities', 'Marketing', 'marketing', 'Depreciation', 'depreciation'].includes(category))
            .reduce((sum, [, amount]) => sum + amount, 0);

        const totalOperatingExpenses = salaries + rent + utilities + marketing + depreciation + otherOperatingExpenses;

        return {
            totalOperatingExpenses,
            salaries,
            rent,
            utilities,
            marketing,
            depreciation,
            otherOperatingExpenses
        };
    }

    private calculateInventoryValue(products: Product[]): number {
        return products.reduce((sum, product) => {
            const price = Number(product.price) || 0;
            const stock = Number(product.stock) || 0;
            return sum + price * stock;
        }, 0);
    }

    private calculateInventoryCalculations(inventoryValue: number): {
        openingInventory: number;
        purchases: number;
        closingInventory: number;
        totalCOGS: number;
    } {
        // These are simplified calculations - in a real app, you'd track actual inventory movements
        const openingInventory = inventoryValue * 0.8;
        const purchases = inventoryValue * 0.3;
        const closingInventory = inventoryValue;
        const totalCOGS = openingInventory + purchases - closingInventory;

        return {
            openingInventory,
            purchases,
            closingInventory,
            totalCOGS
        };
    }

    private calculateCash(revenue: number, expenses: number): number {
        // Simplified cash calculation - in real app, this would come from bank transactions
        return Math.max(0, revenue - expenses) * 0.1; // Assume 10% of net income as cash
    }

    private calculateTaxes(revenue: number, expenses: number): {
        gstCollected: number;
        gstPaid: number;
        incomeTax: number;
    } {
        const gstCollected = revenue * 0.18; // 18% GST
        const gstPaid = expenses * 0.18; // 18% GST on expenses
        const netIncome = revenue - expenses;
        const incomeTax = Math.max(0, netIncome * 0.25); // 25% income tax

        return {
            gstCollected,
            gstPaid,
            incomeTax
        };
    }

    private calculateGrowthRate(previousValue: number, currentValue: number): number {
        if (previousValue === 0) return currentValue > 0 ? 100 : 0;
        return ((currentValue - previousValue) / previousValue) * 100;
    }
}

export const financialCalculationService = FinancialCalculationService.getInstance();
