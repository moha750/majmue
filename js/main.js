/* ===================================
   الصفحة الرئيسية - main.js
   =================================== */

// المتغيرات العامة
let currentCategory = 'all';
let allSurveys = [];
let categories = [];

/* ===================================
   تحميل البيانات عند بدء الصفحة
   =================================== */

document.addEventListener('DOMContentLoaded', async () => {
    await loadCategories();
    await loadSurveys();
    setupEventListeners();
});

/* ===================================
   تحميل التصنيفات من قاعدة البيانات
   =================================== */

async function loadCategories() {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('id', { ascending: true });

        if (error) throw error;

        categories = data || [];
        renderCategories();
    } catch (error) {
        console.error('خطأ في تحميل التصنيفات:', error);
        showMessage('categoriesError', 'حدث خطأ في تحميل التصنيفات', 'error');
    }
}

/* ===================================
   عرض التصنيفات في الواجهة
   =================================== */

function renderCategories() {
    const categoriesContainer = document.getElementById('categoriesTabs');
    if (!categoriesContainer) return;

    // إضافة زر "الكل"
    let html = '<button class="category-tab active" data-category="all">الكل</button>';

    // إضافة باقي التصنيفات
    categories.forEach(category => {
        html += `<button class="category-tab" data-category="${category.id}">${category.name}</button>`;
    });

    categoriesContainer.innerHTML = html;

    // إضافة مستمعي الأحداث للتصنيفات
    const categoryTabs = categoriesContainer.querySelectorAll('.category-tab');
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // إزالة الفئة النشطة من جميع الأزرار
            categoryTabs.forEach(t => t.classList.remove('active'));
            // إضافة الفئة النشطة للزر المضغوط
            tab.classList.add('active');
            // تحديث التصنيف الحالي
            currentCategory = tab.dataset.category;
            // تصفية الاستبيانات
            filterSurveys();
        });
    });
}

/* ===================================
   تحميل الاستبيانات من قاعدة البيانات
   =================================== */

async function loadSurveys() {
    try {
        const { data, error } = await supabase
            .from('surveys')
            .select(`
                *,
                categories (
                    id,
                    name
                )
            `)
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) throw error;

        allSurveys = data || [];
        renderSurveys(allSurveys);
    } catch (error) {
        console.error('خطأ في تحميل الاستبيانات:', error);
        const surveysGrid = document.getElementById('surveysGrid');
        if (surveysGrid) {
            surveysGrid.innerHTML = '<div class="empty-state"><h3>حدث خطأ في تحميل الاستبيانات</h3><p>يرجى المحاولة مرة أخرى لاحقًا</p></div>';
        }
    }
}

/* ===================================
   تصفية الاستبيانات حسب التصنيف
   =================================== */

function filterSurveys() {
    let filteredSurveys = allSurveys;

    if (currentCategory !== 'all') {
        filteredSurveys = allSurveys.filter(survey => 
            survey.category_id == currentCategory
        );
    }

    renderSurveys(filteredSurveys);
}

/* ===================================
   عرض الاستبيانات في الواجهة
   =================================== */

function renderSurveys(surveys) {
    const surveysGrid = document.getElementById('surveysGrid');
    if (!surveysGrid) return;

    // إذا لم يكن هناك استبيانات
    if (!surveys || surveys.length === 0) {
        surveysGrid.innerHTML = `
            <div class="empty-state">
                <h3>لا توجد استبيانات</h3>
                <p>لم يتم نشر أي استبيانات في هذا التصنيف بعد</p>
            </div>
        `;
        return;
    }

    // عرض الاستبيانات
    let html = '';
    surveys.forEach(survey => {
        const categoryName = survey.categories ? survey.categories.name : 'غير محدد';
        const internalLink = `survey.html?s=${survey.public_slug}`;
        
        html += `
            <div class="survey-card">
                <h3 class="survey-card-title">${escapeHtml(survey.title)}</h3>
                <p class="survey-card-description">${escapeHtml(survey.description || 'لا يوجد وصف')}</p>
                <span class="survey-card-category">${escapeHtml(categoryName)}</span>
                <a href="${internalLink}" class="survey-card-link">
                    المشاركة في الاستبيان
                </a>
            </div>
        `;
    });

    surveysGrid.innerHTML = html;
}

/* ===================================
   إعداد مستمعي الأحداث
   =================================== */

function setupEventListeners() {
    // نموذج التواصل
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
}

/* ===================================
   معالجة إرسال نموذج التواصل
   =================================== */

async function handleContactSubmit(e) {
    e.preventDefault();

    const formData = {
        name: document.getElementById('contactName').value,
        email: document.getElementById('contactEmail').value,
        message: document.getElementById('contactMessage').value
    };

    try {
        const { data, error } = await supabase
            .from('contact_messages')
            .insert([formData]);

        if (error) throw error;

        // عرض رسالة نجاح
        showMessage('contactMessage', 'تم إرسال رسالتك بنجاح! سنتواصل معك قريبًا.', 'success');
        
        // إعادة تعيين النموذج
        e.target.reset();
    } catch (error) {
        console.error('خطأ في إرسال الرسالة:', error);
        showMessage('contactMessage', 'حدث خطأ في إرسال الرسالة. يرجى المحاولة مرة أخرى.', 'error');
    }
}

/* ===================================
   دوال مساعدة
   =================================== */

// تنظيف النصوص من HTML لمنع XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
