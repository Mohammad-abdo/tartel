import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
import Sidebar from './Sidebar';
import Header from './Header';
import { AdminInboxProvider } from '../../context/AdminInboxContext';
import { cn } from '../../lib/utils';

const SIDEBAR_WIDTH_EXPANDED = 256; /* w-64 */
const SIDEBAR_WIDTH_COLLAPSED = 80; /* w-20 */

const DashboardLayout = ({ children }) => {
  const { language } = useLanguage();
  const { t } = useTranslation();
  const isRTL = language === 'ar';
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const sidebarWidth = sidebarCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;

  return (
    <div
      className={cn(
        'flex min-h-screen text-gray-900 dark:text-white font-sans',
        isRTL ? 'rtl' : 'ltr'
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <a href="#main-content" className="skip-link">
        {t('common.skipToContent') || 'Skip to main content'}
      </a>
      <AdminInboxProvider>
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        />
        <div
          className="flex min-w-0 flex-1 flex-col transition-[margin] duration-200 ease-out"
          style={{ [isRTL ? 'marginRight' : 'marginLeft']: `${sidebarWidth}px` }}
        >
          <Header />
          <main
            id="main-content"
            className="min-w-0 flex-1 bg-gray-50 p-3 dark:bg-gray-900 sm:p-4 md:p-6 lg:p-8"
            role="main"
          >
            <div className="mx-auto w-full max-w-full xl:max-w-content 2xl:max-w-content-xl 3xl:max-w-content-2xl 4xl:max-w-content-3xl">
              {children}
            </div>
          </main>
        </div>
      </AdminInboxProvider>
    </div>
  );
};

export default DashboardLayout;
