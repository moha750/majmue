/* ===================================
   صفحة تسجيل الدخول - login.js
   =================================== */

/* ===================================
   إعداد مستمعي الأحداث
   =================================== */

document.addEventListener('DOMContentLoaded', () => {
    // التحقق من حالة المصادقة
    checkAuthAndRedirect();
    
    // نموذج تسجيل الدخول
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

/* ===================================
   التحقق من المصادقة وإعادة التوجيه
   =================================== */

async function checkAuthAndRedirect() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
            // المستخدم مسجل دخول، إعادة توجيه إلى لوحة التحكم
            window.location.href = 'admin.html';
        }
    } catch (error) {
        console.error('خطأ في التحقق من حالة المصادقة:', error);
    }
}

/* ===================================
   معالجة تسجيل الدخول
   =================================== */

async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) throw error;

        // تسجيل الدخول نجح، إعادة التوجيه إلى لوحة التحكم
        showMessage('loginMessage', 'تم تسجيل الدخول بنجاح! جاري التوجيه...', 'success');
        
        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 1000);
        
    } catch (error) {
        console.error('خطأ في تسجيل الدخول:', error);
        showMessage('loginMessage', 'خطأ في تسجيل الدخول. تحقق من البريد الإلكتروني وكلمة المرور.', 'error');
    }
}
