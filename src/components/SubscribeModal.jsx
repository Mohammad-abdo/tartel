import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import { teacherAPI, studentSubscriptionAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FiCheck, FiUser, FiCalendar, FiClock } from 'react-icons/fi';
import { cn } from '../lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { useCurrency } from '../context/CurrencyContext';

const DAYS = [
  { id: 0, key: 'sunday', label: 'Sunday' },
  { id: 1, key: 'monday', label: 'Monday' },
  { id: 2, key: 'tuesday', label: 'Tuesday' },
  { id: 3, key: 'wednesday', label: 'Wednesday' },
  { id: 4, key: 'thursday', label: 'Thursday' },
  { id: 5, key: 'friday', label: 'Friday' },
  { id: 6, key: 'saturday', label: 'Saturday' },
];

const SubscribeModal = ({ pkg, isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrency();
  const [step, setStep] = useState(1);
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [slots, setSlots] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    const fetchTeachers = async () => {
      setLoading(true);
      try {
        const res = await teacherAPI.getAllTeachers({ activeOnly: true });
        setTeachers(res.data || []);
      } catch (e) {
        console.error(e);
        toast.error(t('common.error'));
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && step === 1) {
      fetchTeachers();
    }
  }, [isOpen, step, t]);

  useEffect(() => {
    const fetchAvailability = async () => {
      setLoading(true);
      try {
        const today = new Date().toISOString();
        const nextMonth = new Date();
        nextMonth.setDate(nextMonth.getDate() + 30);
        const res = await teacherAPI.getAvailability(selectedTeacher.id, today, nextMonth.toISOString());
        setAvailability(res.data || res); 
      } catch (e) {
        console.error(e);
        toast.error(t('common.error'));
      } finally {
        setLoading(false);
      }
    };

    if (step === 2 && selectedTeacher) {
      fetchAvailability();
    }
  }, [step, selectedTeacher, t]);

  const handleSelectTeacher = (teacher) => {
    setSelectedTeacher(teacher);
    setStep(2);
  };

  const toggleSlot = (dayOfWeek, startTime) => {
    const existing = slots.find(s => s.dayOfWeek === dayOfWeek && s.startTime === startTime);
    if (existing) {
      setSlots(slots.filter(s => s !== existing));
    } else {
      if (pkg.weeklyFrequency && slots.length >= pkg.weeklyFrequency) {
        toast.warning(t('subscriptions.maxSlotsReached', { count: pkg.weeklyFrequency }));
        return;
      }
      setSlots([...slots, { dayOfWeek, startTime }]);
    }
  };

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const res = await studentSubscriptionAPI.subscribe({
        packageId: pkg.id,
        teacherId: selectedTeacher?.id,
        selectedSlots: slots
      });

      if (res.paymentUrl) {
        // Redirect to Fawry
        window.location.href = res.paymentUrl;
        return;
      }

      if (res.referenceNumber) {
        // Show Reference Number Step
        setPaymentData({
          referenceNumber: res.referenceNumber,
          merchantRefNumber: res.merchantRefNumber,
          amount: pkg.price, // Approximate
          expiry: res.expiresAt
        });
        setStep(3);
        toast.success(t('subscriptions.paymentInitiated'));
        return;
      }

      toast.success(t('subscriptions.success'));
      onSuccess();
      onClose();
    } catch (e) {
      console.error(e);
      toast.error(e.response?.data?.message || t('common.error'));
    } finally {
      if (step !== 3) {
        setLoading(false);
      }
    }
  };

  if (!pkg) return null;

  // Render Steps
  const renderStepContent = () => {
    if (step === 1) {
      // Teacher Selection
      return (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <p className="text-sm text-gray-500">{t('subscriptions.selectTeacherDesc')}</p>
          {loading ? (
            <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-2 border-orange-500 rounded-full border-t-transparent"></div></div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {teachers.map(teacher => (
                <div 
                  key={teacher.id} 
                  onClick={() => handleSelectTeacher(teacher)}
                  className="cursor-pointer border rounded-lg p-3 hover:bg-orange-50 hover:border-orange-200 transition-colors flex items-center gap-3"
                >
                  <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                    {teacher.user?.avatar ? <img src={teacher.user.avatar} alt="" className="h-full w-full rounded-full object-cover" /> : <FiUser />}
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{teacher.user?.name || 'Teacher'}</h4>
                    <p className="text-xs text-gray-500">{teacher.bio || 'No bio available'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (step === 2) {
      // Slot Selection
      // Use availability
      const schedules = availability.schedules || [];
      // Combine slots by day
      return (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="flex items-center justify-between">
             <p className="text-sm text-gray-500">
               {t('subscriptions.selectSlotsDesc', { count: pkg.weeklyFrequency, current: slots.length })}
             </p>
             <Button variant="ghost" size="sm" onClick={() => setStep(1)}>{t('common.changeTeacher')}</Button>
          </div>

          {loading ? (
             <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-2 border-orange-500 rounded-full border-t-transparent"></div></div>
          ) : (
             <div className="space-y-4">
                {DAYS.map(day => {
                  const daySlots = schedules.filter(s => s.dayOfWeek === day.id).sort((a,b) => a.startTime.localeCompare(b.startTime));
                  if (daySlots.length === 0) return null;

                  return (
                    <div key={day.id} className="border rounded-lg p-3">
                      <h4 className="font-medium text-sm mb-2">{day.label}</h4>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {daySlots.map(slot => {
                           const isSelected = slots.some(s => s.dayOfWeek === day.id && s.startTime === slot.startTime);
                           return (
                             <button
                               key={slot.id}
                               onClick={() => toggleSlot(day.id, slot.startTime)}
                               className={cn(
                                 "text-xs p-2 rounded border transition-colors flex items-center justify-center gap-1",
                                 isSelected ? "bg-orange-100 border-orange-300 text-orange-800" : "bg-gray-50 border-gray-100 hover:bg-gray-100"
                               )}
                             >
                                <FiClock className="h-3 w-3" />
                                {slot.startTime} - {slot.endTime}
                             </button>
                           );
                        })}
                      </div>
                    </div>
                  );
                })}
             </div>
          )}
        </div>
      );
    }

    if (step === 3 && paymentData) {
      return (
        <div className="space-y-6 text-center py-4">
          <div className="flex justify-center">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <span className="text-2xl font-bold">#</span>
             </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{t('fawry.payAtFawry')}</h3>
            <p className="text-sm text-gray-500 mt-1">{t('fawry.referenceNumberDesc')}</p>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{t('fawry.referenceNumber')}</p>
            <div className="text-3xl font-mono font-bold text-gray-900 tracking-wider">
              {paymentData.referenceNumber}
            </div>
          </div>

          {paymentData.amount != null && (
            <div className="text-sm font-medium text-gray-700">
              {t('packages.price')}: {formatCurrency(paymentData.amount)}
            </div>
          )}

          <div className="text-sm text-gray-500">
             {t('fawry.expiryDate')}: {new Date(paymentData.expiry).toLocaleString()}
          </div>
          
          <div className="bg-amber-50 text-amber-800 p-3 rounded-lg text-sm">
            {t('fawry.instructions')}
          </div>
        </div>
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('subscriptions.subscribeTo', { name: pkg.name })}</DialogTitle>
          <DialogDescription>
             {step === 1 && t('subscriptions.step1')}
             {step === 2 && t('subscriptions.step2')}
          </DialogDescription>
        </DialogHeader>
        
        {renderStepContent()}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
          {step === 2 && (
            <Button 
               onClick={handleSubscribe} 
               disabled={loading || (pkg.weeklyFrequency && slots.length !== pkg.weeklyFrequency)}
            >
              {loading ? t('common.loading') : t('subscriptions.confirm')}
            </Button>
          )}
          {step === 3 && (
            <Button onClick={onClose} className="w-full">
              {t('common.close')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubscribeModal;
