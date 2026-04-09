import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../ui/button';
import { FiUpload, FiX } from 'react-icons/fi';

const HeroSlideForm = ({ initialData, onSubmit, onCancel, isSubmitting }) => {
  const { language, isRTL } = useLanguage();
  const [formData, setFormData] = useState({
    image: initialData?.image || '',
    title: initialData?.title || '',
    titleAr: initialData?.titleAr || '',
    description: initialData?.description || '',
    descriptionAr: initialData?.descriptionAr || '',
    order: initialData?.order || 0,
    isActive: initialData?.isActive ?? true,
  });

  const [imagePreview, setImagePreview] = useState(initialData?.image || '');

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        setImagePreview(result);
        setFormData({ ...formData, image: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('title', formData.title);
    fd.append('titleAr', formData.titleAr);
    fd.append('description', formData.description);
    fd.append('descriptionAr', formData.descriptionAr);
    fd.append('order', String(formData.order ?? 0));
    fd.append('isActive', formData.isActive ? 'true' : 'false');

    const img = formData.image;
    try {
      if (img && String(img).startsWith('data:')) {
        const blob = await (await fetch(img)).blob();
        const type = blob.type || 'image/jpeg';
        const ext = type.includes('png') ? 'png' : type.includes('webp') ? 'webp' : type.includes('gif') ? 'gif' : 'jpg';
        fd.append('image', blob, `slide.${ext}`);
      } else if (img) {
        fd.append('image', String(img));
      }
    } catch (err) {
      console.error('Failed to prepare image for upload:', err);
      return;
    }

    onSubmit(fd);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {isRTL ? 'الصورة' : 'Image'} *
        </label>
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={formData.image}
                onChange={(e) => {
                  setFormData({ ...formData, image: e.target.value });
                  setImagePreview(e.target.value);
                }}
                placeholder={isRTL ? 'رابط الصورة' : 'Image URL'}
                className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <span className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors w-full sm:w-auto">
                  <FiUpload className="size-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  {isRTL ? 'رفع' : 'Upload'}
                </span>
              </label>
            </div>
          </div>
          {imagePreview && (
            <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 flex-shrink-0 mx-auto sm:mx-0">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x300?text=Invalid+Image';
                }}
              />
              <button
                type="button"
                onClick={() => {
                  setImagePreview('');
                  setFormData({ ...formData, image: '' });
                }}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <FiX className="size-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Rest of the form remains the same */}
      {/* Title Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* English Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {isRTL ? 'العنوان (إنجليزي)' : 'Title (English)'} *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Enter title in English"
            required
          />
        </div>

        {/* Arabic Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {isRTL ? 'العنوان (عربي)' : 'Title (Arabic)'} *
          </label>
          <input
            type="text"
            value={formData.titleAr}
            onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="أدخل العنوان بالعربية"
            dir="rtl"
            required
          />
        </div>
      </div>

      {/* Description Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* English Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {isRTL ? 'الوصف (إنجليزي)' : 'Description (English)'} *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Enter description in English"
            required
          />
        </div>

        {/* Arabic Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {isRTL ? 'الوصف (عربي)' : 'Description (Arabic)'} *
          </label>
          <textarea
            value={formData.descriptionAr}
            onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="أدخل الوصف بالعربية"
            dir="rtl"
            required
          />
        </div>
      </div>

      {/* Order and Status */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {isRTL ? 'الترتيب' : 'Order'}:
          </label>
          <input
            type="number"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
            className="w-20 px-2 py-1 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            min="0"
          />
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {isRTL ? 'نشط' : 'Active'}
          </span>
        </label>
      </div>

      {/* Form Actions */}
      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting 
            ? (isRTL ? 'جاري الحفظ...' : 'Saving...') 
            : initialData 
              ? (isRTL ? 'تحديث' : 'Update') 
              : (isRTL ? 'إنشاء' : 'Create')}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          {isRTL ? 'إلغاء' : 'Cancel'}
        </Button>
      </div>
    </form>
  );
};

export default HeroSlideForm;