document.addEventListener('DOMContentLoaded', () => {

    // Configurable Supabase Credentials (Set your credentials here to sync with Supabase)
    const SUPABASE_URL = "https://yueuvpvpzdizmrdgfwau.supabase.co";
    const SUPABASE_ANON_KEY = "sb_publishable_yGg4v1Uz35vj2xx5kJn8nw_BcXof5vs";

    let supabaseClient = null;
    if (window.supabase && SUPABASE_URL !== "YOUR_SUPABASE_URL_HERE") {
        try {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log("🟢 Supabase Client initialized successfully!");
        } catch (e) {
            console.error("Supabase Initialization Error:", e);
        }
    }

    // Format date string YYYY-MM-DD -> DD/MM/YYYY without UTC timezone shift
    function formatDateGB(dateStr) {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return dateStr;
    }

    // Format date string DD/MM/YYYY -> YYYY-MM-DD for input[type="date"]
    function formatDateISO(dateStr) {
        if (!dateStr) return '';
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
        if (dateStr.includes('-')) return dateStr;
        return dateStr;
    }

    // Set default date of issue to today
    const todayObj = new Date();
    const yyyy = todayObj.getFullYear();
    const mm = String(todayObj.getMonth() + 1).padStart(2, '0');
    const dd = String(todayObj.getDate()).padStart(2, '0');
    const todayISO = `${yyyy}-${mm}-${dd}`;
    const todayFormatted = `${dd}/${mm}/${yyyy}`;

    const docDateInput = document.getElementById('docDate');
    if (docDateInput && !docDateInput.value) {
        docDateInput.value = todayISO;
    }

    const empDojInput = document.getElementById('empDoj');
    if (empDojInput && !empDojInput.value) {
        empDojInput.value = todayISO;
    }

    // SVG Default Avatar for ID Card fallback
    const defaultAvatarSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="120" viewBox="0 0 100 120" fill="%23cbd5e1"><rect width="100" height="120" fill="%23f1f5f9"/><circle cx="50" cy="45" r="22" fill="%2394a3b8"/><path d="M15,110 C15,80 35,70 50,70 C65,70 85,80 85,110 Z" fill="%2394a3b8"/></svg>`;

    const outPhoto = document.getElementById('outPhoto');
    if (outPhoto && (!outPhoto.src || outPhoto.src.includes('placeholder'))) {
        outPhoto.src = defaultAvatarSvg;
    }

    // Tab Elements & Templates
    const tabs = document.querySelectorAll('.doc-tab');
    const templates = {
        'offer': document.getElementById('offerTemplate'),
        'appointment': document.getElementById('apptTemplate'),
        'salary_cert': document.getElementById('salaryCertTemplate'),
        'idcard': document.getElementById('idCardTemplate'),
        'history': document.getElementById('historyTemplate')
    };
    const docTypeNames = {
        'offer': 'Employment Offer Letter & Preliminary Contract',
        'appointment': 'Official Appointment Letter',
        'salary_cert': 'Salary & Employment Certificate',
        'idcard': 'Employee ID Badge Card',
        'history': 'Document Registry History'
    };
    const photoSection = document.getElementById('photoSection');

    let currentDocType = 'offer';

    // Inputs to Outputs mapping
    const mappings = {
        'empName': { selector: '.outName', fallback: '[FULL NAME]' },
        'empTitle': { selector: '.outTitle', fallback: '[DESIGNATION]' },
        'empIdNo': { selector: '.outIdNo', fallback: '[PASSPORT NO]' },
        'empNat': { selector: '.outNat', fallback: '[NATIONALITY]' },
        'salaryString': { selector: '.outSalary', fallback: '[SALARY & BENEFITS]' },
        'refNo': { selector: '.outRefNo', fallback: 'QTR/AK:A01969' },
        'empQid': { selector: '#outQid', fallback: '[QID NO]' },
        'empDept': { selector: '#outDept', fallback: '[DEPARTMENT]' },
        'empBlood': { selector: '#outBlood', fallback: '[BLOOD GROUP]' },
        'termDurationEn': { selector: '.outTermDurationEn', fallback: '2 Years Renewable upon mutual agreement of both parties.' },
        'termDurationAr': { selector: '.outTermDurationAr', fallback: 'سنتان (2) قابلة للتجديد بموافقة الطرفين.' },
        'termProbationEn': { selector: '.outTermProbationEn', fallback: 'Maximum 6 Months from joining date as per Qatar Labor Law Art. 39.' },
        'termProbationAr': { selector: '.outTermProbationAr', fallback: '6 أشهر كحد أقصى من تاريخ المباشرة وفقاً للمادة (39) من قانون العمل القطري.' },
        'termHoursEn': { selector: '.outTermHoursEn', fallback: '8 Hours/day, 48 Hours/week (6 days/week) as per Qatar Labor Law Art. 73.' },
        'termHoursAr': { selector: '.outTermHoursAr', fallback: '8 ساعات يومياً بواقع 48 ساعة أسبوعياً (6 أيام عمل) وفقاً للمادة (73).' }
    };

    // Synchronize all form input values to document templates
    function updateAllFields() {
        // Date of Issue
        const docDateVal = docDateInput ? docDateInput.value : todayISO;
        const formattedDocDate = formatDateGB(docDateVal) || todayFormatted;
        document.querySelectorAll('.outDateOffer').forEach(el => el.textContent = formattedDocDate);

        // Date of Joining
        const dojVal = empDojInput ? empDojInput.value : '';
        const formattedDoj = formatDateGB(dojVal) || formattedDocDate;
        document.querySelectorAll('.outDoj').forEach(el => el.textContent = formattedDoj);

        // Text & String mappings
        Object.keys(mappings).forEach(inputId => {
            const inputEl = document.getElementById(inputId);
            const val = (inputEl && inputEl.value.trim()) ? inputEl.value.trim() : mappings[inputId].fallback;
            document.querySelectorAll(mappings[inputId].selector).forEach(outEl => {
                outEl.textContent = val;
            });
        });

        // Update Dynamic Verification QR Codes
        updateQRCodes();
    }

    // Render dynamic Verification QR Codes
    function updateQRCodes() {
        const refEl = document.getElementById('refNo');
        const refNo = (refEl && refEl.value.trim()) ? refEl.value.trim() : 'QTR/AK:A01969';
        
        // Target verification URL for scanning
        const verifyUrl = `https://www.alkabeercontracting.com/verify.html?ref=${encodeURIComponent(refNo)}`;

        const targets = [
            'qrOfferP1',
            'qrOfferP2',
            'qrAppt',
            'qrSalary',
            'qrIdCard'
        ];

        targets.forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                container.innerHTML = '';
                if (window.QRCode) {
                    new QRCode(container, {
                        text: verifyUrl,
                        width: 150,
                        height: 150,
                        colorDark: "#000000",
                        colorLight: "#ffffff",
                        correctLevel: QRCode.CorrectLevel.H
                    });
                }
            }
        });
    }

    // Save generated document record locally and sync with Supabase
    function saveDocumentRecord() {
        const refNo = (document.getElementById('refNo') && document.getElementById('refNo').value.trim()) 
            ? document.getElementById('refNo').value.trim() 
            : 'QTR/AK:A01969';

        const empName = (document.getElementById('empName') && document.getElementById('empName').value.trim())
            ? document.getElementById('empName').value.trim()
            : 'AASHIK RAUT';

        const empIdNo = (document.getElementById('empIdNo') && document.getElementById('empIdNo').value.trim())
            ? document.getElementById('empIdNo').value.trim()
            : 'PA5231328';

        const empTitle = (document.getElementById('empTitle') && document.getElementById('empTitle').value.trim())
            ? document.getElementById('empTitle').value.trim()
            : 'CIVIL FOREMAN';

        const empNat = (document.getElementById('empNat') && document.getElementById('empNat').value.trim())
            ? document.getElementById('empNat').value.trim()
            : 'NEPAL';

        const salaryString = (document.getElementById('salaryString') && document.getElementById('salaryString').value.trim())
            ? document.getElementById('salaryString').value.trim()
            : '[BASIC 3400 + OT / MONTH] QAR + FREE FOOD & ACCOMMODATION';

        const docDateVal = docDateInput ? docDateInput.value : todayISO;
        const formattedDocDate = formatDateGB(docDateVal) || todayFormatted;

        const dojVal = empDojInput ? empDojInput.value : todayISO;
        const formattedDoj = formatDateGB(dojVal) || formattedDocDate;

        const empQid = document.getElementById('empQid') ? document.getElementById('empQid').value.trim() : '';
        const empDept = document.getElementById('empDept') ? document.getElementById('empDept').value.trim() : '';
        const empBlood = document.getElementById('empBlood') ? document.getElementById('empBlood').value.trim() : '';
        const empEmergency = document.getElementById('empEmergency') ? document.getElementById('empEmergency').value.trim() : '';

        const termDurationEn = (document.getElementById('termDurationEn') && document.getElementById('termDurationEn').value.trim())
            ? document.getElementById('termDurationEn').value.trim()
            : '2 Years Renewable upon mutual agreement of both parties.';
        const termDurationAr = (document.getElementById('termDurationAr') && document.getElementById('termDurationAr').value.trim())
            ? document.getElementById('termDurationAr').value.trim()
            : 'سنتان (2) قابلة للتجديد بموافقة الطرفين.';

        const termProbationEn = (document.getElementById('termProbationEn') && document.getElementById('termProbationEn').value.trim())
            ? document.getElementById('termProbationEn').value.trim()
            : 'Maximum 6 Months from joining date as per Qatar Labor Law Art. 39.';
        const termProbationAr = (document.getElementById('termProbationAr') && document.getElementById('termProbationAr').value.trim())
            ? document.getElementById('termProbationAr').value.trim()
            : '6 أشهر كحد أقصى من تاريخ المباشرة وفقاً للمادة (39) من قانون العمل القطري.';

        const termHoursEn = (document.getElementById('termHoursEn') && document.getElementById('termHoursEn').value.trim())
            ? document.getElementById('termHoursEn').value.trim()
            : '8 Hours/day, 48 Hours/week (6 days/week) as per Qatar Labor Law Art. 73.';
        const termHoursAr = (document.getElementById('termHoursAr') && document.getElementById('termHoursAr').value.trim())
            ? document.getElementById('termHoursAr').value.trim()
            : '8 ساعات يومياً بواقع 48 ساعة أسبوعياً (6 أيام عمل) وفقاً للمادة (73).';

        const record = {
            refNo: refNo,
            empName: empName,
            empIdNo: empIdNo,
            empTitle: empTitle,
            empNat: empNat,
            empQid: empQid,
            empDept: empDept,
            empBlood: empBlood,
            empEmergency: empEmergency,
            termDurationEn: termDurationEn,
            termDurationAr: termDurationAr,
            termProbationEn: termProbationEn,
            termProbationAr: termProbationAr,
            termHoursEn: termHoursEn,
            termHoursAr: termHoursAr,
            salaryString: salaryString,
            docDate: formattedDocDate,
            empDoj: formattedDoj,
            docType: currentDocType,
            docTypeName: docTypeNames[currentDocType] || 'HR Document',
            photoUrl: (outPhoto && outPhoto.src && !outPhoto.src.includes('placeholder')) ? outPhoto.src : '',
            status: 'VERIFIED',
            company: 'Al Kabeer Trading & Contracting W.L.L.',
            crNo: '184920',
            establishmentId: '74/92014',
            generatedAt: new Date().toISOString()
        };

        // 1. Save to LocalStorage
        try {
            let docs = JSON.parse(localStorage.getItem('alkabeer_hr_documents') || '{}');
            docs[refNo] = record;
            localStorage.setItem('alkabeer_hr_documents', JSON.stringify(docs));
            console.log("Saved document to LocalStorage:", record);
        } catch (err) {
            console.error("Error saving document to localStorage:", err);
        }

        // 2. Supabase Integration Sync
        if (supabaseClient) {
            supabaseClient
                .from('hr_documents')
                .upsert([record], { onConflict: 'refNo' })
                .then(({ data, error }) => {
                    if (error) console.error("Supabase upsert error:", error);
                    else console.log("🟢 Supabase synced successfully:", data);
                }).catch(e => console.error("Supabase sync exception:", e));
        }

        return record;
    }

    // Render Document History Table from Supabase Cloud DB and LocalStorage
    async function renderHistoryTable() {
        const historyTableBody = document.getElementById('historyTableBody');
        if (!historyTableBody) return;

        historyTableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 35px; color: #1e3a8a; font-weight: 700;">
                    <i class="bi bi-hourglass-split" style="font-size: 28px; display: block; margin-bottom: 8px;"></i>
                    Fetching live registry from Supabase Cloud Database...
                </td>
            </tr>
        `;

        let recordsList = [];

        // 1. Fetch records from Supabase
        if (supabaseClient) {
            try {
                const { data, error } = await supabaseClient
                    .from('hr_documents')
                    .select('*')
                    .order('generatedAt', { ascending: false });

                if (!error && data && data.length > 0) {
                    recordsList = data;
                    console.log("🟢 History fetched from Supabase Cloud DB:", data);
                }
            } catch (err) {
                console.warn("Supabase history fetch error, falling back to local registry:", err);
            }
        }

        // 2. Fallback / Merge from LocalStorage
        try {
            const localDocs = JSON.parse(localStorage.getItem('alkabeer_hr_documents') || '{}');
            const localList = Object.values(localDocs);
            
            const map = new Map();
            localList.forEach(item => map.set(item.refNo, item));
            recordsList.forEach(item => map.set(item.refNo, item));
            recordsList = Array.from(map.values());
        } catch (e) {
            console.error("LocalStorage read error", e);
        }

        if (recordsList.length === 0) {
            historyTableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 40px; color: #64748b;">
                        <i class="bi bi-folder-x" style="font-size: 32px; display: block; margin-bottom: 10px; color: #94a3b8;"></i>
                        No generated document records found in registry.
                    </td>
                </tr>
            `;
            return;
        }

        window.cachedHistoryRecords = recordsList;
        displayFilteredHistory(recordsList);
    }

    function displayFilteredHistory(records) {
        const historyTableBody = document.getElementById('historyTableBody');
        if (!historyTableBody) return;

        if (records.length === 0) {
            historyTableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 30px; color: #64748b;">
                        No matching documents found.
                    </td>
                </tr>
            `;
            return;
        }

        historyTableBody.innerHTML = records.map(rec => {
            const verifyUrl = `${window.location.origin}/verify.html?ref=${encodeURIComponent(rec.refNo)}`;
            const isOffer = rec.docType === 'offer' || rec.docType === 'Employment Offer Letter & Preliminary Contract';
            const typeLabel = rec.docTypeName || (isOffer ? 'Offer Letter' : 'HR Document');

            return `
                <tr style="border-bottom: 1px solid #e2e8f0; background: #ffffff; transition: background 0.15s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='#ffffff'">
                    <td style="padding: 12px 14px; font-weight: 800; color: #1e3a8a;">${rec.refNo}</td>
                    <td style="padding: 12px 14px; font-weight: 700; color: #0f172a; text-transform: uppercase;">${rec.empName}</td>
                    <td style="padding: 12px 14px; font-weight: 600; color: #334155; text-transform: uppercase;">${rec.empIdNo}</td>
                    <td style="padding: 12px 14px; font-weight: 600; color: #334155; text-transform: uppercase;">${rec.empTitle}</td>
                    <td style="padding: 12px 14px;"><span style="background: #eff6ff; color: #1d4ed8; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; border: 1px solid #bfdbfe;">${typeLabel}</span></td>
                    <td style="padding: 12px 14px; color: #475569; font-weight: 600;">${rec.docDate}</td>
                    <td style="padding: 12px 14px;"><span style="background: #f0fdf4; color: #15803d; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: 800; border: 1px solid #bbf7d0;">🟢 VERIFIED</span></td>
                    <td style="padding: 12px 14px; text-align: center;">
                        <div style="display: flex; gap: 6px; justify-content: center; flex-wrap: wrap;">
                            <a href="${verifyUrl}" target="_blank" style="background: #1e3a8a; color: #fff; padding: 6px 10px; border-radius: 6px; text-decoration: none; font-size: 11px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
                                <i class="bi bi-shield-check"></i> Verify
                            </a>
                            <button onclick="window.copyVerifyLink('${rec.refNo}')" style="background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; padding: 6px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;" title="Copy Verification Link">
                                <i class="bi bi-link-45deg"></i> Copy Link
                            </button>
                            <button onclick="window.loadRecordToForm('${rec.refNo}')" style="background: #0175b2; color: #fff; border: none; padding: 6px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
                                <i class="bi bi-pencil-square"></i> Load & Print
                            </button>
                            <button onclick="window.deleteRecord('${rec.refNo}')" style="background: #ef4444; color: #fff; border: none; padding: 6px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;" title="Delete Record">
                                <i class="bi bi-trash-fill"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Export History Registry to Excel (.csv)
    const btnExportCsv = document.getElementById('btnExportCsv');
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

        // Re-render history table
        renderHistoryTable();
    };

    // Search filter listener for history table
    const historySearchInput = document.getElementById('historySearchInput');
    if (historySearchInput) {
        historySearchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim().toLowerCase();
            const list = window.cachedHistoryRecords || [];
            if (!query) {
                displayFilteredHistory(list);
                return;
            }
            const filtered = list.filter(r => 
                (r.refNo && r.refNo.toLowerCase().includes(query)) ||
                (r.empName && r.empName.toLowerCase().includes(query)) ||
                (r.empIdNo && r.empIdNo.toLowerCase().includes(query)) ||
                (r.empTitle && r.empTitle.toLowerCase().includes(query))
            );
            displayFilteredHistory(filtered);
        });
    }

    // Show Toast Alert Notification
    function showToast(msg) {
        const toast = document.getElementById('hrToast');
        const text = document.getElementById('toastText');
        if (toast && text) {
            text.textContent = msg;
            toast.style.display = 'flex';
            setTimeout(() => { toast.style.display = 'none'; }, 4000);
        }
    }

    // Auto-Generate Next Ref Number
    function generateNextRefNo() {
        try {
            const docs = JSON.parse(localStorage.getItem('alkabeer_hr_documents') || '{}');
            const keys = Object.keys(docs);
            let maxNum = 1969; // default base
            keys.forEach(k => {
                const match = k.match(/A0?(\d+)/i);
                if (match && match[1]) {
                    const num = parseInt(match[1], 10);
                    if (num > maxNum) maxNum = num;
                }
            });
            const nextNum = maxNum + 1;
            const nextRef = `QTR/AK:A${String(nextNum).padStart(5, '0')}`;
            if (document.getElementById('refNo')) {
                document.getElementById('refNo').value = nextRef;
                updateAllFields();
            }
            return nextRef;
        } catch (e) {
            return 'QTR/AK:A01970';
        }
    }

    // Reset Form to New Document Mode
    function resetForm() {
        if (document.getElementById('empName')) document.getElementById('empName').value = '';
        if (document.getElementById('empIdNo')) document.getElementById('empIdNo').value = '';
        if (document.getElementById('empTitle')) document.getElementById('empTitle').value = '';
        if (document.getElementById('empNat')) document.getElementById('empNat').value = '';
        if (document.getElementById('salaryString')) document.getElementById('salaryString').value = '';
        if (document.getElementById('empQid')) document.getElementById('empQid').value = '';
        if (document.getElementById('empDept')) document.getElementById('empDept').value = '';
        if (document.getElementById('empBlood')) document.getElementById('empBlood').value = '';
        if (document.getElementById('empEmergency')) document.getElementById('empEmergency').value = '';

        // Pre-filled standard legal contract terms defaults
        if (document.getElementById('termDurationEn')) document.getElementById('termDurationEn').value = '2 Years Renewable upon mutual agreement of both parties.';
        if (document.getElementById('termDurationAr')) document.getElementById('termDurationAr').value = 'سنتان (2) قابلة للتجديد بموافقة الطرفين.';
        if (document.getElementById('termProbationEn')) document.getElementById('termProbationEn').value = 'Maximum 6 Months from joining date as per Qatar Labor Law Art. 39.';
        if (document.getElementById('termProbationAr')) document.getElementById('termProbationAr').value = '6 أشهر كحد أقصى من تاريخ المباشرة وفقاً للمادة (39) من قانون العمل القطري.';
        if (document.getElementById('termHoursEn')) document.getElementById('termHoursEn').value = '8 Hours/day, 48 Hours/week (6 days/week) as per Qatar Labor Law Art. 73.';
        if (document.getElementById('termHoursAr')) document.getElementById('termHoursAr').value = '8 ساعات يومياً بواقع 48 ساعة أسبوعياً (6 أيام عمل) وفقاً للمادة (73).';

        if (docDateInput) docDateInput.value = todayISO;
        if (empDojInput) empDojInput.value = todayISO;
        if (outPhoto) outPhoto.src = defaultAvatarSvg;

        generateNextRefNo();

        const modeText = document.getElementById('modeStatusText');
        if (modeText) modeText.textContent = 'Creating New Document';

        showToast('Form cleared for new document creation.');
        updateAllFields();
    }

    // Global helper to load a saved history record back into the form fields for editing
    window.loadRecordToForm = function(refNo) {
        const records = window.cachedHistoryRecords || [];
        const record = records.find(r => r.refNo === refNo);
        if (!record) return;

        if (document.getElementById('empName')) document.getElementById('empName').value = record.empName || '';
        if (document.getElementById('empIdNo')) document.getElementById('empIdNo').value = record.empIdNo || '';
        if (document.getElementById('empTitle')) document.getElementById('empTitle').value = record.empTitle || '';
        if (document.getElementById('empNat')) document.getElementById('empNat').value = record.empNat || '';
        if (document.getElementById('salaryString')) document.getElementById('salaryString').value = record.salaryString || '';
        if (document.getElementById('refNo')) document.getElementById('refNo').value = record.refNo || '';
        if (document.getElementById('empQid')) document.getElementById('empQid').value = record.empQid || '';
        if (document.getElementById('empDept')) document.getElementById('empDept').value = record.empDept || '';
        if (document.getElementById('empBlood')) document.getElementById('empBlood').value = record.empBlood || '';
        if (document.getElementById('empEmergency')) document.getElementById('empEmergency').value = record.empEmergency || '';

        // Load contract terms into form
        if (document.getElementById('termDurationEn')) document.getElementById('termDurationEn').value = record.termDurationEn || '2 Years Renewable upon mutual agreement of both parties.';
        if (document.getElementById('termDurationAr')) document.getElementById('termDurationAr').value = record.termDurationAr || 'سنتان (2) قابلة للتجديد بموافقة الطرفين.';
        if (document.getElementById('termProbationEn')) document.getElementById('termProbationEn').value = record.termProbationEn || 'Maximum 6 Months from joining date as per Qatar Labor Law Art. 39.';
        if (document.getElementById('termProbationAr')) document.getElementById('termProbationAr').value = record.termProbationAr || '6 أشهر كحد أقصى من تاريخ المباشرة وفقاً للمادة (39) من قانون العمل القطري.';
        if (document.getElementById('termHoursEn')) document.getElementById('termHoursEn').value = record.termHoursEn || '8 Hours/day, 48 Hours/week (6 days/week) as per Qatar Labor Law Art. 73.';
        if (document.getElementById('termHoursAr')) document.getElementById('termHoursAr').value = record.termHoursAr || '8 ساعات يومياً بواقع 48 ساعة أسبوعياً (6 أيام عمل) وفقاً للمادة (73).';
        
        // Restore dates properly for date input controls
        if (docDateInput && record.docDate) {
            docDateInput.value = formatDateISO(record.docDate);
        }
        if (empDojInput && record.empDoj) {
            empDojInput.value = formatDateISO(record.empDoj);
        }

        if (record.photoUrl && outPhoto) outPhoto.src = record.photoUrl;

        const modeText = document.getElementById('modeStatusText');
        if (modeText) modeText.textContent = `Editing Record: ${record.refNo}`;

        // Switch tab to the document's type
        const targetType = record.docType && record.docType !== 'history' ? record.docType : 'offer';
        const targetTab = document.querySelector(`.doc-tab[data-doc="${targetType}"]`);
        if (targetTab) targetTab.click();
        else updateAllFields();

        showToast(`Loaded record [${record.refNo}] into form for editing.`);
    };

    // Tab Switch Listener
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            tabs.forEach(t => t.classList.remove('active'));
            
            Object.values(templates).forEach(tmpl => {
                if (tmpl) tmpl.style.display = 'none';
            });

            const docType = tab.getAttribute('data-doc');
            tab.classList.add('active');
            currentDocType = docType;

            const formPanel = document.querySelector('.hr-form-panel');
            const hrLayout = document.querySelector('.hr-layout');
            const targetTmpl = templates[docType];

            if (docType === 'history') {
                if (formPanel) formPanel.style.display = 'none';
                if (hrLayout) hrLayout.style.gridTemplateColumns = '1fr';
                if (targetTmpl) targetTmpl.style.display = 'block';
                if (photoSection) photoSection.style.display = 'none';
                renderHistoryTable();
            } else {
                if (formPanel) formPanel.style.display = 'block';
                if (hrLayout) hrLayout.style.gridTemplateColumns = '360px 1fr';
                if (targetTmpl) {
                    if (docType === 'idcard') {
                        targetTmpl.style.display = 'flex';
                        if (photoSection) photoSection.style.display = 'block';
                    } else {
                        targetTmpl.style.display = 'block';
                        if (photoSection) photoSection.style.display = 'none';
                    }
                }
            }

            // Sync fields when switching tabs
            updateAllFields();
        });
    });

    // Listen to input changes on all form controls
    const allInputIds = [
        'empName', 'empTitle', 'empIdNo', 'empNat', 'salaryString', 'refNo', 
        'docDate', 'empDoj', 'empQid', 'empDept', 'empBlood', 'empEmergency',
        'termDurationEn', 'termDurationAr', 'termProbationEn', 'termProbationAr', 'termHoursEn', 'termHoursAr'
    ];
    allInputIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', updateAllFields);
            el.addEventListener('change', updateAllFields);
        }
    });

    // Explicit Save Record Button Listener
    const btnSaveRecord = document.getElementById('btnSaveRecord');
    if (btnSaveRecord) {
        btnSaveRecord.addEventListener('click', () => {
            updateAllFields();
            const record = saveDocumentRecord();
            showToast(`🟢 Document Record [${record.refNo}] Saved & Synced Successfully!`);
        });
    }

    // Auto Ref Generator Button Listener
    const btnAutoRef = document.getElementById('btnAutoRef');
    if (btnAutoRef) {
        btnAutoRef.addEventListener('click', () => {
            const newRef = generateNextRefNo();
            showToast(`Generated Ref No: ${newRef}`);
        });
    }

    // Reset / New Form Button Listener
    const btnResetForm = document.getElementById('btnResetForm');
    if (btnResetForm) {
        btnResetForm.addEventListener('click', resetForm);
    }

    // Handle Photo Upload
    const photoInput = document.getElementById('empPhoto');
    if (photoInput && outPhoto) {
        photoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    outPhoto.src = e.target.result;
                    updateAllFields();
                };
                reader.readAsDataURL(file);
            } else {
                outPhoto.src = defaultAvatarSvg;
            }
        });
    }

    // Clean, Non-Destructive Direct Print Engine
    const btnPrint = document.getElementById('btnPrint');
    const btnGenerate = document.getElementById('btnGenerate');

    function triggerPrint() {
        updateAllFields();
        saveDocumentRecord();

        // Trigger browser print dialog directly
        setTimeout(() => {
            window.print();
        }, 150);
    }

    if (btnPrint) btnPrint.addEventListener('click', triggerPrint);
    if (btnGenerate) btnGenerate.addEventListener('click', triggerPrint);

    // Initial Sync on load
    updateAllFields();
});
