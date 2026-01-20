-- ===================================
-- تحديث قاعدة البيانات - إضافة survey_id
-- ===================================

-- إضافة حقل survey_id في جدول survey_requests
ALTER TABLE survey_requests ADD COLUMN IF NOT EXISTS survey_id BIGINT;

-- إضافة Foreign Key للربط بين الطلب والاستبيان
ALTER TABLE survey_requests 
ADD CONSTRAINT fk_survey_requests_survey_id 
FOREIGN KEY (survey_id) 
REFERENCES surveys(id) 
ON DELETE CASCADE;

-- إنشاء فهرس للأداء
CREATE INDEX IF NOT EXISTS idx_survey_requests_survey_id ON survey_requests(survey_id);

-- ===================================
-- تم التحديث بنجاح!
-- ===================================
