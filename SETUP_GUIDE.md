# دليل الإعداد السريع - منصة مجموع

هذا دليل خطوة بخطوة لإعداد منصة مجموع على جهازك.

## 📋 المتطلبات

- متصفح ويب حديث (Chrome, Firefox, Safari, Edge)
- حساب على [Supabase](https://supabase.com) (مجاني)
- محرر نصوص (VS Code, Sublime Text, إلخ)

## 🎯 الخطوات

### الخطوة 1: إنشاء مشروع Supabase

1. **إنشاء حساب**
   - اذهب إلى https://supabase.com
   - انقر على "Start your project"
   - سجل الدخول باستخدام GitHub أو البريد الإلكتروني

2. **إنشاء مشروع جديد**
   - انقر على "New Project"
   - اختر اسمًا للمشروع (مثل: majmue-platform)
   - اختر كلمة مرور قوية لقاعدة البيانات
   - اختر المنطقة الأقرب لك
   - انقر على "Create new project"
   - انتظر حتى يتم إنشاء المشروع (قد يستغرق دقيقة)

3. **الحصول على مفاتيح API**
   - من القائمة الجانبية، اختر "Settings" > "API"
   - احفظ المعلومات التالية:
     - **Project URL**: مثل `https://xxxxx.supabase.co`
     - **anon/public key**: مفتاح طويل يبدأ بـ `eyJ...`

### الخطوة 2: إعداد قاعدة البيانات

1. **فتح SQL Editor**
   - من القائمة الجانبية، اختر "SQL Editor"
   - انقر على "New query"

2. **إنشاء الجداول**
   - انسخ الكود التالي والصقه في المحرر:

```sql
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
```

   - انقر على "Run" أو اضغط Ctrl+Enter
   - يجب أن ترى رسالة "Success"

3. **إعداد الأمان (Row Level Security)**
   - أنشئ استعلامًا جديدًا (New query)
   - انسخ والصق الكود التالي:

```sql
-- تفعيل Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_visits ENABLE ROW LEVEL SECURITY;

-- سياسات القراءة العامة
CREATE POLICY "Enable read access for all users" ON categories FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON surveys FOR SELECT USING (true);

-- سياسات الكتابة للطلبات والرسائل
CREATE POLICY "Enable insert for all users" ON survey_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for all users" ON contact_messages FOR INSERT WITH CHECK (true);

-- سياسات الإدارة
CREATE POLICY "Enable all for authenticated users" ON survey_requests FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON surveys FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON contact_messages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON site_visits FOR ALL USING (auth.role() = 'authenticated');
```

   - انقر على "Run"

### الخطوة 3: إنشاء حساب المشرف

1. **الذهاب إلى Authentication**
   - من القائمة الجانبية، اختر "Authentication"
   - اختر تبويب "Users"

2. **إضافة مستخدم جديد**
   - انقر على "Add user" > "Create new user"
   - أدخل البريد الإلكتروني (مثل: admin@majmue.com)
   - أدخل كلمة مرور قوية
   - تأكد من تفعيل "Auto Confirm User"
   - انقر على "Create user"

3. **حفظ بيانات الدخول**
   - احفظ البريد الإلكتروني وكلمة المرور في مكان آمن

### الخطوة 4: تكوين المشروع

1. **فتح ملف config.js**
   - افتح المجلد `majmue` في محرر النصوص
   - افتح ملف `js/config.js`

2. **تحديث المعلومات**
   - ابحث عن السطور التالية:
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
   ```

   - استبدلها بمعلومات مشروعك:
   ```javascript
   const SUPABASE_URL = 'https://xxxxx.supabase.co'; // ضع رابط مشروعك
   const SUPABASE_ANON_KEY = 'eyJhbGc...'; // ضع المفتاح العام
   ```

3. **حفظ الملف**
   - احفظ التغييرات (Ctrl+S)

### الخطوة 5: تشغيل المنصة

#### الطريقة 1: فتح مباشر في المتصفح
- افتح ملف `index.html` مباشرة في المتصفح
- **ملاحظة**: قد لا تعمل بعض الميزات بسبب قيود CORS

#### الطريقة 2: استخدام خادم محلي (موصى به)

**باستخدام Python:**
```bash
# افتح Terminal/CMD في مجلد المشروع
cd majmue

# Python 3
python -m http.server 8000

# افتح المتصفح على: http://localhost:8000
```

**باستخدام Node.js:**
```bash
# تثبيت http-server (مرة واحدة فقط)
npm install -g http-server

# تشغيل الخادم
http-server

# افتح المتصفح على: http://localhost:8080
```

**باستخدام VS Code:**
- ثبت إضافة "Live Server"
- انقر بزر الماوس الأيمن على `index.html`
- اختر "Open with Live Server"

### الخطوة 6: اختبار المنصة

1. **اختبار الصفحة الرئيسية**
   - افتح `http://localhost:8000` (أو المنفذ المناسب)
   - يجب أن ترى الصفحة الرئيسية مع التصنيفات الافتراضية

2. **اختبار طلب نشر استبيان**
   - انقر على "اطلب نشر استبيان"
   - املأ النموذج واضغط "إرسال"
   - يجب أن ترى رسالة نجاح

3. **اختبار لوحة التحكم**
   - افتح `admin.html`
   - سجل الدخول ببيانات المشرف
   - يجب أن ترى لوحة التحكم مع الإحصائيات

4. **اختبار الموافقة على طلب**
   - في لوحة التحكم، اذهب إلى "طلبات الاستبيانات"
   - يجب أن ترى الطلب الذي أرسلته
   - انقر على "قبول"
   - ارجع إلى الصفحة الرئيسية وتحقق من ظهور الاستبيان

## ✅ التحقق من نجاح الإعداد

- [ ] تم إنشاء مشروع Supabase
- [ ] تم إنشاء جميع الجداول بنجاح
- [ ] تم إعداد Row Level Security
- [ ] تم إنشاء حساب المشرف
- [ ] تم تحديث ملف config.js
- [ ] تعمل الصفحة الرئيسية بشكل صحيح
- [ ] يمكن إرسال طلب نشر استبيان
- [ ] يمكن تسجيل الدخول إلى لوحة التحكم
- [ ] تظهر الإحصائيات في لوحة التحكم

## 🐛 حل المشاكل الشائعة

### المشكلة: لا تظهر البيانات في الصفحة الرئيسية
**الحل:**
- تحقق من أن معلومات Supabase صحيحة في `config.js`
- افتح Console في المتصفح (F12) وتحقق من الأخطاء
- تأكد من تشغيل جميع أوامر SQL بنجاح

### المشكلة: لا يمكن تسجيل الدخول إلى لوحة التحكم
**الحل:**
- تأكد من إنشاء المستخدم في Supabase Authentication
- تأكد من تفعيل "Auto Confirm User"
- تحقق من البريد الإلكتروني وكلمة المرور

### المشكلة: خطأ CORS
**الحل:**
- استخدم خادم محلي بدلاً من فتح الملف مباشرة
- استخدم Python أو Node.js أو Live Server

### المشكلة: لا تعمل الأزرار في لوحة التحكم
**الحل:**
- تحقق من Console في المتصفح
- تأكد من تحميل جميع ملفات JavaScript
- تأكد من إعداد Row Level Security بشكل صحيح

## 📞 الحصول على المساعدة

إذا واجهت أي مشاكل:
1. راجع ملف `README.md` للمزيد من التفاصيل
2. تحقق من Console في المتصفح (F12)
3. راجع توثيق Supabase: https://supabase.com/docs
4. تحقق من أن جميع الخطوات تم تنفيذها بشكل صحيح

## 🎉 تهانينا!

إذا أكملت جميع الخطوات بنجاح، فإن منصة مجموع جاهزة للاستخدام!

يمكنك الآن:
- إضافة تصنيفات جديدة
- نشر استبيانات
- إدارة الطلبات والرسائل
- تخصيص التصميم حسب احتياجاتك

**بالتوفيق! 🚀**
