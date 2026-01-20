/* ===================================
   خدمة البريد الإلكتروني - EmailJS
   =================================== */

// إعدادات EmailJS
// يجب تحديث هذه القيم من حساب EmailJS الخاص بك
// للحصول على Service ID الصحيح:
// 1. اذهب إلى https://dashboard.emailjs.com/admin/services
// 2. افتح الخدمة أو أنشئ واحدة جديدة
// 3. انسخ Service ID (يبدأ عادة بـ service_)
const EMAIL_CONFIG = {
    serviceId: 'service_p9p0udw',      // ✓ Service ID صحيح
    publicKey: 'RuKfWdhAJWSoz6HVD',    // ✓ Public Key صحيح
    templates: {
        // ⚠️ تحقق من هذه المعرفات - يجب أن تكون مختلفة!
        // للحصول على Template ID الصحيح:
        // 1. اذهب إلى https://dashboard.emailjs.com/admin/templates
        // 2. افتح كل قالب وانسخ Template ID من الأعلى
        approval: 'template_7funjyf',  // معرف قالب القبول (مثال: template_abc123)
        rejection: 'template_ipcihzm' // معرف قالب الرفض (مثال: template_xyz789)
    }
};

/* ===================================
   تهيئة EmailJS
   =================================== */

function initEmailJS() {
    if (typeof emailjs !== 'undefined') {
        emailjs.init(EMAIL_CONFIG.publicKey);
        console.log('EmailJS initialized successfully');
    } else {
        console.error('EmailJS library not loaded');
    }
}

/* ===================================
   إرسال إشعار القبول
   =================================== */

async function sendApprovalEmail(requestData) {
    try {
        // التحقق من تحميل مكتبة EmailJS
        if (typeof emailjs === 'undefined') {
            throw new Error('EmailJS library not loaded');
        }

        // إعداد معاملات البريد الإلكتروني
        const templateParams = {
            to_email: requestData.requester_email,
            to_name: requestData.requester_name,
            survey_title: requestData.survey_title,
            survey_description: requestData.survey_description || 'لا يوجد وصف',
            internal_link: requestData.internal_link || '',
            platform_name: 'منصة مجموع',
            current_year: new Date().getFullYear()
        };

        // طباعة البيانات للتحقق
        console.log('📧 Sending approval email with params:', templateParams);

        // إرسال البريد الإلكتروني باستخدام sendForm API
        const response = await emailjs.send(
            EMAIL_CONFIG.serviceId,
            EMAIL_CONFIG.templates.approval,
            templateParams,
            EMAIL_CONFIG.publicKey  // إضافة public key كمعامل رابع
        );

        console.log('Approval email sent successfully:', response);
        return {
            success: true,
            message: 'تم إرسال إشعار القبول بنجاح'
        };

    } catch (error) {
        console.error('Error sending approval email:', error);
        return {
            success: false,
            message: 'فشل إرسال إشعار القبول',
            error: error
        };
    }
}

/* ===================================
   إرسال إشعار الرفض
   =================================== */

async function sendRejectionEmail(requestData, rejectionReason) {
    try {
        // التحقق من تحميل مكتبة EmailJS
        if (typeof emailjs === 'undefined') {
            throw new Error('EmailJS library not loaded');
        }

        // التحقق من وجود سبب الرفض
        if (!rejectionReason || rejectionReason.trim() === '') {
            throw new Error('يجب تحديد سبب الرفض');
        }

        // إعداد معاملات البريد الإلكتروني
        const templateParams = {
            to_email: requestData.requester_email,
            to_name: requestData.requester_name,
            survey_title: requestData.survey_title,
            rejection_reason: rejectionReason,
            platform_name: 'منصة مجموع',
            current_year: new Date().getFullYear()
        };

        // إرسال البريد الإلكتروني
        const response = await emailjs.send(
            EMAIL_CONFIG.serviceId,
            EMAIL_CONFIG.templates.rejection,
            templateParams,
            EMAIL_CONFIG.publicKey  // إضافة public key كمعامل رابع
        );

        console.log('Rejection email sent successfully:', response);
        return {
            success: true,
            message: 'تم إرسال إشعار الرفض بنجاح'
        };

    } catch (error) {
        console.error('Error sending rejection email:', error);
        return {
            success: false,
            message: 'فشل إرسال إشعار الرفض',
            error: error
        };
    }
}

/* ===================================
   إرسال بريد إلكتروني مخصص
   =================================== */

async function sendCustomEmail(toEmail, toName, subject, message) {
    try {
        if (typeof emailjs === 'undefined') {
            throw new Error('EmailJS library not loaded');
        }

        const templateParams = {
            to_email: toEmail,
            to_name: toName,
            subject: subject,
            message: message,
            platform_name: 'منصة مجموع',
            current_year: new Date().getFullYear()
        };

        const response = await emailjs.send(
            EMAIL_CONFIG.serviceId,
            'template_custom', // قالب مخصص عام
            templateParams
        );

        console.log('Custom email sent successfully:', response);
        return {
            success: true,
            message: 'تم إرسال البريد الإلكتروني بنجاح'
        };

    } catch (error) {
        console.error('Error sending custom email:', error);
        return {
            success: false,
            message: 'فشل إرسال البريد الإلكتروني',
            error: error
        };
    }
}

/* ===================================
   التحقق من صحة البريد الإلكتروني
   =================================== */

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/* ===================================
   تهيئة الخدمة عند تحميل الصفحة
   =================================== */

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEmailJS);
} else {
    initEmailJS();
}
