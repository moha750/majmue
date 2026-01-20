/* ===================================
   لوحة التحكم - admin.js
   =================================== */

// المتغيرات العامة
let currentUser = null;
let currentTab = 'requests';

/* ===================================
   تحميل البيانات عند بدء الصفحة
   =================================== */

document.addEventListener('DOMContentLoaded', async () => {
    await checkAuthStatus();
    setupEventListeners();
});

/* ===================================
   التحقق من حالة تسجيل الدخول
   =================================== */

async function checkAuthStatus() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
            currentUser = user;
            await loadDashboardData();
        } else {
            // إعادة التوجيه إلى صفحة تسجيل الدخول
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('خطأ في التحقق من حالة المصادقة:', error);
        window.location.href = 'login.html';
    }
}

/* ===================================
   إعداد مستمعي الأحداث
   =================================== */

function setupEventListeners() {
    // زر تسجيل الخروج
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // تبويبات لوحة التحكم
    const adminTabs = document.querySelectorAll('.admin-tab');
    adminTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            switchTab(tab.dataset.tab);
        });
    });

    // نموذج إضافة تصنيف
    const addCategoryForm = document.getElementById('addCategoryForm');
    if (addCategoryForm) {
        addCategoryForm.addEventListener('submit', handleAddCategory);
    }
}

/* ===================================
   معالجة تسجيل الخروج
   =================================== */

async function handleLogout() {
    try {
        await supabase.auth.signOut();
        currentUser = null;
        window.location.href = 'login.html';
    } catch (error) {
        console.error('خطأ في تسجيل الخروج:', error);
    }
}

/* ===================================
   تحميل بيانات لوحة التحكم
   =================================== */

async function loadDashboardData() {
    await loadStatistics();
    await loadRequests();
    await loadCategories();
    await loadMessages();
    await loadPublishedSurveys();
}

/* ===================================
   تحميل الإحصائيات
   =================================== */

async function loadStatistics() {
    try {
        // عدد الزيارات
        const { data: visits } = await supabase
            .from('site_visits')
            .select('visit_count');
        
        const totalVisits = visits?.reduce((sum, v) => sum + v.visit_count, 0) || 0;
        document.getElementById('statVisits').textContent = totalVisits;

        // عدد الطلبات
        const { count: requestsCount } = await supabase
            .from('survey_requests')
            .select('*', { count: 'exact', head: true });
        
        document.getElementById('statRequests').textContent = requestsCount || 0;

        // عدد الرسائل
        const { count: messagesCount } = await supabase
            .from('contact_messages')
            .select('*', { count: 'exact', head: true });
        
        document.getElementById('statMessages').textContent = messagesCount || 0;

        // عدد الاستبيانات المنشورة
        const { count: surveysCount } = await supabase
            .from('surveys')
            .select('*', { count: 'exact', head: true });
        
        document.getElementById('statSurveys').textContent = surveysCount || 0;

    } catch (error) {
        console.error('خطأ في تحميل الإحصائيات:', error);
    }
}

/* ===================================
   تحميل طلبات الاستبيانات
   =================================== */

async function loadRequests() {
    try {
        const { data, error } = await supabase
            .from('survey_requests')
            .select(`
                *,
                categories (
                    name
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        renderRequests(data || []);
    } catch (error) {
        console.error('خطأ في تحميل الطلبات:', error);
        document.getElementById('requestsTableBody').innerHTML = 
            '<tr><td colspan="7">حدث خطأ في تحميل الطلبات</td></tr>';
    }
}

/* ===================================
   عرض طلبات الاستبيانات
   =================================== */

function renderRequests(requests) {
    const tbody = document.getElementById('requestsTableBody');
    if (!tbody) return;

    if (requests.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8">لا توجد طلبات</td></tr>';
        return;
    }

    let html = '';
    requests.forEach(request => {
        const statusClass = `status-${request.status}`;
        const statusText = {
            'pending': 'قيد المراجعة',
            'approved': 'تمت الموافقة',
            'rejected': 'مرفوض'
        }[request.status] || request.status;

        html += `
            <tr>
                <td>${formatDate(request.created_at)}</td>
                <td>${escapeHtml(request.requester_name)}</td>
                <td>${escapeHtml(request.requester_email)}</td>
                <td>${escapeHtml(request.survey_title)}</td>
                <td>${request.categories ? escapeHtml(request.categories.name) : 'غير محدد'}</td>
                <td>
                    <a href="${escapeHtml(request.survey_link)}" target="_blank" class="survey-link-btn" title="زيارة الاستبيان">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                        زيارة
                    </a>
                </td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    <div class="action-buttons">
                        ${request.status === 'pending' ? `
                            <button class="btn-approve btn-small" onclick="approveRequest(${request.id})">قبول</button>
                            <button class="btn-reject btn-small" onclick="rejectRequest(${request.id})">رفض</button>
                        ` : ''}
                        <button class="btn-view btn-small" onclick="viewRequest(${request.id})">عرض</button>
                    </div>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

/* ===================================
   الموافقة على طلب استبيان
   =================================== */

async function approveRequest(requestId) {
    if (!confirm('هل أنت متأكد من الموافقة على هذا الطلب ونشر الاستبيان؟')) {
        return;
    }

    try {
        // الحصول على بيانات الطلب
        const { data: request, error: fetchError } = await supabase
            .from('survey_requests')
            .select('*')
            .eq('id', requestId)
            .single();

        if (fetchError) throw fetchError;

        // توليد slug فريد
        const publicSlug = await generateUniqueSlug();

        // إنشاء استبيان جديد مع slug
        const { data: surveyData, error: insertError } = await supabase
            .from('surveys')
            .insert([{
                title: request.survey_title,
                description: request.survey_description,
                category_id: request.category_id,
                survey_link: request.survey_link,
                public_slug: publicSlug,
                click_count: 0,
                is_active: true
            }])
            .select();

        if (insertError) throw insertError;

        // تحديث حالة الطلب وربطه بالاستبيان
        const { error: updateError } = await supabase
            .from('survey_requests')
            .update({ 
                status: 'approved',
                survey_id: surveyData[0].id
            })
            .eq('id', requestId);

        if (updateError) throw updateError;

        // إرسال إشعار البريد الإلكتروني
        const internalLink = `${window.location.origin}/survey.html?s=${publicSlug}`;
        const emailData = {
            requester_email: request.requester_email,
            requester_name: request.requester_name,
            survey_title: request.survey_title,
            survey_description: request.survey_description,
            internal_link: internalLink
        };

        const emailResult = await sendApprovalEmail(emailData);
        
        if (emailResult.success) {
            alert('تمت الموافقة على الطلب ونشر الاستبيان بنجاح!\nتم إرسال إشعار بالقبول إلى البريد الإلكتروني للمستخدم.');
        } else {
            alert('تمت الموافقة على الطلب ونشر الاستبيان بنجاح!\nتحذير: فشل إرسال إشعار البريد الإلكتروني. يرجى التحقق من إعدادات EmailJS.');
            console.error('Email notification failed:', emailResult.error);
        }

        await loadRequests();
        await loadStatistics();
        await loadPublishedSurveys();

    } catch (error) {
        console.error('خطأ في الموافقة على الطلب:', error);
        alert('حدث خطأ في الموافقة على الطلب');
    }
}

/* ===================================
   رفض طلب استبيان
   =================================== */

// متغير لتخزين معرف الطلب المراد رفضه
let pendingRejectionRequestId = null;
let pendingRejectionRequestData = null;

async function rejectRequest(requestId) {
    try {
        // الحصول على بيانات الطلب
        const { data: request, error: fetchError } = await supabase
            .from('survey_requests')
            .select('*')
            .eq('id', requestId)
            .single();

        if (fetchError) throw fetchError;

        // حفظ البيانات للاستخدام لاحقاً
        pendingRejectionRequestId = requestId;
        pendingRejectionRequestData = request;

        // عرض معلومات الطلب في النافذة المنبثقة
        document.getElementById('rejectionSurveyTitle').textContent = request.survey_title;
        document.getElementById('rejectionRequesterName').textContent = request.requester_name;
        document.getElementById('rejectionReasonText').value = '';

        // فتح النافذة المنبثقة
        openRejectionModal();

    } catch (error) {
        console.error('خطأ في تحميل بيانات الطلب:', error);
        alert('حدث خطأ في تحميل بيانات الطلب');
    }
}

// فتح النافذة المنبثقة
function openRejectionModal() {
    const modal = document.getElementById('rejectionModal');
    if (modal) {
        modal.classList.add('active');
        // التركيز على حقل النص
        setTimeout(() => {
            document.getElementById('rejectionReasonText').focus();
        }, 300);
    }
}

// إغلاق النافذة المنبثقة
function closeRejectionModal() {
    const modal = document.getElementById('rejectionModal');
    if (modal) {
        modal.classList.remove('active');
        pendingRejectionRequestId = null;
        pendingRejectionRequestData = null;
        document.getElementById('rejectionReasonText').value = '';
    }
}

// تأكيد الرفض وإرسال البريد الإلكتروني
async function confirmRejection() {
    const rejectionReason = document.getElementById('rejectionReasonText').value.trim();

    // التحقق من إدخال سبب الرفض
    if (!rejectionReason) {
        alert('يرجى كتابة سبب الرفض قبل المتابعة');
        document.getElementById('rejectionReasonText').focus();
        return;
    }

    if (rejectionReason.length < 20) {
        alert('يرجى كتابة سبب مفصل للرفض (على الأقل 20 حرفاً)');
        document.getElementById('rejectionReasonText').focus();
        return;
    }

    if (!pendingRejectionRequestId || !pendingRejectionRequestData) {
        alert('حدث خطأ: لم يتم العثور على بيانات الطلب');
        closeRejectionModal();
        return;
    }

    try {
        // تحديث حالة الطلب إلى مرفوض
        const { error: updateError } = await supabase
            .from('survey_requests')
            .update({ status: 'rejected' })
            .eq('id', pendingRejectionRequestId);

        if (updateError) throw updateError;

        // إرسال إشعار البريد الإلكتروني
        const emailData = {
            requester_email: pendingRejectionRequestData.requester_email,
            requester_name: pendingRejectionRequestData.requester_name,
            survey_title: pendingRejectionRequestData.survey_title
        };

        const emailResult = await sendRejectionEmail(emailData, rejectionReason);

        // إغلاق النافذة المنبثقة
        closeRejectionModal();

        if (emailResult.success) {
            alert('تم رفض الطلب بنجاح!\nتم إرسال إشعار الرفض مع السبب إلى البريد الإلكتروني للمستخدم.');
        } else {
            alert('تم رفض الطلب بنجاح!\nتحذير: فشل إرسال إشعار البريد الإلكتروني. يرجى التحقق من إعدادات EmailJS.');
            console.error('Email notification failed:', emailResult.error);
        }

        // تحديث البيانات
        await loadRequests();
        await loadStatistics();

    } catch (error) {
        console.error('خطأ في رفض الطلب:', error);
        alert('حدث خطأ في رفض الطلب');
        closeRejectionModal();
    }
}

// إغلاق النافذة عند النقر خارجها
document.addEventListener('click', function(event) {
    const modal = document.getElementById('rejectionModal');
    if (modal && event.target === modal) {
        closeRejectionModal();
    }
});

// إغلاق النافذة عند الضغط على ESC
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modal = document.getElementById('rejectionModal');
        if (modal && modal.classList.contains('active')) {
            closeRejectionModal();
        }
    }
});

/* ===================================
   عرض تفاصيل الطلب
   =================================== */

async function viewRequest(requestId) {
    try {
        const { data, error } = await supabase
            .from('survey_requests')
            .select(`
                *,
                categories (
                    name
                )
            `)
            .eq('id', requestId)
            .single();

        if (error) throw error;

        const details = `
التاريخ: ${formatDate(data.created_at)}
الاسم: ${data.requester_name}
البريد الإلكتروني: ${data.requester_email}
عنوان الاستبيان: ${data.survey_title}
الوصف: ${data.survey_description}
التصنيف: ${data.categories ? data.categories.name : 'غير محدد'}
الرابط: ${data.survey_link}
الحالة: ${data.status}
        `;

        alert(details);

    } catch (error) {
        console.error('خطأ في عرض الطلب:', error);
        alert('حدث خطأ في عرض تفاصيل الطلب');
    }
}

/* ===================================
   تحميل التصنيفات
   =================================== */

async function loadCategories() {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('id', { ascending: true });

        if (error) throw error;

        renderCategories(data || []);
    } catch (error) {
        console.error('خطأ في تحميل التصنيفات:', error);
        document.getElementById('categoriesTableBody').innerHTML = 
            '<tr><td colspan="4">حدث خطأ في تحميل التصنيفات</td></tr>';
    }
}

/* ===================================
   عرض التصنيفات
   =================================== */

async function renderCategories(categories) {
    const tbody = document.getElementById('categoriesTableBody');
    if (!tbody) return;

    if (categories.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">لا توجد تصنيفات</td></tr>';
        return;
    }

    let html = '';
    for (const category of categories) {
        // عدد الاستبيانات في هذا التصنيف
        const { count } = await supabase
            .from('surveys')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id);

        html += `
            <tr>
                <td>${category.id}</td>
                <td>${escapeHtml(category.name)}</td>
                <td>${count || 0}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-edit btn-small" onclick="editCategory(${category.id}, '${escapeHtml(category.name)}')">تعديل</button>
                        <button class="btn-delete btn-small" onclick="deleteCategory(${category.id})">حذف</button>
                    </div>
                </td>
            </tr>
        `;
    }

    tbody.innerHTML = html;
}

/* ===================================
   إضافة تصنيف جديد
   =================================== */

async function handleAddCategory(e) {
    e.preventDefault();

    const categoryName = document.getElementById('newCategoryName').value.trim();

    if (!categoryName) {
        alert('يرجى إدخال اسم التصنيف');
        return;
    }

    try {
        const { error } = await supabase
            .from('categories')
            .insert([{ name: categoryName }]);

        if (error) throw error;

        alert('تمت إضافة التصنيف بنجاح');
        e.target.reset();
        await loadCategories();

    } catch (error) {
        console.error('خطأ في إضافة التصنيف:', error);
        alert('حدث خطأ في إضافة التصنيف');
    }
}

/* ===================================
   تعديل تصنيف
   =================================== */

async function editCategory(categoryId, currentName) {
    const newName = prompt('أدخل الاسم الجديد للتصنيف:', currentName);

    if (!newName || newName.trim() === '') {
        return;
    }

    try {
        const { error } = await supabase
            .from('categories')
            .update({ name: newName.trim() })
            .eq('id', categoryId);

        if (error) throw error;

        alert('تم تعديل التصنيف بنجاح');
        await loadCategories();

    } catch (error) {
        console.error('خطأ في تعديل التصنيف:', error);
        alert('حدث خطأ في تعديل التصنيف');
    }
}

/* ===================================
   حذف تصنيف
   =================================== */

async function deleteCategory(categoryId) {
    if (!confirm('هل أنت متأكد من حذف هذا التصنيف؟ سيؤثر ذلك على الاستبيانات المرتبطة به.')) {
        return;
    }

    try {
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', categoryId);

        if (error) throw error;

        alert('تم حذف التصنيف بنجاح');
        await loadCategories();

    } catch (error) {
        console.error('خطأ في حذف التصنيف:', error);
        alert('حدث خطأ في حذف التصنيف. تأكد من عدم وجود استبيانات مرتبطة به.');
    }
}

/* ===================================
   تحميل الرسائل
   =================================== */

async function loadMessages() {
    try {
        const { data, error } = await supabase
            .from('contact_messages')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        renderMessages(data || []);
    } catch (error) {
        console.error('خطأ في تحميل الرسائل:', error);
        document.getElementById('messagesTableBody').innerHTML = 
            '<tr><td colspan="5">حدث خطأ في تحميل الرسائل</td></tr>';
    }
}

/* ===================================
   عرض الرسائل
   =================================== */

function renderMessages(messages) {
    const tbody = document.getElementById('messagesTableBody');
    if (!tbody) return;

    if (messages.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">لا توجد رسائل</td></tr>';
        return;
    }

    let html = '';
    messages.forEach(message => {
        html += `
            <tr>
                <td>${formatDate(message.created_at)}</td>
                <td>${escapeHtml(message.name)}</td>
                <td>${escapeHtml(message.email)}</td>
                <td>${escapeHtml(message.message)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-delete btn-small" onclick="deleteMessage(${message.id})">حذف</button>
                    </div>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

/* ===================================
   حذف رسالة
   =================================== */

async function deleteMessage(messageId) {
    if (!confirm('هل أنت متأكد من حذف هذه الرسالة؟')) {
        return;
    }

    try {
        const { error } = await supabase
            .from('contact_messages')
            .delete()
            .eq('id', messageId);

        if (error) throw error;

        alert('تم حذف الرسالة بنجاح');
        await loadMessages();
        await loadStatistics();

    } catch (error) {
        console.error('خطأ في حذف الرسالة:', error);
        alert('حدث خطأ في حذف الرسالة');
    }
}

/* ===================================
   تحميل الاستبيانات المنشورة
   =================================== */

async function loadPublishedSurveys() {
    try {
        const { data, error } = await supabase
            .from('surveys')
            .select(`
                *,
                categories (
                    name
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        renderPublishedSurveys(data || []);
    } catch (error) {
        console.error('خطأ في تحميل الاستبيانات:', error);
        document.getElementById('surveysTableBody').innerHTML = 
            '<tr><td colspan="5">حدث خطأ في تحميل الاستبيانات</td></tr>';
    }
}

/* ===================================
   عرض الاستبيانات المنشورة
   =================================== */

function renderPublishedSurveys(surveys) {
    const tbody = document.getElementById('surveysTableBody');
    if (!tbody) return;

    if (surveys.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">لا توجد استبيانات منشورة</td></tr>';
        return;
    }

    let html = '';
    surveys.forEach(survey => {
        const internalLink = `survey.html?s=${survey.public_slug}`;
        const statusBadge = survey.is_active 
            ? '<span class="status-badge status-approved">نشط</span>' 
            : '<span class="status-badge status-rejected">متوقف</span>';
        
        html += `
            <tr>
                <td>${formatDate(survey.created_at)}</td>
                <td>${escapeHtml(survey.title)}</td>
                <td>${survey.categories ? escapeHtml(survey.categories.name) : 'غير محدد'}</td>
                <td>
                    <a href="${internalLink}" target="_blank" style="color: var(--primary-color);">
                        ${window.location.origin}/${internalLink}
                    </a>
                </td>
                <td>${survey.click_count || 0}</td>
                <td>${statusBadge}</td>
                <td>
                    <div class="action-buttons">
                        ${survey.is_active 
                            ? `<button class="btn-edit btn-small" onclick="toggleSurveyStatus(${survey.id}, false)">إيقاف</button>`
                            : `<button class="btn-approve btn-small" onclick="toggleSurveyStatus(${survey.id}, true)">تفعيل</button>`
                        }
                        <button class="btn-delete btn-small" onclick="deleteSurvey(${survey.id})">حذف</button>
                    </div>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

/* ===================================
   تفعيل/إيقاف استبيان
   =================================== */

async function toggleSurveyStatus(surveyId, newStatus) {
    const action = newStatus ? 'تفعيل' : 'إيقاف';
    if (!confirm(`هل أنت متأكد من ${action} هذا الاستبيان؟`)) {
        return;
    }

    try {
        const { error } = await supabase
            .from('surveys')
            .update({ is_active: newStatus })
            .eq('id', surveyId);

        if (error) throw error;

        alert(`تم ${action} الاستبيان بنجاح`);
        await loadPublishedSurveys();

    } catch (error) {
        console.error(`خطأ في ${action} الاستبيان:`, error);
        alert(`حدث خطأ في ${action} الاستبيان`);
    }
}

/* ===================================
   حذف استبيان منشور
   =================================== */

async function deleteSurvey(surveyId) {
    if (!confirm('هل أنت متأكد من حذف هذا الاستبيان؟ سيتم حذف الطلب المرتبط به أيضاً.')) {
        return;
    }

    try {
        // حذف الطلب المرتبط أولاً (باستخدام survey_id)
        await supabase
            .from('survey_requests')
            .delete()
            .eq('survey_id', surveyId);

        // حذف الاستبيان
        const { error: deleteError } = await supabase
            .from('surveys')
            .delete()
            .eq('id', surveyId);

        if (deleteError) throw deleteError;

        alert('تم حذف الاستبيان والطلب المرتبط به بنجاح');
        await loadPublishedSurveys();
        await loadRequests();
        await loadStatistics();

    } catch (error) {
        console.error('خطأ في حذف الاستبيان:', error);
        alert('حدث خطأ في حذف الاستبيان');
    }
}

/* ===================================
   التبديل بين التبويبات
   =================================== */

function switchTab(tabName) {
    // إخفاء جميع المحتويات
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));

    // إزالة الفئة النشطة من جميع التبويبات
    const tabs = document.querySelectorAll('.admin-tab');
    tabs.forEach(tab => tab.classList.remove('active'));

    // إظهار المحتوى المطلوب
    const targetContent = document.getElementById(`${tabName}Tab`);
    if (targetContent) {
        targetContent.classList.add('active');
    }

    // تفعيل التبويب المطلوب
    const targetTab = document.querySelector(`[data-tab="${tabName}"]`);
    if (targetTab) {
        targetTab.classList.add('active');
    }

    currentTab = tabName;
}

/* ===================================
   توليد slug فريد
   =================================== */

async function generateUniqueSlug() {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let slug = '';
    let isUnique = false;
    
    while (!isUnique) {
        // توليد slug عشوائي بطول 8 أحرف
        slug = '';
        for (let i = 0; i < 8; i++) {
            slug += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        
        // التحقق من عدم وجود slug مشابه
        const { data, error } = await supabase
            .from('surveys')
            .select('id')
            .eq('public_slug', slug);
        
        // إذا لم يتم العثور على slug مشابه (data فارغة أو null)، فهو فريد
        if (!error && (!data || data.length === 0)) {
            isUnique = true;
        }
    }
    
    return slug;
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
