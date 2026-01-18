/* ===================================
   صفحة طلب نشر استبيان - request.js
   =================================== */

/* ===================================
   تحميل البيانات عند بدء الصفحة
   =================================== */

document.addEventListener('DOMContentLoaded', async () => {
    await loadCategoriesForSelect();
    setupRequestForm();
});

/* ===================================
   تحميل التصنيفات في قائمة الاختيار
   =================================== */

async function loadCategoriesForSelect() {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;

        const categorySelect = document.getElementById('surveyCategory');
        if (!categorySelect) return;

        // إضافة التصنيفات إلى القائمة
        data.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    } catch (error) {
        console.error('خطأ في تحميل التصنيفات:', error);
        showMessage('requestMessage', 'حدث خطأ في تحميل التصنيفات', 'error');
    }
}

/* ===================================
   إعداد نموذج الطلب
   =================================== */

function setupRequestForm() {
    const requestForm = document.getElementById('requestForm');
    if (requestForm) {
        requestForm.addEventListener('submit', handleRequestSubmit);
    }
}

/* ===================================
   معالجة إرسال طلب نشر الاستبيان
   =================================== */

async function handleRequestSubmit(e) {
    e.preventDefault();

    // جمع بيانات النموذج
    const formData = {
        requester_name: document.getElementById('requesterName').value.trim(),
        requester_email: document.getElementById('requesterEmail').value.trim(),
        survey_title: document.getElementById('surveyTitle').value.trim(),
        survey_description: document.getElementById('surveyDescription').value.trim(),
        category_id: parseInt(document.getElementById('surveyCategory').value),
        survey_link: document.getElementById('surveyLink').value.trim(),
        status: 'pending' // الحالة الافتراضية: قيد المراجعة
    };

    // التحقق من صحة البيانات
    if (!validateRequestForm(formData)) {
        return;
    }

    try {
        // إرسال الطلب إلى قاعدة البيانات
        const { data, error } = await supabase
            .from('survey_requests')
            .insert([formData]);

        if (error) throw error;

        // عرض رسالة نجاح
        showMessage('requestMessage', 
            'تم إرسال طلبك بنجاح! سيتم مراجعته من قبل الإدارة وسنتواصل معك عبر البريد الإلكتروني.', 
            'success'
        );
        
        // إعادة تعيين النموذج
        e.target.reset();

        // التمرير إلى رسالة النجاح
        document.getElementById('requestMessage').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });

    } catch (error) {
        console.error('خطأ في إرسال الطلب:', error);
        showMessage('requestMessage', 
            'حدث خطأ في إرسال طلبك. يرجى المحاولة مرة أخرى لاحقًا.', 
            'error'
        );
    }
}

/* ===================================
   التحقق من صحة بيانات النموذج
   =================================== */

function validateRequestForm(formData) {
    // التحقق من الاسم
    if (!formData.requester_name || formData.requester_name.length < 2) {
        showMessage('requestMessage', 'يرجى إدخال اسم صحيح', 'error');
        return false;
    }

    // التحقق من البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.requester_email)) {
        showMessage('requestMessage', 'يرجى إدخال بريد إلكتروني صحيح', 'error');
        return false;
    }

    // التحقق من عنوان الاستبيان
    if (!formData.survey_title || formData.survey_title.length < 5) {
        showMessage('requestMessage', 'يرجى إدخال عنوان للاستبيان (5 أحرف على الأقل)', 'error');
        return false;
    }

    // التحقق من وصف الاستبيان
    if (!formData.survey_description || formData.survey_description.length < 10) {
        showMessage('requestMessage', 'يرجى إدخال وصف للاستبيان (10 أحرف على الأقل)', 'error');
        return false;
    }

    // التحقق من التصنيف
    if (!formData.category_id || isNaN(formData.category_id)) {
        showMessage('requestMessage', 'يرجى اختيار تصنيف للاستبيان', 'error');
        return false;
    }

    // التحقق من رابط الاستبيان
    try {
        new URL(formData.survey_link);
    } catch {
        showMessage('requestMessage', 'يرجى إدخال رابط صحيح للاستبيان', 'error');
        return false;
    }

    return true;
}
