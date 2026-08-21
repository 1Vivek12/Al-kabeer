/* Al Kabeer Customer Enquiries Management Engine */
document.addEventListener('DOMContentLoaded', () => {

    const STORAGE_KEY = 'alkabeer_enquiries';

    // Initial Mock Enquiries if storage is empty
    const initialEnquiries = [
        { id: 'ENQ-1001', name: 'Mohammed Al-Thani', email: 'm.thani@qatar.qa', phone: '+974 5512 3456', service: 'HVAC Chiller Maintenance', message: 'Requesting formal quote for annual chiller maintenance of 2 commercial towers in West Bay, Doha.', status: 'New', date: '2026-08-20' },
        { id: 'ENQ-1002', name: 'Siddharth Mehta', email: 'sid.m@construction.com', phone: '+974 6690 1122', service: 'Concrete Crack Injection', message: 'Underground basement wall leakage injection required urgently at Lusail project site.', status: 'In Progress', date: '2026-08-19' },
        { id: 'ENQ-1003', name: 'John Peterson', email: 'j.peterson@mep-qatar.com', phone: '+974 3344 5566', service: 'AC Spare Parts', message: 'Urgent requirement for 15 Carrier compressor units and fan motors.', status: 'Closed', date: '2026-08-18' },
        { id: 'ENQ-1004', name: 'Tariq Mansoor', email: 'tariq@gulfrealestate.qa', phone: '+974 4455 6677', service: 'Roof Waterproofing', message: 'Roof membrane waterproofing needed for 4 residential villas in Al Waab.', status: 'New', date: '2026-08-17' }
    ];

    function getEnquiries() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : initialEnquiries;
        } catch (e) {
            return initialEnquiries;
        }
    }

    function saveEnquiries(list) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        renderEnquiriesTable();
        updateStats();
    }

    // Elements
    const enquiriesTableBody = document.getElementById('enquiriesTableBody');
    const searchInput = document.getElementById('enquirySearch');
    const statusFilter = document.getElementById('enquiryStatusFilter');
    const detailModal = document.getElementById('enquiryDetailModal');

    function updateStats() {
        const list = getEnquiries();
        const total = list.length;
        const countNew = list.filter(e => e.status === 'New').length;
        const countProgress = list.filter(e => e.status === 'In Progress').length;
        const countClosed = list.filter(e => e.status === 'Closed').length;

        if (document.getElementById('statTotalEnq')) document.getElementById('statTotalEnq').textContent = total;
        if (document.getElementById('statNewEnq')) document.getElementById('statNewEnq').textContent = countNew;
        if (document.getElementById('statProgressEnq')) document.getElementById('statProgressEnq').textContent = countProgress;
        if (document.getElementById('statClosedEnq')) document.getElementById('statClosedEnq').textContent = countClosed;
    }

    function renderEnquiriesTable() {
        if (!enquiriesTableBody) return;
        const list = getEnquiries();
        const query = (searchInput ? searchInput.value : '').trim().toLowerCase();
        const filterVal = statusFilter ? statusFilter.value : 'ALL';

        const filtered = list.filter(item => {
            const matchesQuery = !query || 
                (item.name && item.name.toLowerCase().includes(query)) ||
                (item.email && item.email.toLowerCase().includes(query)) ||
                (item.phone && item.phone.toLowerCase().includes(query)) ||
                (item.service && item.service.toLowerCase().includes(query));

            const matchesStatus = filterVal === 'ALL' || item.status === filterVal;
            return matchesQuery && matchesStatus;
        });

        if (filtered.length === 0) {
            enquiriesTableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 35px; color: #64748b;">
                        <i class="bi bi-inbox" style="font-size: 32px; display: block; margin-bottom: 8px; color: #94a3b8;"></i>
                        No matching customer enquiries found.
                    </td>
                </tr>
            `;
            return;
        }

        enquiriesTableBody.innerHTML = filtered.map(e => {
            let badgeStyle = 'badge-info';
            if (e.status === 'New') badgeStyle = 'badge-warning';
            if (e.status === 'In Progress') badgeStyle = 'badge-info';
            if (e.status === 'Closed') badgeStyle = 'badge-success';

            return `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 12px 14px; font-weight: 700; color: #1e3a8a;">${e.id || 'ENQ'}</td>
                    <td style="padding: 12px 14px; font-weight: 700; color: #0f172a;">${e.name}</td>
                    <td style="padding: 12px 14px; color: #475569; font-size: 13px;">${e.email}<br><small style="color: #64748b;">${e.phone}</small></td>
                    <td style="padding: 12px 14px; font-weight: 600; color: #0175b2;">${e.service}</td>
                    <td style="padding: 12px 14px; color: #64748b; font-size: 12.5px;">${e.date}</td>
                    <td style="padding: 12px 14px;"><span class="badge ${badgeStyle}">${e.status}</span></td>
                    <td style="padding: 12px 14px; text-align: center;">
                        <div style="display: flex; gap: 6px; justify-content: center;">
                            <button onclick="window.viewEnquiry('${e.id}')" style="background: #1e3a8a; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                                <i class="bi bi-eye-fill"></i> View
                            </button>
                            <button onclick="window.deleteEnquiry('${e.id}')" style="background: #ef4444; color: #fff; border: none; padding: 6px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">
                                <i class="bi bi-trash-fill"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // View Modal
    window.viewEnquiry = function(id) {
        const list = getEnquiries();
        const item = list.find(e => e.id === id);
        if (!item) return;

        document.getElementById('modalEnqId').textContent = item.id;
        document.getElementById('modalEnqName').textContent = item.name;
        document.getElementById('modalEnqEmail').textContent = item.email;
        document.getElementById('modalEnqPhone').textContent = item.phone;
        document.getElementById('modalEnqService').textContent = item.service;
        document.getElementById('modalEnqDate').textContent = item.date;
        document.getElementById('modalEnqMessage').textContent = item.message;
        document.getElementById('modalStatusSelect').value = item.status;

        // Save active id on modal
        detailModal.setAttribute('data-active-id', item.id);
        detailModal.style.display = 'flex';
    };

    // Delete Enquiry
    window.deleteEnquiry = function(id) {
        if (confirm(`Are you sure you want to delete enquiry record ${id}?`)) {
            let list = getEnquiries();
            list = list.filter(e => e.id !== id);
            saveEnquiries(list);
        }
    };

    // Close Modal
    document.querySelectorAll('.close-modal-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (detailModal) detailModal.style.display = 'none';
        });
    });

    // Save Status Change from Modal
    const btnSaveStatus = document.getElementById('btnSaveEnquiryStatus');
    if (btnSaveStatus) {
        btnSaveStatus.addEventListener('click', () => {
            const activeId = detailModal.getAttribute('data-active-id');
            const newStatus = document.getElementById('modalStatusSelect').value;
            let list = getEnquiries();
            const index = list.findIndex(e => e.id === activeId);
            if (index !== -1) {
                list[index].status = newStatus;
                saveEnquiries(list);
                detailModal.style.display = 'none';
            }
        });
    }

    // Search and Filter Listeners
    if (searchInput) searchInput.addEventListener('input', renderEnquiriesTable);
    if (statusFilter) statusFilter.addEventListener('change', renderEnquiriesTable);

    // Initial Load
    if (!localStorage.getItem(STORAGE_KEY)) {
        saveEnquiries(initialEnquiries);
    } else {
        renderEnquiriesTable();
        updateStats();
    }
});
