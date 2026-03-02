import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { settingsAPI } from '../services/api';
import { createFormatCurrency, CURRENCIES } from '../config/currency';

const defaultCurrency = CURRENCIES[0]; // EGP

const CurrencyContext = createContext(null);

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(defaultCurrency);
  const [loading, setLoading] = useState(true);

  const refetch = async () => {
    try {
      const res = await settingsAPI.getSettings();
      const data = res?.data ?? res;
      const c = data?.currency;
      if (c && (c.code || c.symbol)) {
        setCurrency({
          code: c.code || defaultCurrency.code,
          symbol: c.symbol ?? defaultCurrency.symbol,
          nameAr: c.nameAr ?? defaultCurrency.nameAr,
          nameEn: c.nameEn ?? defaultCurrency.nameEn,
        });
      }
    } catch (_) {
      setCurrency(defaultCurrency);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, []);

  const formatCurrency = useMemo(() => createFormatCurrency(currency), [currency]);

  const updateSettings = async (payload) => {
    const res = await settingsAPI.updateSettings(payload);
    const data = res?.data ?? res;
    const c = data?.currency;
    if (c && (c.code || c.symbol)) {
      setCurrency({
        code: c.code || defaultCurrency.code,
        symbol: c.symbol ?? defaultCurrency.symbol,
        nameAr: c.nameAr ?? defaultCurrency.nameAr,
        nameEn: c.nameEn ?? defaultCurrency.nameEn,
      });
    }
  };

  const value = useMemo(
    () => ({
      currency,
      formatCurrency,
      loading,
      refetch,
      updateSettings,
      currencies: CURRENCIES,
    }),
    [currency, formatCurrency, loading]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    return {
      currency: defaultCurrency,
      formatCurrency: createFormatCurrency(defaultCurrency),
      loading: false,
      refetch: () => {},
      updateSettings: async () => {},
      currencies: CURRENCIES,
    };
  }
  return context;
};
