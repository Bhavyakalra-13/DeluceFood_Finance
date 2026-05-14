"use client";

import useLocalStorage from "./useLocalStorage";

export const useCurrency = () => {
  const [companyInfo] = useLocalStorage("companyInfo", {
    name: "Deluce Food Industry",
    taxId: "TAX-123456",
    currency: "USD",
    timezone: "UTC-5 (Eastern Time)",
    dateFormat: "MM/DD/YYYY"
  });

  const getCurrencySymbol = (currencyCode: string) => {
    switch (currencyCode) {
      case "EUR": return "€";
      case "GBP": return "£";
      case "INR": return "₹";
      case "USD":
      default: return "$";
    }
  };

  const symbol = getCurrencySymbol(companyInfo?.currency || "USD");

  const formatCurrency = (amount: number) => {
    return `${symbol}${amount.toFixed(2)}`;
  };

  return { formatCurrency, symbol, currencyCode: companyInfo?.currency || "USD" };
};
