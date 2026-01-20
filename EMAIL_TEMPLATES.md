# قوالب البريد الإلكتروني - EmailJS

هذا الملف يحتوي على قوالب HTML للبريد الإلكتروني التي يجب إنشاؤها في حساب EmailJS الخاص بك.

## إعداد EmailJS

### الخطوة 1: إنشاء حساب
1. انتقل إلى [EmailJS](https://www.emailjs.com/)
2. قم بإنشاء حساب مجاني
3. قم بتأكيد البريد الإلكتروني

### الخطوة 2: إضافة خدمة البريد الإلكتروني
1. من لوحة التحكم، اذهب إلى **Email Services**
2. اضغط على **Add New Service**
3. اختر مزود البريد (Gmail, Outlook, إلخ)
4. اتبع التعليمات لربط حسابك
5. احفظ **Service ID**

### الخطوة 3: الحصول على Public Key
1. اذهب إلى **Account** > **General**
2. انسخ **Public Key**

---

## قالب 1: إشعار القبول (Approval Template)

### معرف القالب: `template_approval`

### المتغيرات المطلوبة:
- `{{to_email}}` - بريد المستلم
- `{{to_name}}` - اسم المستلم
- `{{survey_title}}` - عنوان الاستبيان
- `{{survey_description}}` - وصف الاستبيان
- `{{internal_link}}` - الرابط الداخلي للاستبيان
- `{{platform_name}}` - اسم المنصة
- `{{current_year}}` - السنة الحالية

### محتوى HTML:

**ملاحظة**: يمكنك إضافة شعار مجموع في الـ header. استبدل `YOUR_LOGO_URL` برابط الشعار الفعلي.

```html
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
            direction: rtl;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #317157 0%, #245a44 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header img {
            max-width: 150px;
            height: auto;
            margin-bottom: 15px;
            display: block;
            margin-left: auto;
            margin-right: auto;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .content {
            padding: 40px 30px;
            color: #333;
            line-height: 1.8;
        }
        .success-icon {
            text-align: center;
            font-size: 60px;
            margin-bottom: 20px;
        }
        .survey-info {
            background-color: #f8f9fa;
            border-right: 4px solid #317157;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
        }
        .survey-info h3 {
            margin-top: 0;
            color: #317157;
        }
        .button {
            display: inline-block;
            background-color: #317157;
            color: white;
            padding: 14px 30px;
            text-decoration: none;
            border-radius: 8px;
            margin: 20px 0;
            font-weight: bold;
            text-align: center;
        }
        .platform-name {
            color: white;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <!-- إضافة شعار مجموع - استبدل الرابط برابط الشعار الفعلي -->
            <img src="https://moha750.github.io/majmue/colorfulLogo.png" alt="شعار منصة مجموع">
            <h1 class="platform-name">{{platform_name}}</h1>
        </div>
        <div class="content">
            <div class="success-icon">✅</div>
            <h2 style="text-align: center; color: #317157;">مبروك! تمت الموافقة على طلبك</h2>
            
            <p>عزيزي/عزيزتي <strong>{{to_name}}</strong>،</p>
            
            <p>يسعدنا إبلاغك بأنه تمت الموافقة على طلب نشر استبيانك على منصة مجموع💚.</p>
            
            <div class="survey-info">
                <h3>📋 معلومات الاستبيان</h3>
                <p><strong>العنوان:</strong> {{survey_title}}</p>
                <p><strong>الوصف:</strong> {{survey_description}}</p>
            </div>
            
            <p>أصبح استبيانك الآن منشورًا ومتاحًا للجمهور على منصتنا. يمكنك زيارة صفحة الاستبيان من خلال الرابط التالي:</p>
            
            <div style="text-align: center; color: white;text-decoration: none;">
                <a style="text-decoration: none; color: white;" href="{{internal_link}}" class="button">زيارة صفحة الاستبيان</a>
            </div>
            
            <p>نشكرك على استخدام منصة مجموع، ونتمنى لك تجربة ناجحة في جمع بينتك البحثية💚.</p>
            
            <p style="margin-top: 30px;">مع أطيب التحيات،<br><strong>فريق منصة مجموع💚</strong></p>
        </div>
        <div class="footer">
            <p> جميع الحقوق محفوظة لـ{{platform_name}}  {{current_year}} ©</p>
            <p style="font-size: 12px; color: #999;">هذه رسالة تلقائية، يرجى عدم الرد عليها</p>
        </div>
    </div>
</body>
</html>
```

### محتوى نصي بديل (Plain Text):

```
مرحبًا {{to_name}}،

تهانينا! تمت الموافقة على طلب نشر استبيانك على منصة مجموع.

معلومات الاستبيان:
- العنوان: {{survey_title}}
- الوصف: {{survey_description}}

أصبح استبيانك الآن منشورًا ومتاحًا للجمهور.

رابط الاستبيان: {{internal_link}}

نشكرك على استخدام منصة مجموع.

مع أطيب التحيات،
فريق منصة مجموع

© {{current_year}} {{platform_name}}
```

---

## قالب 2: إشعار الرفض (Rejection Template)

### معرف القالب: `template_rejection`

### المتغيرات المطلوبة:
- `{{to_email}}` - بريد المستلم
- `{{to_name}}` - اسم المستلم
- `{{survey_title}}` - عنوان الاستبيان
- `{{rejection_reason}}` - سبب الرفض (رسالة مخصصة من المسؤول)
- `{{platform_name}}` - اسم المنصة
- `{{current_year}}` - السنة الحالية

### محتوى HTML:

```html
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
            direction: rtl;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header img {
            max-width: 150px;
            height: auto;
            margin-bottom: 15px;
            display: block;
            margin-left: auto;
            margin-right: auto;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .content {
            padding: 40px 30px;
            color: #333;
            line-height: 1.8;
        }
        .info-icon {
            text-align: center;
            font-size: 60px;
            margin-bottom: 20px;
        }
        .reason-box {
            background-color: #fef2f2;
            border-right: 4px solid #dc2626;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
        }
        .reason-box h3 {
            margin-top: 0;
            color: #dc2626;
        }
        .reason-text {
            background-color: white;
            padding: 15px;
            border-radius: 6px;
            margin-top: 10px;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        .button {
            display: inline-block;
            background-color: #317157;
            color: white;
            padding: 14px 30px;
            text-decoration: none;
            border-radius: 8px;
            margin: 20px 0;
            font-weight: bold;
            text-align: center;
        }
        .platform-name {
            color: white;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <!-- إضافة شعار مجموع - استبدل الرابط برابط الشعار الفعلي -->
            <img src="https://yourwebsite.com/colorfulLogo.png" alt="شعار منصة مجموع">
            <h1 class="platform-name">{{platform_name}}</h1>
        </div>
        <div class="content">
            <div class="info-icon">🔔</div>
            <h2 style="text-align: center; color: #dc2626;">إشعار بخصوص طلب نشر الاستبيان</h2>
            
            <p>عزيزي/عزيزتي <strong>{{to_name}}</strong>،</p>
            
            <p>نشكرك على اهتمامك بنشر استبيانك على منصة مجموع.</p>
            
            <p>بعد مراجعة طلبك الخاص بالاستبيان "<strong>{{survey_title}}</strong>"، نأسف لإبلاغك بأنه لم تتم الموافقة على نشره في الوقت الحالي.</p>
            
            <div class="reason-box">
                <h3>📝 سبب عدم الموافقة</h3>
                <div class="reason-text">{{rejection_reason}}</div>
            </div>
            
            <p>نحن نقدر جهودك ونشجعك على مراجعة الملاحظات المذكورة أعلاه. يمكنك تقديم طلب جديد بعد إجراء التعديلات اللازمة.</p>
            
            <div style="text-align: center;">
                <a style="text-decoration: none; color: white;" href="https://moha750.github.io/majmue/request.html" class="button">تقديم طلب جديد</a>
            </div>
            
            <p>إذا كان لديك أي استفسارات أو تحتاج إلى توضيحات إضافية، لا تتردد في التواصل معنا.</p>
            
            <p style="margin-top: 30px;">مع أطيب التحيات،<br><strong>فريق منصة مجموع</strong></p>
        </div>
        <div class="footer">
            <p> جميع الحقوق محفوظة لـ{{platform_name}}  {{current_year}} ©</p>
            <p style="font-size: 12px; color: #999;">هذه رسالة تلقائية، يرجى عدم الرد عليها</p>
        </div>
    </div>
</body>
</html>
```

### محتوى نصي بديل (Plain Text):

```
مرحبًا {{to_name}}،

نشكرك على اهتمامك بنشر استبيانك على منصة مجموع.

بعد مراجعة طلبك الخاص بالاستبيان "{{survey_title}}"، نأسف لإبلاغك بأنه لم تتم الموافقة على نشره في الوقت الحالي.

سبب عدم الموافقة:
{{rejection_reason}}

نحن نقدر جهودك ونشجعك على مراجعة الملاحظات المذكورة أعلاه. يمكنك تقديم طلب جديد بعد إجراء التعديلات اللازمة.

إذا كان لديك أي استفسارات، لا تتردد في التواصل معنا.

مع أطيب التحيات،
فريق منصة مجموع

© {{current_year}} {{platform_name}}
```

---

## خطوات إنشاء القوالب في EmailJS

### لقالب القبول:
1. اذهب إلى **Email Templates** في لوحة تحكم EmailJS
2. اضغط على **Create New Template**
3. أدخل اسم القالب: `Survey Approval Notification`
4. Template ID: `template_approval`
5. الصق محتوى HTML في قسم **Content**
6. الصق المحتوى النصي في قسم **Plain Text**
7. في قسم **Settings**:
   - **To Email**: `{{to_email}}`
   - **Subject**: `تمت الموافقة على طلب نشر استبيانك - {{platform_name}}`
   - **From Name**: `{{platform_name}}`
8. احفظ القالب

### لقالب الرفض:
1. اذهب إلى **Email Templates**
2. اضغط على **Create New Template**
3. أدخل اسم القالب: `Survey Rejection Notification`
4. Template ID: `template_rejection`
5. الصق محتوى HTML في قسم **Content**
6. الصق المحتوى النصي في قسم **Plain Text**
7. في قسم **Settings**:
   - **To Email**: `{{to_email}}`
   - **Subject**: `تحديث بخصوص طلب نشر استبيانك - {{platform_name}}`
   - **From Name**: `{{platform_name}}`
8. احفظ القالب

---

## تحديث إعدادات المشروع

بعد إنشاء القوالب، قم بتحديث ملف `js/emailService.js`:

```javascript
const EMAIL_CONFIG = {
    serviceId: 'YOUR_SERVICE_ID',      // ضع Service ID هنا
    publicKey: 'YOUR_PUBLIC_KEY',      // ضع Public Key هنا
    templates: {
        approval: 'template_approval',
        rejection: 'template_rejection'
    }
};
```

---

## اختبار القوالب

يمكنك اختبار القوالب مباشرة من لوحة تحكم EmailJS:
1. افتح القالب
2. اضغط على **Test It**
3. أدخل قيم تجريبية للمتغيرات
4. اضغط على **Send Test Email**

---

## ملاحظات مهمة

1. **الحد الأقصى للرسائل المجانية**: 200 رسالة/شهر في الخطة المجانية
2. **دعم اللغة العربية**: تأكد من استخدام UTF-8 encoding
3. **التخصيص**: يمكنك تعديل التصميم والألوان حسب هوية منصتك
4. **الأمان**: لا تشارك Public Key أو Service ID في أماكن عامة
5. **البريد المرسل**: سيظهر البريد من الحساب المربوط بخدمة EmailJS

---

## استكشاف الأخطاء

### إذا لم يصل البريد:
1. تحقق من صحة البريد الإلكتروني للمستلم
2. تحقق من مجلد الرسائل غير المرغوب فيها (Spam)
3. تحقق من صحة Service ID و Public Key
4. تحقق من صحة Template IDs
5. راجع سجل الأخطاء في Console المتصفح

### إذا ظهرت أخطاء في الإرسال:
1. تأكد من تحميل مكتبة EmailJS بشكل صحيح
2. تأكد من تهيئة EmailJS قبل الاستخدام
3. تحقق من اتصال الإنترنت
4. راجع حدود الاستخدام في حسابك
