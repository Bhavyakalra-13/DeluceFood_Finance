// Financial reporting types and interfaces

export interface FinancialData {
    // Balance Sheet
    assets: {
        currentAssets: {
            cash: number;
            accountsReceivable: number;
            inventory: number;
            prepaidExpenses: number;
            otherCurrentAssets: number;
        };
        fixedAssets: {
            propertyPlantEquipment: number;
            accumulatedDepreciation: number;
            netFixedAssets: number;
        };
        totalAssets: number;
    };

    liabilities: {
        currentLiabilities: {
            accountsPayable: number;
            accruedExpenses: number;
            shortTermDebt: number;
            otherCurrentLiabilities: number;
        };
        longTermLiabilities: {
            longTermDebt: number;
            otherLongTermLiabilities: number;
        };
        totalLiabilities: number;
    };

    equity: {
        ownerEquity: number;
        retainedEarnings: number;
        totalEquity: number;
    };

    // Profit & Loss
    revenue: {
        grossSales: number;
        salesReturns: number;
        netSales: number;
    };

    costOfGoodsSold: {
        openingInventory: number;
        purchases: number;
        closingInventory: number;
        totalCOGS: number;
    };

    operatingExpenses: {
        salaries: number;
        rent: number;
        utilities: number;
        marketing: number;
        depreciation: number;
        otherOperatingExpenses: number;
        totalOperatingExpenses: number;
    };

    netIncome: {
        grossProfit: number;
        operatingIncome: number;
        otherIncome: number;
        interestExpense: number;
        taxes: number;
        netIncome: number;
    };

    // Cash Flow
    cashFlow: {
        operating: {
            netIncome: number;
            depreciation: number;
            changesInWorkingCapital: number;
            netOperatingCashFlow: number;
        };
        investing: {
            capitalExpenditures: number;
            assetPurchases: number;
            netInvestingCashFlow: number;
        };
        financing: {
            debtIssuance: number;
            debtRepayment: number;
            ownerDrawings: number;
            netFinancingCashFlow: number;
        };
        netCashFlow: number;
        beginningCash: number;
        endingCash: number;
    };

    // Tax Information
    taxInfo: {
        gstCollected: number;
        gstPaid: number;
        netGST: number;
        incomeTax: number;
        totalTaxLiability: number;
    };
}

export interface Expense {
    id: string;
    date: string;
    amount: number;
    description: string;
    category: string;
    vendor: string;
    receiptUrl?: string;
    status: 'pending' | 'approved' | 'rejected';
    approvedBy?: string;
    approvedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ExpenseCategory {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
    createdAt: string;
}

export interface Vendor {
    id: string;
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: string;
    gstNumber?: string;
    paymentTerms: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface DateRange {
    startDate: string;
    endDate: string;
}

export interface ReportFilters {
    dateRange: DateRange;
    category?: string;
    vendor?: string;
    status?: string;
}
