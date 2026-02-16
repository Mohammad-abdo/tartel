import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiClock, FiPlus, FiTrash2, FiSave } from 'react-icons/fi';
import { teacherAPI } from '../../services/api';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { toast } from 'react-toastify';

const DAYS = [
  { id: 0, key: 'sunday', label: 'Sunday' },
  { id: 1, key: 'monday', label: 'Monday' },
  { id: 2, key: 'tuesday', label: 'Tuesday' },
  { id: 3, key: 'wednesday', label: 'Wednesday' },
  { id: 4, key: 'thursday', label: 'Thursday' },
  { id: 5, key: 'friday', label: 'Friday' },
  { id: 6, key: 'saturday', label: 'Saturday' },
];

const AvailabilityScheduler = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [teacher, setTeacher] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [newSlot, setNewSlot] = useState({ dayOfWeek: 0, startTime: '09:00', endTime: '17:00' });
  const [addingDay, setAddingDay] = useState(null); // Track which day is adding a slot

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await teacherAPI.getProfile();
      setTeacher(response);
      setSchedules(response.schedules || []);
    } catch (error) {
      console.error('Error fetching teacher profile:', error);
      // toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async (dayId) => {
    if (!teacher) return;
    try {
      // Validate inputs?
      const dto = {
        dayOfWeek: dayId,
        startTime: newSlot.startTime,
        endTime: newSlot.endTime,
        isActive: true
      };
      
      const response = await teacherAPI.createSchedule(teacher.id, dto);
      setSchedules([...schedules, response]); // Optimistic update or refetch?
      // Response is the created schedule
      // Better to refetch or append safely
      // setSchedules(prev => [...prev, response.data || response]); // Api interceptor unwraps data?
      // teacherAPI wrapper returns response (Step 450: response.data = body.data).
      // createSchedule returns api.post(...). Response.data is usually the object.
      // So fetchProfile again or use response.
      fetchProfile(); 
      toast.success(t('common.saved'));
      setAddingDay(null);
    } catch (error) {
      console.error(error);
      toast.error(t('common.error'));
    }
  };

  const handleDeleteSlot = async (scheduleId) => {
    if (!teacher) return;
    try {
      if (!window.confirm(t('common.confirmDelete'))) return; 
      
      await teacherAPI.deleteSchedule(teacher.id, scheduleId);
      setSchedules(schedules.filter(s => s.id !== scheduleId));
      toast.success(t('common.deleted'));
    } catch (error) {
      console.error(error);
      toast.error(t('common.error'));
    }
  };

  if (loading) return <div>{t('common.loading')}...</div>;
  if (!teacher) return null; // Or show message "Create Teacher Profile first"

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
           <FiClock className="h-5 w-5" />
           {t('profile.availability') || 'Weekly Availability'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {DAYS.map((day) => {
          const daySlots = schedules.filter(s => s.dayOfWeek === day.id).sort((a,b) => a.startTime.localeCompare(b.startTime));
          const isAdding = addingDay === day.id;

          return (
            <div key={day.id} className="border-b last:border-0 pb-4 last:pb-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{t(`days.${day.key}`) || day.label}</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setAddingDay(isAdding ? null : day.id);
                    setNewSlot({ ...newSlot, dayOfWeek: day.id });
                  }}
                  className="text-primary-600 hover:bg-primary-50"
                >
                  <FiPlus className="h-4 w-4 mr-1" />
                  {t('common.add')}
                </Button>
              </div>

              {/* Existing Slots */}
              {daySlots.length > 0 ? (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {daySlots.map(slot => (
                    <div key={slot.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-md text-sm border border-gray-100">
                      <span className="text-gray-700 font-mono">
                        {slot.startTime} - {slot.endTime}
                      </span>
                      <button 
                        onClick={() => handleDeleteSlot(slot.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                        title={t('common.delete')}
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic mb-2">{t('common.noSlots') || 'No slots available'}</p>
              )}

              {/* Add Slot Form */}
              {isAdding && (
                <div className="mt-3 flex items-center gap-2 bg-blue-50 p-3 rounded-lg border border-blue-100 animate-in fade-in slide-in-from-top-2">
                  <div className="grid grid-cols-2 gap-2 flex-1">
                    <input 
                      type="time" 
                      value={newSlot.startTime}
                      onChange={e => setNewSlot({...newSlot, startTime: e.target.value})}
                      className="rounded border-gray-200 text-sm px-2 py-1"
                    />
                    <input 
                      type="time" 
                      value={newSlot.endTime}
                      onChange={e => setNewSlot({...newSlot, endTime: e.target.value})}
                      className="rounded border-gray-200 text-sm px-2 py-1"
                    />
                  </div>
                  <Button size="sm" onClick={() => handleAddSlot(day.id)}>
                    <FiSave className="h-4 w-4 mr-1" />
                    {t('common.save')}
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default AvailabilityScheduler;
