import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { certificateAPI } from '../services/api';
import { FiAward, FiPlus, FiTrash2, FiSearch } from 'react-icons/fi';
import { Card, CardContent } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';

const Certificates = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState('');
  const [viewMode, setViewMode] = useState('all');

  useEffect(() => {
    fetchCertificates();
  }, [viewMode, studentId]);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      let response;
      if (viewMode === 'student' && studentId) {
        response = await certificateAPI.getStudentCertificates(studentId);
        setCertificates(response.data || []);
      } else if (viewMode === 'teacher') {
        response = await certificateAPI.getTeacherCertificates();
        setCertificates(response.data || []);
      } else {
        setCertificates([]);
      }
    } catch (error) {
      console.error('Failed to fetch certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (id) => {
    const reason = prompt(t('certificates.revokeReason') || 'Reason for revocation:');
    if (reason) {
      try {
        await certificateAPI.revokeCertificate(id, reason);
        fetchCertificates();
      } catch (error) {
        console.error('Failed to revoke certificate:', error);
      }
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6 2xl:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">{t('certificates.title') || 'Certificates'}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{t('certificates.subtitle') || 'Manage student certificates'}</p>
        </div>
        <Button className="shrink-0">
          <FiPlus className="size-4" />
          {t('certificates.issue') || 'Issue Certificate'}
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-1 p-1 rounded-lg bg-muted w-fit">
              {['all', 'student', 'teacher'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-colors', viewMode === mode ? 'bg-card text-foreground shadow-tarteel-sm' : 'text-muted-foreground hover:text-foreground')}
                >
                  {mode === 'all' ? (t('common.all') || 'All') : mode === 'student' ? (t('certificates.byStudent') || 'By Student') : (t('certificates.byTeacher') || 'By Teacher')}
                </button>
              ))}
            </div>
            {viewMode === 'student' && (
              <div className={cn('relative flex-1 max-w-xs')}>
                <FiSearch className={cn('absolute top-1/2 -translate-y-1/2 text-muted-foreground size-4', isRTL ? 'right-3' : 'left-3')} />
                <input
                  type="text"
                  placeholder={t('certificates.studentId') || 'Student ID'}
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className={cn('w-full py-2.5 text-sm border border-input rounded-lg bg-muted/50 focus:bg-background focus:ring-2 focus:ring-ring focus:border-transparent outline-none', isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4')}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        {loading ? (
          <CardContent className="py-14">
            <div className="flex flex-col items-center gap-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </CardContent>
        ) : certificates.length === 0 ? (
          <CardContent className="py-16 text-center">
            <FiAward className="size-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-1">{t('certificates.noCertificates') || 'No certificates found'}</h2>
            <p className="text-sm text-muted-foreground">Change view or enter a student ID.</p>
          </CardContent>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('bookings.student')}</th>
                  <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('certificates.course')}</th>
                  <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('certificates.issuedDate') || 'Issued Date'}</th>
                  <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('common.status')}</th>
                  <th className="px-6 py-3 text-end text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {certificates.map((cert) => (
                  <tr key={cert.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                          <FiAward className="size-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{cert.student?.user?.name || cert.studentId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{cert.courseName || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{new Date(cert.issuedAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={cn('px-2.5 py-1 rounded-full text-xs font-semibold', cert.revoked ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400')}>
                        {cert.revoked ? (t('certificates.revoked') || 'Revoked') : (t('wallets.active') || 'Active')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-end">
                      {!cert.revoked && (
                        <Button variant="ghost" size="icon" onClick={() => handleRevoke(cert.id)} title={t('certificates.revoke') || 'Revoke Certificate'} className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                          <FiTrash2 className="size-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Certificates;
