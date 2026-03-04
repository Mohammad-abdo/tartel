import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { settingsAPI } from '../services/api';
import { createFormatCurrency, CURRENCIES } from '../config/currency';

const defaultCurrency = CURRENCIES[0]; // EGP
const defaultSidebar = {
  logoUrl: '',
  titleAr: 'ترتيل',
  titleEn: 'Tarteel',
  subtitleAr: 'منصة حفظ القرآن',
  subtitleEn: 'Quran memorization platform',
};

const CurrencyContext = createContext(null);

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(defaultCurrency);
  const [sidebar, setSidebar] = useState(defaultSidebar);
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
      const s = data?.sidebar;
      if (s && typeof s === 'object') {
        setSidebar({
          logoUrl: s.logoUrl ?? defaultSidebar.logoUrl,
          titleAr: s.titleAr ?? defaultSidebar.titleAr,
          titleEn: s.titleEn ?? defaultSidebar.titleEn,
          subtitleAr: s.subtitleAr ?? defaultSidebar.subtitleAr,
          subtitleEn: s.subtitleEn ?? defaultSidebar.subtitleEn,
        });
      }
    } catch (_) {
      setCurrency(defaultCurrency);
      setSidebar(defaultSidebar);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, []);

  const formatCurrency = useMemo(() => createFormatCurrency(currency), [currency]);

  const updateSettings = async (payload) => {
    await settingsAPI.updateSettings(payload);
    // Always refetch from server so UI is in sync (handles backend response wrapper)
    await refetch();
  };

  const value = useMemo(
    () => ({
      currency,
      sidebar,
      formatCurrency,
      loading,
      refetch,
      updateSettings,
      currencies: CURRENCIES,
    }),
    [currency, sidebar, formatCurrency, loading]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    return {
      currency: defaultCurrency,
      sidebar: defaultSidebar,
      formatCurrency: createFormatCurrency(defaultCurrency),
      loading: false,
      refetch: () => {},
      updateSettings: async () => {},
      currencies: CURRENCIES,
    };
  }
  return context;
};
