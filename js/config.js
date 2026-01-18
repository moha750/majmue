/* ===================================
   إعدادات Supabase
   =================================== */

// ملاحظة مهمة: استبدل القيم التالية بمعلومات مشروعك في Supabase
// يمكنك الحصول على هذه المعلومات من لوحة تحكم Supabase الخاصة بك

// استخدام var بدلاً من const لتجنب خطأ التعريف المزدوج
var SUPABASE_URL = 'https://dvehlxkpuyifarojbxiz.supabase.co'; // مثال: https://xxxxx.supabase.co
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2ZWhseGtwdXlpZmFyb2pieGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3MzMzOTQsImV4cCI6MjA4NDMwOTM5NH0.8_gq_l3uHkE0o4uUi29baGubwxOXGhXqLyvIJAHTXpY'; // المفتاح العام (Anon Key)

// إنشاء عميل Supabase
var supabaseClient;
if (!window.supabaseClient) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    window.supabaseClient = supabaseClient;
} else {
    supabaseClient = window.supabaseClient;
}
// استخدام اسم مختصر للراحة
var supabase = supabaseClient;

/* ===================================
   هيكل قاعدة البيانات المطلوب
   =================================== */

/*
جدول: categories (التصنيفات)
- id: bigint (primary key, auto-increment)
- name: text (اسم التصنيف)
- created_at: timestamp

جدول: surveys (الاستبيانات المنشورة)
- id: bigint (primary key, auto-increment)
- title: text (عنوان الاستبيان)
- description: text (وصف الاستبيان)
- category_id: bigint (foreign key -> categories.id)
- survey_link: text (رابط الاستبيان)
- created_at: timestamp

جدول: survey_requests (طلبات نشر الاستبيانات)
- id: bigint (primary key, auto-increment)
- requester_name: text (اسم مقدم الطلب)
- requester_email: text (البريد الإلكتروني)
- survey_title: text (عنوان الاستبيان)
- survey_description: text (وصف الاستبيان)
- category_id: bigint (foreign key -> categories.id)
- survey_link: text (رابط الاستبيان)
- status: text (pending, approved, rejected)
- created_at: timestamp

جدول: contact_messages (رسائل التواصل)
- id: bigint (primary key, auto-increment)
- name: text (اسم المرسل)
- email: text (البريد الإلكتروني)
- message: text (الرسالة)
- created_at: timestamp

جدول: site_visits (زيارات الموقع)
- id: bigint (primary key, auto-increment)
- visit_date: date
- visit_count: integer
- created_at: timestamp

*/

/* ===================================
   SQL لإنشاء الجداول في Supabase
   =================================== */

/*
-- قم بتشغيل هذه الأوامر في SQL Editor في لوحة تحكم Supabase

-- جدول التصنيفات
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- جدول الاستبيانات المنشورة
CREATE TABLE surveys (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category_id BIGINT REFERENCES categories(id),
    survey_link TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- جدول طلبات نشر الاستبيانات
CREATE TABLE survey_requests (
    id BIGSERIAL PRIMARY KEY,
    requester_name TEXT NOT NULL,
    requester_email TEXT NOT NULL,
    survey_title TEXT NOT NULL,
    survey_description TEXT,
    category_id BIGINT REFERENCES categories(id),
    survey_link TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);

-- جدول رسائل التواصل
CREATE TABLE contact_messages (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- جدول زيارات الموقع
CREATE TABLE site_visits (
    id BIGSERIAL PRIMARY KEY,
    visit_date DATE DEFAULT CURRENT_DATE,
    visit_count INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
);

-- إدراج تصنيفات افتراضية
INSERT INTO categories (name) VALUES 
    ('استبيانات عامة'),
    ('استبيانات طبية'),
    ('استبيانات قانونية');

-- تفعيل Row Level Security (اختياري للأمان)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_visits ENABLE ROW LEVEL SECURITY;

-- سياسات القراءة العامة (يمكن للجميع القراءة)
CREATE POLICY "Enable read access for all users" ON categories FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON surveys FOR SELECT USING (true);

-- سياسات الكتابة للطلبات والرسائل (يمكن للجميع الإضافة)
CREATE POLICY "Enable insert for all users" ON survey_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for all users" ON contact_messages FOR INSERT WITH CHECK (true);

-- سياسات الإدارة (فقط للمستخدمين المصادق عليهم)
CREATE POLICY "Enable all for authenticated users" ON survey_requests FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON surveys FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON contact_messages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON site_visits FOR ALL USING (auth.role() = 'authenticated');

*/

/* ===================================
   دوال مساعدة
   =================================== */

// تسجيل زيارة للموقع
async function trackVisit() {
    try {
        // استبعاد صفحة لوحة التحكم من تسجيل الزيارات
        const currentPage = window.location.pathname;
        if (currentPage.includes('admin.html')) {
            return;
        }
        
        const today = new Date().toISOString().split('T')[0];
        
        // التحقق من وجود سجل لليوم
        const { data: existing } = await supabase
            .from('site_visits')
            .select('*')
            .eq('visit_date', today)
            .single();
        
        if (existing) {
            // تحديث العدد
            await supabase
                .from('site_visits')
                .update({ visit_count: existing.visit_count + 1 })
                .eq('id', existing.id);
        } else {
            // إضافة سجل جديد
            await supabase
                .from('site_visits')
                .insert({ visit_date: today, visit_count: 1 });
        }
    } catch (error) {
        console.error('خطأ في تسجيل الزيارة:', error);
    }
}

// تنسيق التاريخ
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// عرض رسالة للمستخدم
function showMessage(elementId, message, type = 'success') {
    const messageElement = document.getElementById(elementId);
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.className = `message ${type}`;
        messageElement.style.display = 'block';
        
        // إخفاء الرسالة بعد 5 ثواني
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 5000);
    }
}

// تسجيل الزيارة عند تحميل الصفحة
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', trackVisit);
} else {
    trackVisit();
}
