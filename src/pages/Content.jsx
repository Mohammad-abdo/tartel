import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { contentAPI, pagesAPI } from '../services/api';
import { FiFile, FiCheckCircle, FiXCircle, FiEdit2, FiGlobe, FiImage }from 'react-icons/fi';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';
import HeroTab from '../components/hero/HeroTab';
const SITE_PAGE_SLUGS = [
  { slug: 'about', labelEn: 'About', labelAr: 'من نحن' },
  { slug: 'app', labelEn: 'App', labelAr: 'التطبيق' },
  { slug: 'policy', labelEn: 'Policy', labelAr: 'السياسة' },
  { slug: 'privacy', labelEn: 'Privacy', labelAr: 'الخصوصية' },
];

const Content = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [activeTab, setActiveTab] = useState('content'); // 'content' | 'pages'
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  // Site pages state
  const [sitePages, setSitePages] = useState([]);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [editingSlug, setEditingSlug] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', titleAr: '', body: '', bodyAr: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (activeTab === 'content') fetchContent();
    if (activeTab === 'pages') fetchSitePages();
  }, [activeTab, page, statusFilter]);

  const fetchContent = async () => {
    setLoading(true);
    try {
      let response;
      if (statusFilter === 'PENDING') {
        response = await contentAPI.getPendingContent({ page, limit: 20 });
      } else {
        const params = { page, limit: 20, ...(statusFilter && { status: statusFilter }) };
        response = await contentAPI.getAllContent(params);
      }
      const raw = response.data;
      const list = raw?.data ?? raw?.content ?? (Array.isArray(raw) ? raw : []);
      const total = raw?.totalPages ?? raw?.pagination?.totalPages ?? 1;
      setContent(Array.isArray(list) ? list : []);
      setTotalPages(typeof total === 'number' ? total : 1);
    } catch (error) {
      console.error('Failed to fetch content:', error);
      setContent([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchSitePages = async () => {
    setPagesLoading(true);
    try {
      const res = await pagesAPI.getAll();
      const list = res?.data?.data ?? res?.data ?? (Array.isArray(res?.data) ? res.data : []);
      setSitePages(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Failed to fetch site pages:', error);
      setSitePages([]);
    } finally {
      setPagesLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await contentAPI.approveContent(id, {});
      fetchContent();
    } catch (error) {
      console.error('Failed to approve content:', error);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt(t('content.rejectionReasonPrompt'));
    if (reason) {
      try {
        await contentAPI.rejectContent(id, { reason });
        fetchContent();
      } catch (error) {
        console.error('Failed to reject content:', error);
      }
    }
  };

  const openPageEditor = (p) => {
    setEditingSlug(p.slug);
    setEditForm({
      title: p.title || '',
      titleAr: p.titleAr || '',
      body: p.body || '',
      bodyAr: p.bodyAr || '',
    });
  };

  const closePageEditor = () => {
    setEditingSlug(null);
    setEditForm({ title: '', titleAr: '', body: '', bodyAr: '' });
  };

  const savePage = async () => {
    if (!editingSlug) return;
    setSaving(true);
    try {
      await pagesAPI.update(editingSlug, editForm);
      await fetchSitePages();
      closePageEditor();
    } catch (error) {
      console.error('Failed to save page:', error);
    } finally {
      setSaving(false);
    }
  };

  const getPageBySlug = (slug) => sitePages.find((p) => p.slug === slug) || { slug, title: '', titleAr: '', body: '', bodyAr: '' };
  const getStatusBadge = (status) => {
    const badges = {
      APPROVED: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200',
      PENDING: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200',
      REJECTED: 'bg-red-50 text-red-800 ring-1 ring-red-200',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6 2xl:space-y-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wide text-primary-600 uppercase mb-1">{t('content.title')}</p>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">{t('content.title')}</h1>
          <p className="text-gray-500 mt-1 text-sm">{t('content.subtitle')}</p>
        </div>
      </div>

      {/* Tabs: Content | Site pages */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-1" dir={isRTL ? 'rtl' : 'ltr'}>

          <button
            onClick={() => setActiveTab('pages')}
            className={cn(
              'px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 -mb-px transition-colors flex items-center gap-2',
              activeTab === 'pages'
                ? 'border-primary-600 text-primary-600 bg-primary-50/50 dark:bg-primary-900/20'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800'
            )}
          >
            <FiGlobe className="size-4" />
            {isRTL ? 'صفحات الموقع' : 'Site pages'}
          </button>
           <button
      onClick={() => setActiveTab('hero')}
      className={cn(
        'px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 -mb-px transition-colors flex items-center gap-2',
        activeTab === 'hero'
          ? 'border-primary-600 text-primary-600 bg-primary-50/50 dark:bg-primary-900/20'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800'
      )}
    >
      <FiImage className="size-4" />
      {isRTL ? 'الشريط المتحرك' : 'Hero Slider'}
    </button>
        </nav>
      </div>
{activeTab === 'hero' && <HeroTab />}
      {activeTab === 'pages' && (
        <>
          {editingSlug ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {isRTL ? 'تعديل الصفحة' : 'Edit page'} – {SITE_PAGE_SLUGS.find((s) => s.slug === editingSlug)?.[isRTL ? 'labelAr' : 'labelEn']}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{isRTL ? 'العنوان (إنجليزي)' : 'Title (English)'}</label>
                  <input
                    value={editForm.title}
                    onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{isRTL ? 'العنوان (عربي)' : 'Title (Arabic)'}</label>
                  <input
                    value={editForm.titleAr}
                    onChange={(e) => setEditForm((f) => ({ ...f, titleAr: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{isRTL ? 'المحتوى (إنجليزي)' : 'Body (English)'}</label>
                  <textarea
                    value={editForm.body}
                    onChange={(e) => setEditForm((f) => ({ ...f, body: e.target.value }))}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{isRTL ? 'المحتوى (عربي)' : 'Body (Arabic)'}</label>
                  <textarea
                    value={editForm.bodyAr}
                    onChange={(e) => setEditForm((f) => ({ ...f, bodyAr: e.target.value }))}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    dir="rtl"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={savePage} disabled={saving}>
                    {saving ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : isRTL ? 'حفظ' : 'Save'}
                  </Button>
                  <Button variant="outline" onClick={closePageEditor} disabled={saving}>
                    {isRTL ? 'إلغاء' : 'Cancel'}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
              {pagesLoading ? (
                <div className="flex items-center justify-center py-14">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
                    <p className="text-sm text-gray-500">{t('common.loading') || 'Loading...'}</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5">
                  {SITE_PAGE_SLUGS.map(({ slug, labelEn, labelAr }) => {
                    const p = getPageBySlug(slug);
                    const label = isRTL ? labelAr : labelEn;
                    return (
                      <div
                        key={slug}
                        className="border border-gray-200 dark:border-gray-600 rounded-xl p-4 hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
                            <FiGlobe className="size-5 text-primary-600 dark:text-primary-400" />
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-white">{label}</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                          {(p.title || p.titleAr || label)}
                        </p>
                        <Button variant="outline" size="sm" className="w-full" onClick={() => openPageEditor(p)}>
                          <FiEdit2 className="size-4 mr-2 rtl:ml-2 rtl:mr-0" />
                          {isRTL ? 'تعديل' : 'Edit'}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {activeTab === 'content' && (
        <>
          <div className="bg-white rounded-2xl shadow-sm p-4 md:p-5 border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none min-w-[170px]"
              >
                <option value="">{t('users.allStatus')}</option>
                <option value="APPROVED">{t('content.approved')}</option>
                <option value="PENDING">{t('dashboard.pending')}</option>
                <option value="REJECTED">{t('content.rejected')}</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-14">
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
                  <p className="text-sm text-gray-500">{t('common.loading') || 'Loading...'}</p>
                </div>
              </div>
            ) : content.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <div className="h-14 w-14 rounded-full bg-primary-50 flex items-center justify-center mb-4">
                  <FiFile className="text-primary-600 text-2xl" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">{t('content.noContent') || 'No content found'}</h2>
                <p className="text-sm text-gray-500 max-w-md">Try changing the filter.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700/50">
                      <tr>
                        <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('content.content')}</th>
                        <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('content.author')}</th>
                        <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('content.type')}</th>
                        <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('common.status')}</th>
                        <th className="px-6 py-3 text-end text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('common.actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {content.map((item) => (
                        <tr key={item.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                                <FiFile className="size-5 text-orange-600 dark:text-orange-400" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{item.description?.slice(0, 50)}...</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{item.teacher?.user?.name || t('common.notAvailable')}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{item.type || t('common.notAvailable')}</td>
                          <td className="px-6 py-4">
                            <span className={cn('px-2.5 py-1 rounded-full text-xs font-semibold', getStatusBadge(item.status))}>
                              {item.status === 'APPROVED' ? t('content.approved') : item.status === 'PENDING' ? t('dashboard.pending') : t('content.rejected')}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {item.status === 'PENDING' && (
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleApprove(item.id)} title={t('content.approve')} className="text-emerald-600 hover:bg-emerald-50">
                                  <FiCheckCircle className="size-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleReject(item.id)} title={t('content.reject')} className="text-red-600 hover:bg-red-50">
                                  <FiXCircle className="size-4" />
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6">
                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">{t('common.previous')}</button>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t('users.pageOf', { page, totalPages })}</span>
                    <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">{t('common.next')}</button>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

    </div>
  );
};

export default Content;
