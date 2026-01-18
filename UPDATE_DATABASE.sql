-- ===================================
-- تحديث قاعدة البيانات لإضافة نظام الروابط الداخلية
-- ===================================
-- قم بتشغيل هذا الملف في SQL Editor إذا كانت الجداول موجودة مسبقاً

-- إضافة الحقول الجديدة لجدول surveys
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS public_slug TEXT;
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS click_count INTEGER DEFAULT 0;
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- إضافة قيد UNIQUE على public_slug
ALTER TABLE surveys ADD CONSTRAINT surveys_public_slug_unique UNIQUE (public_slug);

-- إنشاء فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_surveys_public_slug ON surveys(public_slug);
CREATE INDEX IF NOT EXISTS idx_surveys_is_active ON surveys(is_active);

-- تحديث السجلات الموجودة بإضافة slug عشوائي
-- ملاحظة: قم بتشغيل هذا فقط إذا كان لديك بيانات موجودة
UPDATE surveys 
SET public_slug = LOWER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8))
WHERE public_slug IS NULL;

-- التأكد من أن جميع السجلات لها slug
ALTER TABLE surveys ALTER COLUMN public_slug SET NOT NULL;

-- ===================================
-- تم التحديث بنجاح!
-- ===================================
