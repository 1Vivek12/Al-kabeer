// AL KABEER ADMIN - MASTER DOCUMENT REGISTRY CONTROLLER (admin/js/history.js)

document.addEventListener('DOMContentLoaded', async () => {
    const SUPABASE_URL = "https://yueuvpvpzdizmrdgfwau.supabase.co";
    const SUPABASE_ANON_KEY = "sb_publishable_yGg4v1Uz35vj2xx5kJn8nw_BcXof5vs";

    let supabaseClient = null;
    if (window.supabase) {
        try {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        } catch (e) {
            console.error("Supabase init error:", e);
        }
    }

    const historyTableBody = document.getElementById('historyTableBody');
    const historySearchInput = document.getElementById('historySearchInput');
    const btnExportCsv = document.getElementById('btnExportCsv');

    window.cachedHistoryRecords = [];

    // Fetch and merge records from Supabase Cloud + LocalStorage
    async function loadMasterRegistry() {
        let localDocs = {};
        try {
            localDocs = JSON.parse(localStorage.getItem('alkabeer_hr_documents') || '{}');
        } catch (e) {
            console.error("Error reading localStorage:", e);
        }

        let cloudDocs = [];
        if (supabaseClient) {
            try {
                const { data, error } = await supabaseClient
                    .from('hr_documents')
                    .select('*')
                    .order('generatedAt', { ascending: false });

                if (!error && data) {
                    cloudDocs = data;
                }
            } catch (err) {
                console.error("Supabase select error:", err);
            }
        }

        const map = new Map();

        // Add LocalStorage records first
        Object.values(localDocs).forEach(doc => {
            if (doc && doc.refNo) map.set(doc.refNo, doc);
        });

        // Merge Supabase records (takes priority for live sync)
        cloudDocs.forEach(doc => {
            if (doc && doc.refNo) map.set(doc.refNo, doc);
        });

        window.cachedHistoryRecords = Array.from(map.values()).sort((a,b) => {
            return new Date(b.generatedAt || 0) - new Date(a.generatedAt || 0);
        });

        renderTable(window.cachedHistoryRecords);
    }

    // Render registry table rows
    function renderTable(records) {
        if (!historyTableBody) return;

        if (records.length === 0) {
            historyTableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="padding: 30px; text-align: center; color: #64748b; font-weight: 600;">
                        No document records found in registry. Click "Create New Letter" to generate documents.
                    </td>
                </tr>
            `;
            return;
        }

        historyTableBody.innerHTML = records.map(rec => {
            const verifyUrl = `${window.location.origin}/verify.html?ref=${encodeURIComponent(rec.refNo)}`;
            const typeLabel = rec.docTypeName || rec.docType || 'HR Document';

            return `
                <tr style="border-bottom: 1px solid #e2e8f0; background: #ffffff; transition: background 0.15s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='#ffffff'">
                    <td style="padding: 12px 14px; font-weight: 800; color: #1e3a8a;">${rec.refNo}</td>
                    <td style="padding: 12px 14px; font-weight: 700; color: #0f172a; text-transform: uppercase;">${rec.empName}</td>
                    <td style="padding: 12px 14px; font-weight: 600; color: #334155; text-transform: uppercase;">${rec.empIdNo}</td>
                    <td style="padding: 12px 14px; font-weight: 600; color: #334155; text-transform: uppercase;">${rec.empTitle}</td>
                    <td style="padding: 12px 14px;"><span style="background: #eff6ff; color: #1d4ed8; padding: 3px 8px; border-radius: 4px; font-size: 11.5px; font-weight: 700; border: 1px solid #bfdbfe;">${typeLabel}</span></td>
                    <td style="padding: 12px 14px; color: #475569; font-weight: 600;">${rec.docDate || ''}</td>
                    <td style="padding: 12px 14px;"><span style="background: #f0fdf4; color: #15803d; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: 800; border: 1px solid #bbf7d0;">🟢 VERIFIED</span></td>
                    <td style="padding: 12px 14px; text-align: center;">
                        <div style="display: flex; gap: 6px; justify-content: center; flex-wrap: wrap;">
                            <a href="${verifyUrl}" target="_blank" style="background: #1e3a8a; color: #fff; padding: 6px 10px; border-radius: 6px; text-decoration: none; font-size: 11px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
                                <i class="bi bi-shield-check"></i> Verify
                            </a>
                            <button onclick="window.copyVerifyLink('${rec.refNo}')" style="background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; padding: 6px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;" title="Copy Verification Link">
                                <i class="bi bi-link-45deg"></i> Copy Link
                            </button>
                            <a href="hr.html?ref=${encodeURIComponent(rec.refNo)}" style="background: #0175b2; color: #fff; border: none; padding: 6px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
                                <i class="bi bi-pencil-square"></i> Load & Print
                            </a>
                            <button onclick="window.deleteRecord('${rec.refNo}')" style="background: #ef4444; color: #fff; border: none; padding: 6px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;" title="Delete Record">
                                <i class="bi bi-trash-fill"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Live search filter
    if (historySearchInput) {
        historySearchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim().toLowerCase();
            const list = window.cachedHistoryRecords || [];
            if (!query) {
                renderTable(list);
                return;
            }
            const filtered = list.filter(r => 
                (r.refNo && r.refNo.toLowerCase().includes(query)) ||
                (r.empName && r.empName.toLowerCase().includes(query)) ||
                (r.empIdNo && r.empIdNo.toLowerCase().includes(query)) ||
                (r.empTitle && r.empTitle.toLowerCase().includes(query))
            );
            renderTable(filtered);
        });
    }

    // Export Registry to CSV / Excel
    if (btnExportCsv) {
        btnExportCsv.addEventListener('click', () => {
            const records = window.cachedHistoryRecords || [];
            if (records.length === 0) {
                alert("No records found in registry to export.");
                return;
            }

            const headers = ["Ref No", "Employee Name", "Passport No", "Designation", "Nationality", "Doc Type", "Doc Date", "Date of Joining", "Salary & Benefits", "Status"];
            const rows = records.map(r => [
                `"${r.refNo || ''}"`,
                `"${r.empName || ''}"`,
                `"${r.empIdNo || ''}"`,
                `"${r.empTitle || ''}"`,
                `"${r.empNat || ''}"`,
                `"${r.docTypeName || ''}"`,
                `"${r.docDate || ''}"`,
                `"${r.empDoj || ''}"`,
                `"${(r.salaryString || '').replace(/"/g, '""')}"`,
                `"${r.status || 'VERIFIED'}"`
            ]);

            const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `alkabeer_hr_registry_${new Date().toISOString().slice(0,10)}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    // Global helper: Copy Verification Link
    window.copyVerifyLink = function(refNo) {
        const url = `${window.location.origin}/verify.html?ref=${encodeURIComponent(refNo)}`;
        navigator.clipboard.writeText(url).then(() => {
            alert(`Verification URL copied to clipboard:\n${url}`);
        }).catch(err => {
            prompt("Copy this verification URL:", url);
        });
    };

    // Global helper: Delete Record from Registry
    window.deleteRecord = async function(refNo) {
        if (!confirm(`Are you sure you want to permanently delete document record [${refNo}] from registry?`)) return;

        // 1. Remove from LocalStorage
        try {
            let docs = JSON.parse(localStorage.getItem('alkabeer_hr_documents') || '{}');
            delete docs[refNo];
            localStorage.setItem('alkabeer_hr_documents', JSON.stringify(docs));
        } catch (e) {
            console.error("Error deleting from LocalStorage:", e);
        }

        // 2. Remove from Supabase
        if (supabaseClient) {
            try {
                await supabaseClient.from('hr_documents').delete().eq('refNo', refNo);
                console.log("Deleted record from Supabase:", refNo);
            } catch (err) {
                console.error("Supabase delete error:", err);
            }
        }

        // Re-load table
        await loadMasterRegistry();
    };

    // Initial Load
    await loadMasterRegistry();
});
