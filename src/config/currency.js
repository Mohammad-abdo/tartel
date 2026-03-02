/**
 * العملة الموحدة في النظام (الافتراضي: الجنيه المصري)
 * Unified system currency (default: Egyptian Pound). Actual value comes from API/settings.
 */
export const CURRENCY_CODE = 'EGP';
export const CURRENCY_SYMBOL = 'ج.م';
export const CURRENCY_NAME_AR = 'جنيه مصري';
export const CURRENCY_NAME_EN = 'Egyptian Pound';

/** قائمة العملات المتاحة في الإعدادات */
export const CURRENCIES = [
  { code: 'EGP', symbol: 'ج.م', nameAr: 'جنيه مصري', nameEn: 'Egyptian Pound' },
  { code: 'USD', symbol: '$', nameAr: 'دولار أمريكي', nameEn: 'US Dollar' },
  { code: 'SAR', symbol: 'ر.س', nameAr: 'ريال سعودي', nameEn: 'Saudi Riyal' },
  { code: 'AED', symbol: 'د.إ', nameAr: 'درهم إماراتي', nameEn: 'UAE Dirham' },
  { code: 'KWD', symbol: 'د.ك', nameAr: 'دينار كويتي', nameEn: 'Kuwaiti Dinar' },
];

const defaultCurrency = { code: CURRENCY_CODE, symbol: CURRENCY_SYMBOL, nameAr: CURRENCY_NAME_AR, nameEn: CURRENCY_NAME_EN };

/**
 * إنشاء دالة تنسيق عملة حسب إعداد معين
 */
export function createFormatCurrency(currency = defaultCurrency) {
  const sym = currency?.symbol ?? CURRENCY_SYMBOL;
  return function formatCurrency(amount, options = {}) {
    const n = Number(amount) || 0;
    const decimals = options.decimals !== undefined ? options.decimals : 2;
    const symbol = options.symbol !== undefined ? options.symbol : true;
    const formatted = n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    return symbol ? `${formatted} ${sym}` : formatted;
  };
}

/**
 * تنسيق مبلغ بالعملة الافتراضية (يُستخدم عند عدم توفر السياق)
 */
export const formatCurrency = createFormatCurrency(defaultCurrency);
