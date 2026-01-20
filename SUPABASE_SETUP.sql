-- ===================================
-- منصة مجموع - إعداد قاعدة البيانات
-- ===================================
-- قم بتشغيل هذا الملف في SQL Editor في لوحة تحكم Supabase
-- يمكنك نسخ ولصق الأوامر بالكامل وتشغيلها دفعة واحدة

-- ===================================
-- الخطوة 1: إنشاء الجداول
-- ===================================

-- جدول التصنيفات
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- جدول الاستبيانات المنشورة
CREATE TABLE IF NOT EXISTS surveys (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    survey_link TEXT NOT NULL,
    public_slug TEXT UNIQUE NOT NULL,
    click_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- جدول طلبات نشر الاستبيانات
CREATE TABLE IF NOT EXISTS survey_requests (
    id BIGSERIAL PRIMARY KEY,
    requester_name TEXT NOT NULL,
    requester_email TEXT NOT NULL,
    survey_title TEXT NOT NULL,
    survey_description TEXT,
    category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    survey_link TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    survey_id BIGINT REFERENCES surveys(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- جدول رسائل التواصل
CREATE TABLE IF NOT EXISTS contact_messages (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- جدول زيارات الموقع
CREATE TABLE IF NOT EXISTS site_visits (
    id BIGSERIAL PRIMARY KEY,
    visit_date DATE DEFAULT CURRENT_DATE,
    visit_count INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(visit_date)
);

-- ===================================
-- الخطوة 2: إدراج بيانات افتراضية
-- ===================================

-- إدراج تصنيفات افتراضية
INSERT INTO categories (name) VALUES 
    ('استبيانات عامة'),
    ('استبيانات طبية'),
    ('استبيانات قانونية')
ON CONFLICT DO NOTHING;

-- ===================================
-- الخطوة 3: تفعيل Row Level Security
-- ===================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_visits ENABLE ROW LEVEL SECURITY;

-- ===================================
-- الخطوة 4: إنشاء السياسات الأمنية
-- ===================================

-- حذف السياسات القديمة إن وجدت
DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
DROP POLICY IF EXISTS "Enable read access for all users" ON surveys;
DROP POLICY IF EXISTS "Enable insert for all users" ON survey_requests;
DROP POLICY IF EXISTS "Enable insert for all users" ON contact_messages;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON survey_requests;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON categories;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON surveys;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON contact_messages;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON site_visits;

-- سياسات القراءة العامة (يمكن للجميع القراءة)
CREATE POLICY "Enable read access for all users" 
    ON categories FOR SELECT 
    USING (true);

CREATE POLICY "Enable read access for all users" 
    ON surveys FOR SELECT 
    USING (true);

-- سياسات الكتابة للطلبات والرسائل (يمكن للجميع الإضافة)
CREATE POLICY "Enable insert for all users" 
    ON survey_requests FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Enable insert for all users" 
    ON contact_messages FOR INSERT 
    WITH CHECK (true);

-- سياسات الإدارة (فقط للمستخدمين المصادق عليهم)
CREATE POLICY "Enable all for authenticated users" 
    ON survey_requests FOR ALL 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" 
    ON categories FOR ALL 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" 
    ON surveys FOR ALL 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" 
    ON contact_messages FOR ALL 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" 
    ON site_visits FOR ALL 
    USING (auth.role() = 'authenticated');

-- ===================================
-- الخطوة 5: إنشاء فهارس لتحسين الأداء
-- ===================================

CREATE INDEX IF NOT EXISTS idx_surveys_category_id ON surveys(category_id);
CREATE INDEX IF NOT EXISTS idx_surveys_created_at ON surveys(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_surveys_public_slug ON surveys(public_slug);
CREATE INDEX IF NOT EXISTS idx_surveys_is_active ON surveys(is_active);
CREATE INDEX IF NOT EXISTS idx_survey_requests_status ON survey_requests(status);
CREATE INDEX IF NOT EXISTS idx_survey_requests_created_at ON survey_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_survey_requests_survey_id ON survey_requests(survey_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_visits_date ON site_visits(visit_date);

-- ===================================
-- تم الإعداد بنجاح!
-- ===================================
-- الخطوات التالية:
-- 1. انتقل إلى Authentication > Users في لوحة تحكم Supabase
-- 2. أنشئ مستخدمًا جديدًا (حساب المشرف)
-- 3. حدث ملف js/config.js بمعلومات مشروعك
-- 4. ابدأ استخدام المنصة!
