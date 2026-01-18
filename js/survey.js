/* ===================================
   صفحة إعادة التوجيه للاستبيان - survey.js
   =================================== */

/* ===================================
   الحصول على slug من URL
   =================================== */

function getSlugFromURL() {
    // الحصول على المعاملات من URL
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('s') || urlParams.get('slug');
}

/* ===================================
   تحميل بيانات الاستبيان وإعادة التوجيه
   =================================== */

async function loadAndRedirect() {
    const slug = getSlugFromURL();
    const contentDiv = document.getElementById('redirectContent');

    // التحقق من وجود slug
    if (!slug) {
        showError('رابط غير صحيح', 'الرابط الذي استخدمته غير صحيح. يرجى التحقق من الرابط والمحاولة مرة أخرى.');
        return;
    }

    try {
        // البحث عن الاستبيان باستخدام slug
        const { data: survey, error } = await supabase
            .from('surveys')
            .select('*')
            .eq('public_slug', slug)
            .single();

        if (error) {
            console.error('خطأ في جلب الاستبيان:', error);
            showError('استبيان غير موجود', 'الاستبيان الذي تبحث عنه غير موجود أو تم حذفه.');
            return;
        }

        // التحقق من أن الاستبيان نشط
        if (!survey.is_active) {
            showError('استبيان غير متاح', 'هذا الاستبيان غير متاح حالياً. يرجى التواصل مع إدارة المنصة للمزيد من المعلومات.');
            return;
        }

        // زيادة عداد الضغطات
        await incrementClickCount(survey.id, survey.click_count);

        // عرض رسالة نجاح
        showSuccess(survey.title);

        // إعادة التوجيه بعد ثانيتين
        setTimeout(() => {
            window.location.href = survey.survey_link;
        }, 2000);

    } catch (error) {
        console.error('خطأ غير متوقع:', error);
        showError('حدث خطأ', 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى لاحقاً.');
    }
}

/* ===================================
   زيادة عداد الضغطات
   =================================== */

async function incrementClickCount(surveyId, currentCount) {
    try {
        const { error } = await supabase
            .from('surveys')
            .update({ click_count: currentCount + 1 })
            .eq('id', surveyId);

        if (error) {
            console.error('خطأ في تحديث عداد الضغطات:', error);
        }
    } catch (error) {
        console.error('خطأ في تحديث عداد الضغطات:', error);
    }
}

/* ===================================
   عرض رسالة نجاح
   =================================== */

function showSuccess(surveyTitle) {
    const contentDiv = document.getElementById('redirectContent');
    contentDiv.innerHTML = `
        <div class="redirect-icon success-icon">✓</div>
        <h2 class="redirect-title">تم بنجاح!</h2>
        <p class="redirect-message">جاري إعادة توجيهك إلى استبيان: <strong>${escapeHtml(surveyTitle)}</strong></p>
        <p class="redirect-message" style="font-size: 0.9rem;">سيتم التوجيه تلقائياً خلال ثانيتين...</p>
    `;
}

/* ===================================
   عرض رسالة خطأ
   =================================== */

function showError(title, message) {
    const contentDiv = document.getElementById('redirectContent');
    contentDiv.innerHTML = `
        <div class="redirect-icon error-icon">✕</div>
        <h2 class="redirect-title">${escapeHtml(title)}</h2>
        <p class="redirect-message">${escapeHtml(message)}</p>
        <a href="index.html" class="btn btn-primary" style="margin-top: 1rem;">العودة للصفحة الرئيسية</a>
    `;
}

/* ===================================
   دوال مساعدة
   =================================== */

function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

/* ===================================
   تشغيل عند تحميل الصفحة
   =================================== */

document.addEventListener('DOMContentLoaded', loadAndRedirect);
