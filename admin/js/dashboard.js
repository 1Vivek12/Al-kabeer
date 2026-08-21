/* Al Kabeer Admin Dashboard Dynamic Real-Time Engine */
document.addEventListener('DOMContentLoaded', () => {

    // Configurable Supabase Credentials
    const SUPABASE_URL = "https://yueuvpvpzdizmrdgfwau.supabase.co";
    const SUPABASE_ANON_KEY = "sb_publishable_yGg4v1Uz35vj2xx5kJn8nw_BcXof5vs";

    let supabaseClient = null;
    if (window.supabase && SUPABASE_URL !== "YOUR_SUPABASE_URL_HERE") {
        try {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        } catch (e) {
            console.error("Dashboard Supabase error:", e);
        }
    }

    // Helper: Read LocalStorage Safely
    function getLocalItem(key, fallback = {}) {
        try {
            return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
        } catch (e) {
            return fallback;
        }
    }

    // Load & Render Dynamic Metrics
    async function loadDashboardMetrics() {
        // 1. HR Documents
        let hrDocsList = Object.values(getLocalItem('alkabeer_hr_documents', {}));
        if (supabaseClient) {
            try {
                const { data } = await supabaseClient.from('hr_documents').select('*');
                if (data && data.length > 0) {
                    const map = new Map();
                    hrDocsList.forEach(item => map.set(item.refNo, item));
                    data.forEach(item => map.set(item.refNo, item));
                    hrDocsList = Array.from(map.values());
                }
            } catch (err) {
                console.warn("Supabase fetch fallback to local:", err);
            }
        }

        // 2. Customer Enquiries
        let enquiriesList = getLocalItem('alkabeer_enquiries', [
            { id: 1, name: 'Mohammed Al-Thani', email: 'm.thani@qatar.qa', phone: '+974 5512 3456', service: 'HVAC Chiller Maintenance', message: 'Requesting quote for annual chiller maintenance of commercial tower in West Bay.', status: 'New', date: '2026-08-20' },
            { id: 2, name: 'Siddharth Mehta', email: 'sid.m@construction.com', phone: '+974 6690 1122', service: 'Concrete Crack Injection', message: 'Underground basement leakage injection required in Lusail site.', status: 'In Progress', date: '2026-08-19' },
            { id: 3, name: 'John Peterson', email: 'j.peterson@mep-qatar.com', phone: '+974 3344 5566', service: 'AC Spare Parts', message: 'Urgent requirement for 15 Carrier compressor units.', status: 'Closed', date: '2026-08-18' }
        ]);

        // Save default initial enquiries if none exist
        if (!localStorage.getItem('alkabeer_enquiries')) {
            localStorage.setItem('alkabeer_enquiries', JSON.stringify(enquiriesList));
        }

        // Calculate Stat Numbers
        const totalHrDocs = hrDocsList.length;
        const totalEnquiries = enquiriesList.length;
        const newEnquiries = enquiriesList.filter(e => e.status === 'New' || e.status === 'NEW').length;
        const verifiedDocs = hrDocsList.filter(d => d.status === 'VERIFIED' || d.status === 'VERIFIED').length;

        // Render Stat Cards
        const statHrEl = document.getElementById('statHrDocsCount');
        const statEnqEl = document.getElementById('statEnquiriesCount');
        const statNewEnqEl = document.getElementById('statNewEnquiriesCount');
        const statVerifiedEl = document.getElementById('statVerifiedCount');

        if (statHrEl) statHrEl.textContent = totalHrDocs;
        if (statEnqEl) statEnqEl.textContent = totalEnquiries;
        if (statNewEnqEl) statNewEnqEl.textContent = newEnquiries;
        if (statVerifiedEl) statVerifiedEl.textContent = verifiedDocs;

        // Render Recent Activity Tables
        renderRecentHrDocs(hrDocsList.slice(0, 5));
        renderRecentEnquiries(enquiriesList.slice(0, 5));
    }

    function renderRecentHrDocs(list) {
        const container = document.getElementById('recentHrDocsBody');
        if (!container) return;

        if (list.length === 0) {
            container.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #94a3b8; padding: 20px;">No generated documents yet.</td></tr>`;
            return;
        }

        container.innerHTML = list.map(d => `
            <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 12px; font-weight: 700; color: #1e3a8a;">${d.refNo}</td>
                <td style="padding: 10px 12px; font-weight: 600; text-transform: uppercase;">${d.empName}</td>
                <td style="padding: 10px 12px; color: #64748b;">${d.docTypeName || 'HR Document'}</td>
                <td style="padding: 10px 12px;"><span class="badge badge-success">VERIFIED</span></td>
            </tr>
        `).join('');
    }

    function renderRecentEnquiries(list) {
        const container = document.getElementById('recentEnquiriesBody');
        if (!container) return;

        if (list.length === 0) {
            container.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #94a3b8; padding: 20px;">No enquiries received yet.</td></tr>`;
            return;
        }

        container.innerHTML = list.map(e => {
            let badgeClass = 'badge-info';
            if (e.status === 'New' || e.status === 'NEW') badgeClass = 'badge-warning';
            if (e.status === 'Closed') badgeClass = 'badge-success';

            return `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 10px 12px; font-weight: 700; color: #0f172a;">${e.name}</td>
                    <td style="padding: 10px 12px; color: #475569;">${e.service}</td>
                    <td style="padding: 10px 12px; color: #64748b; font-size: 12px;">${e.date}</td>
                    <td style="padding: 10px 12px;"><span class="badge ${badgeClass}">${e.status}</span></td>
                </tr>
            `;
        }).join('');
    }

    loadDashboardMetrics();
});
