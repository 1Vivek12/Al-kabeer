document.addEventListener('DOMContentLoaded', () => {

    // Set today's date
    const today = new Date().toLocaleDateString('en-GB');
    const docDateInput = document.getElementById('docDate');
    if(docDateInput) docDateInput.valueAsDate = new Date();
    
    document.querySelectorAll('.outDateOffer').forEach(el => el.textContent = today);

    // Elements
    const tabs = document.querySelectorAll('.doc-tab');
    const templates = {
        'offer': document.getElementById('offerTemplate'),
        'appointment': document.getElementById('apptTemplate'),
        'idcard': document.getElementById('idCardTemplate')
    };
    const photoSection = document.getElementById('photoSection');

    let currentDocType = 'offer';

    // Tab Switching
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            // Remove active class from all
            tabs.forEach(t => t.classList.remove('active'));
            Object.values(templates).forEach(tmpl => {
                tmpl.style.display = 'none';
                tmpl.style.alignItems = '';
                tmpl.style.justifyContent = '';
            });

            // Set current
            const docType = tab.getAttribute('data-doc');
            tab.classList.add('active');
            currentDocType = docType;

            if (docType === 'idcard') {
                templates[docType].style.display = 'flex';
                photoSection.style.display = 'block';
            } else {
                templates[docType].style.display = 'block';
                photoSection.style.display = 'none';
            }
        });
    });

    // Inputs to Outputs mapping
    const mappings = {
        'empName': '.outName',
        'empTitle': '.outTitle',
        'empIdNo': '.outIdNo',
        'empNat': '.outNat',
        'salaryString': '.outSalary',
        'refNo': '.outRefNo',
        'empDoj': '.outDoj'
    };

    // Listen to all inputs and update outputs
    Object.keys(mappings).forEach(inputId => {
        const inputEl = document.getElementById(inputId);
        if (inputEl) {
            inputEl.addEventListener('input', (e) => {
                let val = e.target.value;
                if (inputId === 'empDoj' && val) {
                    val = new Date(val).toLocaleDateString('en-GB');
                }
                const outSelectors = document.querySelectorAll(mappings[inputId]);
                outSelectors.forEach(outEl => {
                    outEl.textContent = val || `[${inputId.toUpperCase()}]`;
                });
            });
        }
    });

    // Handle Document Date specifically
    if(docDateInput) {
        docDateInput.addEventListener('input', (e) => {
            let val = e.target.value;
            if(val) {
                let formatted = new Date(val).toLocaleDateString('en-GB').replace(/\//g, '-');
                document.querySelectorAll('.outDateOffer').forEach(el => el.textContent = formatted);
            }
        });
    }

    // Handle Photo Upload
    const photoInput = document.getElementById('empPhoto');
    const outPhoto = document.getElementById('outPhoto');
    
    if (photoInput) {
        photoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    outPhoto.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Print Functionality
    const btnPrint = document.getElementById('btnPrint');
    const btnGenerate = document.getElementById('btnGenerate');
    const printArea = document.getElementById('printArea');

    function triggerPrint() {
        // Get the currently active template
        let activeTemplate = templates[currentDocType];
        if (!activeTemplate) return;

        // Remember the parent and next sibling so we can put it back
        const originalParent = activeTemplate.parentNode;
        const originalNext = activeTemplate.nextSibling;

        // Clear print area
        printArea.innerHTML = '';

        // Move actual element (not clone) to printArea - preserves all styles
        printArea.appendChild(activeTemplate);
        activeTemplate.style.display = 'block';

        if (currentDocType === 'idcard') {
            printArea.style.display = 'flex';
            printArea.style.justifyContent = 'center';
            printArea.style.alignItems = 'center';
            printArea.style.height = '100vh';
        } else {
            printArea.style.display = 'block';
            printArea.style.height = 'auto';
        }

        // Show print area for printing
        printArea.classList.remove('no-print');

        // Small delay to let browser reflow before printing
        requestAnimationFrame(() => {
            window.print();

            // After print dialog closes, put the element back
            setTimeout(() => {
                // Move template back to its original location
                if (originalNext) {
                    originalParent.insertBefore(activeTemplate, originalNext);
                } else {
                    originalParent.appendChild(activeTemplate);
                }

                // Restore visibility for the current doc type
                if (currentDocType === 'offer') {
                    activeTemplate.style.display = 'block';
                } else if (currentDocType === 'idcard') {
                    activeTemplate.style.display = 'flex';
                } else {
                    activeTemplate.style.display = currentDocType === 'appointment' ? 'none' : 'block';
                }

                // Only the offer template should be visible by default
                if (currentDocType !== 'offer') {
                    // keep visible since user was on this tab
                    if (currentDocType === 'idcard') {
                        activeTemplate.style.display = 'flex';
                    } else {
                        activeTemplate.style.display = 'block';
                    }
                }

                // Clear print area and hide it
                printArea.innerHTML = '';
                printArea.classList.add('no-print');
                printArea.style.display = '';
                printArea.style.height = '';
            }, 500);
        });
    }

    if(btnPrint) btnPrint.addEventListener('click', triggerPrint);
    if(btnGenerate) btnGenerate.addEventListener('click', triggerPrint);

});
