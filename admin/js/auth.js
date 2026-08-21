/* Al Kabeer Admin Authentication & Access Control System */
(function() {
    const AUTH_KEY = 'alkabeer_admin_auth';
    const AUTH_USER_KEY = 'alkabeer_admin_user';

    // Public pages that don't require authentication (e.g. login.html or /admin/login)
    const currentPath = window.location.pathname.toLowerCase();
    const isLoginPage = currentPath.includes('login');

    // Check if user is authenticated
    function isAuthenticated() {
        try {
            return sessionStorage.getItem(AUTH_KEY) === 'true' || localStorage.getItem(AUTH_KEY) === 'true';
        } catch (e) {
            return false;
        }
    }

    // Auth Guard: Redirect to login page if unauthenticated
    if (!isAuthenticated() && !isLoginPage) {
        if (!window.location.pathname.includes('login')) {
            window.location.href = 'login.html';
        }
        return;
    }

    // If authenticated and currently on login page, redirect to index.html
    if (isAuthenticated() && isLoginPage) {
        if (!window.location.pathname.includes('index') && !window.location.pathname.includes('dashboard')) {
            window.location.href = 'index.html';
        }
        return;
    }

    // Expose global Auth functions
    window.AdminAuth = {
        login: function(username, password, rememberMe) {
            const cleanUser = (username || '').trim();
            const cleanPass = (password || '').trim();

            // Default Admin Credentials
            if ((cleanUser === 'admin' || cleanUser === 'hr.admin@alkabeer.com') && cleanPass === 'alkabeer2026') {
                const storage = rememberMe ? localStorage : sessionStorage;
                storage.setItem(AUTH_KEY, 'true');
                storage.setItem(AUTH_USER_KEY, JSON.stringify({
                    name: cleanUser === 'admin' ? 'Super Admin' : 'HR Manager',
                    username: cleanUser,
                    role: 'Administrator',
                    loginTime: new Date().toISOString()
                }));
                return { success: true };
            }
            return { success: false, message: 'Invalid username or password. Please try again.' };
        },

        logout: function() {
            sessionStorage.removeItem(AUTH_KEY);
            sessionStorage.removeItem(AUTH_USER_KEY);
            localStorage.removeItem(AUTH_KEY);
            localStorage.removeItem(AUTH_USER_KEY);
            window.location.href = '/admin/login.html';
        },

        getUser: function() {
            try {
                const data = localStorage.getItem(AUTH_USER_KEY) || sessionStorage.getItem(AUTH_USER_KEY);
                return data ? JSON.parse(data) : { name: 'Admin User', role: 'Administrator' };
            } catch (e) {
                return { name: 'Admin User', role: 'Administrator' };
            }
        }
    };

    // Auto-bind user details & logout handlers on DOM load
    document.addEventListener('DOMContentLoaded', function() {
        const user = window.AdminAuth.getUser();
        
        // Update user display name if element exists
        const userSpan = document.querySelector('.user-profile span');
        if (userSpan) {
            userSpan.textContent = user.name || 'Admin User';
        }

        // Add Logout Handler to any logout button
        document.querySelectorAll('.btn-logout').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                if (confirm('Are you sure you want to log out of Al Kabeer Admin Panel?')) {
                    window.AdminAuth.logout();
                }
            });
        });

        // Mobile Sidebar Toggle & Backdrop Overlay Handler
        const mobileToggle = document.getElementById('mobileSidebarToggle');
        const sidebar = document.querySelector('.sidebar');
        if (mobileToggle && sidebar) {
            let overlay = document.getElementById('sidebarOverlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'sidebarOverlay';
                overlay.className = 'sidebar-overlay';
                document.body.appendChild(overlay);
            }

            function toggleMobileSidebar() {
                const isOpen = sidebar.classList.toggle('show-mobile');
                if (isOpen) {
                    overlay.classList.add('show-mobile');
                } else {
                    overlay.classList.remove('show-mobile');
                }
            }

            mobileToggle.addEventListener('click', function(e) {
                e.stopPropagation();
                toggleMobileSidebar();
            });

            overlay.addEventListener('click', function() {
                sidebar.classList.remove('show-mobile');
                overlay.classList.remove('show-mobile');
            });
        }
    });
})();
