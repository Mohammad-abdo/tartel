import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
import { heroAPI } from '../../services/api';
import { Button } from '../ui/button';
import HeroSlidesList from './HeroSlidesList';
import HeroSlideForm from './HeroSlideForm';
import { FiPlus, FiRefreshCw } from 'react-icons/fi';

const HeroTab = () => {
  const { t } = useTranslation();
  const { language, isRTL } = useLanguage();
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSlide, setEditingSlide] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await heroAPI.getAll();
      // Handle different response structures
      const data = response?.data || response || [];
      setSlides(Array.isArray(data) ? data.sort((a, b) => a.order - b.order) : []);
    } catch (error) {
      console.error('Failed to fetch hero slides:', error);
      setError(error.message || 'Failed to fetch slides');
      setSlides([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    setSaving(true);
    setError(null);
    try {
      await heroAPI.create(data);
      await fetchSlides();
      setIsCreating(false);
    } catch (error) {
      console.error('Failed to create slide:', error);
      setError(error.message || 'Failed to create slide');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (data) => {
    if (!editingSlide) return;
    setSaving(true);
    setError(null);
    try {
      await heroAPI.update(editingSlide.id, data);
      await fetchSlides();
      setEditingSlide(null);
    } catch (error) {
      console.error('Failed to update slide:', error);
      setError(error.message || 'Failed to update slide');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(isRTL ? 'هل أنت متأكد من حذف هذه الشريحة؟' : 'Are you sure you want to delete this slide?')) {
      return;
    }
    setError(null);
    try {
      await heroAPI.delete(id);
      await fetchSlides();
    } catch (error) {
      console.error('Failed to delete slide:', error);
      setError(error.message || 'Failed to delete slide');
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    setError(null);
    try {
      await heroAPI.update(id, { isActive: !currentStatus });
      await fetchSlides();
    } catch (error) {
      console.error('Failed to toggle slide status:', error);
      setError(error.message || 'Failed to update slide status');
    }
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newSlides = [...slides];
    [newSlides[index - 1], newSlides[index]] = [newSlides[index], newSlides[index - 1]];
    
    // Update orders
    newSlides.forEach((slide, idx) => {
      slide.order = idx;
    });
    
    setSlides(newSlides);
    saveOrder(newSlides);
  };

  const handleMoveDown = (index) => {
    if (index === slides.length - 1) return;
    const newSlides = [...slides];
    [newSlides[index], newSlides[index + 1]] = [newSlides[index + 1], newSlides[index]];
    
    // Update orders
    newSlides.forEach((slide, idx) => {
      slide.order = idx;
    });
    
    setSlides(newSlides);
    saveOrder(newSlides);
  };

  const saveOrder = async (updatedSlides) => {
    setError(null);
    try {
      await heroAPI.reorder(updatedSlides.map(s => ({ id: s.id, order: s.order })));
    } catch (error) {
      console.error('Failed to save order:', error);
      setError(error.message || 'Failed to save order');
      fetchSlides(); // Revert on error
    }
  };

  const cancelEdit = () => {
    setEditingSlide(null);
    setIsCreating(false);
    setError(null);
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p className="font-medium">Error: {error}</p>
        <Button 
          onClick={fetchSlides} 
          variant="outline" 
          className="mt-2"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {isRTL ? 'شريط الصور المتحرك' : 'Hero Slider'}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchSlides} disabled={loading}>
            <FiRefreshCw className={`size-4 mr-2 rtl:ml-2 rtl:mr-0 ${loading ? 'animate-spin' : ''}`} />
            {t('common.refresh') || 'Refresh'}
          </Button>
          {!isCreating && !editingSlide && (
            <Button onClick={() => setIsCreating(true)}>
              <FiPlus className="size-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {isRTL ? 'إضافة شريحة' : 'Add Slide'}
            </Button>
          )}
        </div>
      </div>

      {/* Form (when creating or editing) */}
      {(isCreating || editingSlide) && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {isCreating 
              ? (isRTL ? 'إضافة شريحة جديدة' : 'Create New Slide')
              : (isRTL ? 'تعديل الشريحة' : 'Edit Slide')
            }
          </h3>
          <HeroSlideForm
            initialData={editingSlide}
            onSubmit={isCreating ? handleCreate : handleUpdate}
            onCancel={cancelEdit}
            isSubmitting={saving}
          />
        </div>
      )}

      {/* Slides List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        {loading ? (
          <div className="flex items-center justify-center py-14">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
              <p className="text-sm text-gray-500">{t('common.loading') || 'Loading...'}</p>
            </div>
          </div>
        ) : (
          <HeroSlidesList
            slides={slides}
            onEdit={setEditingSlide}
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
          />
        )}
      </div>
    </div>
  );
};

export default HeroTab;