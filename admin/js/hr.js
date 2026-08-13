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
        'idcard': document.getElementById('idCardTemplate')
    };
    const docTypeNames = {
        'offer': 'Employment Offer Letter & Preliminary Contract',
        'appointment': 'Official Appointment Letter',
        'salary_cert': 'Salary & Employment Certificate',
        'idcard': 'Employee ID Badge Card'
    };
    const photoSection = document.getElementById('photoSection');

    let currentDocType = 'offer';

    // Inputs to Outputs mapping
    const mappings = {
        'empName': { selector: '.outName', fallback: 'AASHIK RAUT' },
        'empTitle': { selector: '.outTitle', fallback: 'CIVIL FOREMAN' },
        'empIdNo': { selector: '.outIdNo', fallback: 'PA5231328' },
        'empNat': { selector: '.outNat', fallback: 'NEPAL' },
        'salaryString': { selector: '.outSalary', fallback: '[BASIC 3400 + OT / MONTH] QAR + FREE FOOD & ACCOMMODATION' },
        'refNo': { selector: '.outRefNo', fallback: 'QTR/AK:A01969' }
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
        const verifyUrl = `${window.location.origin}/verify.html?ref=${encodeURIComponent(refNo)}`;

        const targets = [
            'qrOfferP1',
            'qrOfferP2',
            'qrAppt',
            'qrSalary'
        ];

        targets.forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                container.innerHTML = '';
                if (window.QRCode) {
                    new QRCode(container, {
                        text: verifyUrl,
                        width: 44,
                        height: 44,
                        colorDark: "#1e3a8a",
                        colorLight: "#ffffff",
                        correctLevel: QRCode.CorrectLevel.M
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

        const record = {
            refNo: refNo,
            empName: empName,
            empIdNo: empIdNo,
            empTitle: empTitle,
            empNat: empNat,
            salaryString: salaryString,
            docDate: formattedDocDate,
            empDoj: formattedDoj,
            docType: currentDocType,
            docTypeName: docTypeNames[currentDocType] || 'HR Document',
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

            const targetTmpl = templates[docType];
            if (targetTmpl) {
                if (docType === 'idcard') {
                    targetTmpl.style.display = 'flex';
                    if (photoSection) photoSection.style.display = 'block';
                } else {
                    targetTmpl.style.display = 'block';
                    if (photoSection) photoSection.style.display = 'none';
                }
            }

            // Sync fields when switching tabs
            updateAllFields();
        });
    });

    // Listen to input changes on all form controls
    const allInputIds = ['empName', 'empTitle', 'empIdNo', 'empNat', 'salaryString', 'refNo', 'docDate', 'empDoj'];
    allInputIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', updateAllFields);
            el.addEventListener('change', updateAllFields);
        }
    });

    // Handle Photo Upload
    const photoInput = document.getElementById('empPhoto');
    if (photoInput && outPhoto) {
        photoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    outPhoto.src = e.target.result;
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
    saveDocumentRecord(); // Save initial default record so it can be verified right away!
});
