document.addEventListener('DOMContentLoaded', function() {
    // العناصر الرئيسية
    const hexCells = document.querySelectorAll('.hex');
    const letterCells = document.querySelectorAll('.hex.letter');
    const greenBtn = document.getElementById('greenBtn');
    const redBtn = document.getElementById('redBtn');
    const creamBtn = document.getElementById('creamBtn');
    const resetBtn = document.getElementById('resetBtn');
    const randomBtn = document.getElementById('randomBtn');
    const shuffleBtn = document.getElementById('shuffleBtn');
    const statusText = document.getElementById('statusText');
    const greenCount = document.getElementById('greenCount');
    const redCount = document.getElementById('redCount');
    const confirmDialog = document.getElementById('confirmDialog');
    const confirmYes = document.getElementById('confirmYes');
    const confirmNo = document.getElementById('confirmNo');
    const confirmTitle = document.getElementById('confirmTitle');
    const confirmMessage = document.getElementById('confirmMessage');
    const themeToggle = document.getElementById('themeToggle');
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const helpBtn = document.getElementById('helpBtn');
    const helpDialog = document.getElementById('helpDialog');
    const closeHelpBtn = document.getElementById('closeHelpBtn');
    const langToggle = document.getElementById('langToggle');

    // التحقق من وجود العناصر المطلوبة
    console.log("العناصر التي لم يتم العثور عليها:");
    if (!greenBtn) console.log("greenBtn");
    if (!redBtn) console.log("redBtn");
    if (!creamBtn) console.log("creamBtn");
    if (!resetBtn) console.log("resetBtn");
    if (!randomBtn) console.log("randomBtn");
    if (!shuffleBtn) console.log("shuffleBtn");
    if (!statusText) console.log("statusText");
    if (!greenCount) console.log("greenCount");
    if (!redCount) console.log("redCount");
    if (!confirmDialog) console.log("confirmDialog");
    if (!confirmYes) console.log("confirmYes");
    if (!confirmNo) console.log("confirmNo");
    if (!confirmTitle) console.log("confirmTitle");
    if (!confirmMessage) console.log("confirmMessage");
    if (!themeToggle) console.log("themeToggle");
    if (!zoomInBtn) console.log("zoomInBtn");
    if (!zoomOutBtn) console.log("zoomOutBtn");
    if (!helpBtn) console.log("helpBtn");
    if (!helpDialog) console.log("helpDialog");
    if (!closeHelpBtn) console.log("closeHelpBtn");
    if (!langToggle) console.log("langToggle");

    // متغيرات تتبع الحالة
    let currentColor = null;
    let greenCellsCount = 0;
    let redCellsCount = 0;
    let highlightedCell = null;
    let randomLetterTimeout = null;
    let currentAction = null; // لتتبع نوع الإجراء الحالي (مسح أو تبديل)
    let darkMode = localStorage.getItem('darkMode') === 'enabled';
    let currentZoom = 1;
    let currentLang = localStorage.getItem('language') || 'ar'; // اللغة الافتراضية هي العربية
    
    // تهيئة المؤثرات الصوتية - استخدام عناصر audio الموجودة في HTML بدلاً من إنشاء عناصر جديدة
    const clickSound = document.getElementById('clickSound') || new Audio();
    const successSound = document.getElementById('successSound') || new Audio();
    const errorSound = document.getElementById('errorSound') || new Audio();
    const shuffleSound = document.getElementById('shuffleSound') || new Audio();
    const hintSound = document.getElementById('hintSound') || new Audio();
    
    // كتم الصوت مؤقتًا إلى أن يتم تحميل الملفات
    clickSound.volume = 0.5;
    successSound.volume = 0.5;
    errorSound.volume = 0.5;
    shuffleSound.volume = 0.5;
    hintSound.volume = 0.5;

    // تهيئة اللغة عند تحميل الصفحة
    setLanguage(currentLang);
    
    // تهيئة الوضع الليلي عند تحميل الصفحة
    if (darkMode) {
        document.body.classList.add('dark-mode');
        updateThemeToggleText();
    }
    
    // تحميل التقدم المحفوظ إذا وجد
    loadProgress();

    // تهيئة العدادات
    updateCounters();
    
    // الأحرف الإنجليزية والعربية
    const arabicLetters = ['أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'و', 'ه', 'ي'];
    const englishLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

    // إضافة مستمعي الأحداث لأزرار الألوان
    if (greenBtn) {
        greenBtn.addEventListener('click', function() {
            if (clickSound) clickSound.play();
            setCurrentColor('green');
            updateStatusText('color-green');
        });
    }

    if (redBtn) {
        redBtn.addEventListener('click', function() {
            if (clickSound) clickSound.play();
            setCurrentColor('red');
            updateStatusText('color-red');
        });
    }

    if (creamBtn) {
        creamBtn.addEventListener('click', function() {
            if (clickSound) clickSound.play();
            setCurrentColor('cream');
            updateStatusText('color-cream');
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            if (clickSound) clickSound.play();
            showConfirmDialog('reset');
        });
    }

    if (randomBtn) {
        randomBtn.addEventListener('click', function() {
            if (hintSound) hintSound.play();
            highlightRandomLetter();
            updateStatusText('random-letter');
        });
    }

    if (shuffleBtn) {
        shuffleBtn.addEventListener('click', function() {
            if (clickSound) clickSound.play();
            showConfirmDialog('shuffle');
        });
    }

    if (confirmYes) {
        confirmYes.addEventListener('click', function() {
            if (clickSound) clickSound.play();
            hideConfirmDialog();
            if (currentAction === 'reset') {
                resetAllCells();
                updateStatusText('reset-success');
            } else if (currentAction === 'shuffle') {
                shuffleLetters();
                resetAllCells();
                updateStatusText('shuffle-success');
            }
        });
    }

    if (confirmNo) {
        confirmNo.addEventListener('click', function() {
            if (clickSound) clickSound.play();
            hideConfirmDialog();
        });
    }

    // إضافة مستمع الحدث لزر تبديل اللغة
    if (langToggle) {
        langToggle.addEventListener('click', function() {
            if (clickSound) clickSound.play();
            toggleLanguage();
        });
    }
    
    // إضافة مستمع الحدث لزر تبديل الوضع الليلي
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            if (clickSound) clickSound.play();
            toggleDarkMode();
        });
    }
    
    // إضافة مستمعي الأحداث لأزرار التكبير والتصغير
    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', function() {
            if (clickSound) clickSound.play();
            zoomIn();
        });
    }
    
    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', function() {
            if (clickSound) clickSound.play();
            zoomOut();
        });
    }
    
    // إضافة مستمعي الأحداث لزر المساعدة
    if (helpBtn) {
        helpBtn.addEventListener('click', function() {
            if (clickSound) clickSound.play();
            showHelpDialog();
        });
    }
    
    if (closeHelpBtn) {
        closeHelpBtn.addEventListener('click', function() {
            if (clickSound) clickSound.play();
            hideHelpDialog();
        });
    }

    // إضافة مستمعي الأحداث للخلايا
    hexCells.forEach(cell => {
        if (cell.classList.contains('letter') || cell.classList.contains('cream') || 
            cell.classList.contains('green') || cell.classList.contains('pink')) {
            cell.addEventListener('click', function() {
                if (currentColor) {
                    applyColorToCell(cell);
                } else {
                    updateStatusText('select-color-first');
                }
            });
        }
    });

    // تعيين اللون الحالي
    function setCurrentColor(color) {
        currentColor = color;
        // إزالة الحدود من جميع الأزرار
        if (greenBtn && redBtn && creamBtn) {
            [greenBtn, redBtn, creamBtn].forEach(btn => {
                btn.style.boxShadow = 'var(--shadow-sm)';
                btn.style.transform = 'translateY(0px)';
            });
            
            // إضافة حدود للزر المحدد
            if (color === 'green' && greenBtn) {
                greenBtn.style.boxShadow = '0 0 0 3px var(--primary-dark)';
                greenBtn.style.transform = 'translateY(-3px)';
            } else if (color === 'red' && redBtn) {
                redBtn.style.boxShadow = '0 0 0 3px var(--secondary-dark)';
                redBtn.style.transform = 'translateY(-3px)';
            } else if (color === 'cream' && creamBtn) {
                creamBtn.style.boxShadow = '0 0 0 3px #e0e0e0';
                creamBtn.style.transform = 'translateY(-3px)';
            }
        }
    }

    // تبديل اللغة
    function toggleLanguage() {
        currentLang = currentLang === 'ar' ? 'en' : 'ar';
        localStorage.setItem('language', currentLang);
        setLanguage(currentLang);
    }
    
    // تعيين اللغة
    function setLanguage(lang) {
        document.documentElement.setAttribute('lang', lang);
        document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
        
        // تحديث نص زر تبديل اللغة
        updateLangToggleText();
        
        // تحديث النصوص الأخرى في الواجهة
        updateUILanguage();
        
        // تحديث الحروف
        updateLetters();
    }
    
    // تحديث نص زر تبديل اللغة
    function updateLangToggleText() {
        if (langToggle) {
            if (currentLang === 'ar') {
                langToggle.innerHTML = '<i class="fas fa-language"></i> <span>English</span>';
            } else {
                langToggle.innerHTML = '<i class="fas fa-language"></i> <span>العربية</span>';
            }
        }
    }
    
    // تحديث نصوص واجهة المستخدم
    function updateUILanguage() {
        const uiElements = {
            'greenBtn': currentLang === 'ar' ? '<i class="fas fa-paint-brush"></i> الأخضر' : '<i class="fas fa-paint-brush"></i> Green',
            'redBtn': currentLang === 'ar' ? '<i class="fas fa-paint-brush"></i> الأحمر' : '<i class="fas fa-paint-brush"></i> Red',
            'creamBtn': currentLang === 'ar' ? '<i class="fas fa-paint-brush"></i> الأصلي' : '<i class="fas fa-paint-brush"></i> Original',
            'resetBtn': currentLang === 'ar' ? '<i class="fas fa-eraser"></i> مسح الكل' : '<i class="fas fa-eraser"></i> Reset All',
            'randomBtn': currentLang === 'ar' ? '<i class="fas fa-random"></i> حرف عشوائي' : '<i class="fas fa-random"></i> Random Letter',
            'shuffleBtn': currentLang === 'ar' ? '<i class="fas fa-sync-alt"></i> تبديل الحروف' : '<i class="fas fa-sync-alt"></i> Shuffle Letters',
            'helpBtn': currentLang === 'ar' ? '<i class="fas fa-question-circle"></i>' : '<i class="fas fa-question-circle"></i>',
            'zoomInBtn': currentLang === 'ar' ? '<i class="fas fa-search-plus"></i>' : '<i class="fas fa-search-plus"></i>',
            'zoomOutBtn': currentLang === 'ar' ? '<i class="fas fa-search-minus"></i>' : '<i class="fas fa-search-minus"></i>',
            'closeHelpBtn': currentLang === 'ar' ? 'إغلاق' : 'Close',
            'confirmYes': currentLang === 'ar' ? 'موافق' : 'Yes',
            'confirmNo': currentLang === 'ar' ? 'إلغاء' : 'Cancel',
            'helpTitle': currentLang === 'ar' ? 'تعليمات اللعبة' : 'Game Instructions'
        };
        
        // تحديث النصوص في العناصر
        for (const id in uiElements) {
            const element = document.getElementById(id);
            if (element) {
                element.innerHTML = uiElements[id];
            }
        }
        
        // تحديث نص العنوان الرئيسي
        const gameTitle = document.querySelector('.game-title');
        if (gameTitle) {
            if (currentLang === 'ar') {
                gameTitle.innerHTML = '<i class="fas fa-chess-board"></i> <span>لعبة</span> خلية الحروف';
            } else {
                gameTitle.innerHTML = '<i class="fas fa-chess-board"></i> <span>Letter</span> Honeycomb';
            }
        }
        
        // تحديث التسميات في عدادات الخلايا
        const greenLabel = document.querySelector('.stat-box:first-child span');
        const redLabel = document.querySelector('.stat-box:last-child span');
        
        if (greenLabel) {
            const greenCountText = currentLang === 'ar' ? 'الخلايا الخضراء: ' : 'Green Cells: ';
            greenLabel.innerHTML = greenCountText + '<span id="greenCount">' + greenCellsCount + '</span>';
        }
        
        if (redLabel) {
            const redCountText = currentLang === 'ar' ? 'الخلايا الحمراء: ' : 'Red Cells: ';
            redLabel.innerHTML = redCountText + '<span id="redCount">' + redCellsCount + '</span>';
        }
        
        // تحديث نص حقوق النشر
        const footer = document.querySelector('.footer');
        if (footer) {
            if (currentLang === 'ar') {
                footer.innerHTML = '© جميع الحقوق محفوظة - لعبة خلية الحروف بواسطة عبداللطيف خالد 2025';
            } else {
                footer.innerHTML = '© All Rights Reserved - Letter Honeycomb Game by AbdulLatif Khaled 2025';
            }
        }
        
        // تحديث محتوى مربع التعليمات
        updateHelpContent();
        
        // تحديث رسالة الحالة
        updateStatusText('default');
    }
    
    // تحديث محتوى مربع التعليمات
    function updateHelpContent() {
        const helpContent = document.getElementById('helpContent');
        if (helpContent) {
            if (currentLang === 'ar') {
                helpContent.innerHTML = `
                    <h3>كيفية اللعب</h3>
                    <p>لعبة خلية الحروف هي لعبة تفاعلية تجمع بين تعلم الحروف والتفكير المنطقي. فيما يلي الخطوات الأساسية للعب:</p>
                    
                    <h4>اختيار اللون</h4>
                    <p>انقر على أحد أزرار الألوان (الأخضر، الأحمر، الأصلي) لاختيار اللون الذي ترغب في استخدامه.</p>
                    
                    <h4>تلوين الخلايا</h4>
                    <p>بعد اختيار اللون، انقر على أي خلية تحتوي على حرف لتغيير لونها. لاحظ أن الخلايا الخضراء والوردية الثابتة على الحواف لا يمكن تغييرها.</p>
                    
                    <h4>ميزات إضافية</h4>
                    <ul>
                        <li><strong>مسح الكل:</strong> يعيد تعيين جميع الخلايا إلى حالتها الأصلية.</li>
                        <li><strong>حرف عشوائي:</strong> يبرز حرفًا عشوائيًا في اللوحة لمدة 3 ثوانٍ.</li>
                        <li><strong>تبديل الحروف:</strong> يخلط مواضع الحروف في اللوحة.</li>
                        <li><strong>الوضع الليلي:</strong> يبدل بين الواجهة الفاتحة والداكنة لراحة العينين.</li>
                        <li><strong>تغيير اللغة:</strong> يبدل بين الحروف العربية والإنجليزية.</li>
                        <li><strong>تكبير/تصغير:</strong> يتحكم في حجم خلية الحروف.</li>
                    </ul>
                    
                    <h4>نصائح للعب</h4>
                    <ul>
                        <li>حاول تكوين أنماط أو كلمات باستخدام الألوان المختلفة.</li>
                        <li>استخدم الحرف العشوائي للعثور على حروف جديدة للتركيز عليها.</li>
                        <li>يتم حفظ تقدمك تلقائيًا، لذا يمكنك العودة في أي وقت لمواصلة اللعب.</li>
                    </ul>
                    
                    <h4>حول اللعبة</h4>
                    <p>تم تصميم لعبة خلية الحروف لتكون تجربة تعليمية ممتعة للأطفال والكبار. تساعد اللعبة على تعلم الحروف وتطوير مهارات التفكير المنطقي والإبداعي.</p>
                `;
            } else {
                helpContent.innerHTML = `
                    <h3>How to Play</h3>
                    <p>Letter Honeycomb is an interactive game that combines letter learning with logical thinking. Here are the basic steps to play:</p>
                    
                    <h4>Selecting a Color</h4>
                    <p>Click on one of the color buttons (Green, Red, Original) to select the color you want to use.</p>
                    
                    <h4>Coloring Cells</h4>
                    <p>After selecting a color, click on any cell containing a letter to change its color. Note that the fixed green and pink cells on the edges cannot be changed.</p>
                    
                    <h4>Additional Features</h4>
                    <ul>
                        <li><strong>Reset All:</strong> Resets all cells to their original state.</li>
                        <li><strong>Random Letter:</strong> Highlights a random letter on the board for 3 seconds.</li>
                        <li><strong>Shuffle Letters:</strong> Mixes the positions of the letters on the board.</li>
                        <li><strong>Dark Mode:</strong> Toggles between light and dark interface for eye comfort.</li>
                        <li><strong>Change Language:</strong> Switches between Arabic and English letters.</li>
                        <li><strong>Zoom In/Out:</strong> Controls the size of the honeycomb.</li>
                    </ul>
                    
                    <h4>Playing Tips</h4>
                    <ul>
                        <li>Try to form patterns or words using different colors.</li>
                        <li>Use the random letter feature to find new letters to focus on.</li>
                        <li>Your progress is automatically saved, so you can return anytime to continue playing.</li>
                    </ul>
                    
                    <h4>About the Game</h4>
                    <p>Letter Honeycomb Game is designed to be an educational and fun experience for children and adults. The game helps in learning letters and developing logical and creative thinking skills.</p>
                `;
            }
        }
    }
    
    // تحديث الحروف
    function updateLetters() {
        const letters = currentLang === 'ar' ? arabicLetters : englishLetters;
        const letterElements = document.querySelectorAll('.hex.letter');
        
        letterElements.forEach((cell, index) => {
            if (index < letters.length) {
                cell.textContent = letters[index];
            }
        });
    }

    // تبديل الوضع الليلي
    function toggleDarkMode() {
        darkMode = !darkMode;
        
        if (darkMode) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'enabled');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('darkMode', null);
        }
        
        updateThemeToggleText();
    }
    
    // تحديث نص زر تبديل الوضع
    function updateThemeToggleText() {
        if (themeToggle) {
            if (darkMode) {
                if (currentLang === 'ar') {
                    themeToggle.innerHTML = '<i class="fas fa-moon"></i> <span>الوضع العادي</span>';
                } else {
                    themeToggle.innerHTML = '<i class="fas fa-moon"></i> <span>Light Mode</span>';
                }
            } else {
                if (currentLang === 'ar') {
                    themeToggle.innerHTML = '<i class="fas fa-moon"></i> <span>الوضع الليلي</span>';
                } else {
                    themeToggle.innerHTML = '<i class="fas fa-moon"></i> <span>Dark Mode</span>';
                }
            }
        }
    }
    
    // تكبير خلية الحروف
    function zoomIn() {
        if (currentZoom < 1.5) {
            currentZoom += 0.1;
            applyZoom();
        }
    }
    
    // تصغير خلية الحروف
    function zoomOut() {
        if (currentZoom > 0.5) {
            currentZoom -= 0.1;
            applyZoom();
        }
    }
    
    // تطبيق التكبير/التصغير
    function applyZoom() {
        const honeycomb = document.querySelector('.honeycomb');
        if (honeycomb) {
            honeycomb.style.transform = `scale(${currentZoom})`;
            
            // تعديل ارتفاع الحاوية بناءً على حجم التكبير/التصغير
            const container = document.querySelector('.honeycomb-container');
            if (container) {
                const baseHeight = 540; // الارتفاع الأساسي
                container.style.height = `${baseHeight * currentZoom}px`;
            }
            
            // حفظ مستوى التكبير/التصغير
            saveProgress();
        }
    }
    
    // إظهار مربع حوار المساعدة
    function showHelpDialog() {
        if (helpDialog) {
            helpDialog.style.display = 'flex';
        }
    }
    
    // إخفاء مربع حوار المساعدة
    function hideHelpDialog() {
        if (helpDialog) {
            helpDialog.style.display = 'none';
        }
    }

    // تطبيق اللون على الخلية
    function applyColorToCell(cell) {
        // إذا كانت الخلية وردية أو خضراء ثابتة في الهيكل، لا تقم بأي تغيير
        if (cell.classList.contains('pink') && !cell.classList.contains('selected-green') && !cell.classList.contains('selected-red')) {
            if (errorSound) errorSound.play();
            updateStatusText('cell-fixed');
            return;
        }
        
        // التحقق مما إذا كانت الخلية خضراء ثابتة (وليس مجرد خلية خضراء محددة)
        if (cell.classList.contains('green') && !cell.classList.contains('selected-green') && !cell.classList.contains('selected-red')) {
            // لا تسمح بتغيير لون الخلايا الخضراء الثابتة
            if (errorSound) errorSound.play();
            updateStatusText('green-fixed');
            return;
        }

        // حساب التغيير في العدادات قبل تغيير الألوان
        let oldGreen = cell.classList.contains('selected-green') ? 1 : 0;
        let oldRed = cell.classList.contains('selected-red') ? 1 : 0;
        let newGreen = currentColor === 'green' ? 1 : 0;
        let newRed = currentColor === 'red' ? 1 : 0;

        // إضافة تأثير حركي قبل تغيير اللون
        cell.classList.add('color-changing');
        
        // تأخير لإظهار تأثير التغيير
        setTimeout(() => {
            // إزالة جميع ألوان التحديد
            cell.classList.remove('selected-green', 'selected-red');
    
            // إضافة لون التحديد الجديد
            if (currentColor === 'green' && !cell.classList.contains('green')) {
                cell.classList.add('selected-green');
                if (successSound) successSound.play();
            } else if (currentColor === 'red' && !cell.classList.contains('pink')) {
                cell.classList.add('selected-red');
                if (successSound) successSound.play();
            } else if (currentColor === 'cream') {
                // إعادة الخلية إلى لونها الأصلي
                if (clickSound) clickSound.play();
            }
            
            // إزالة تأثير التغيير
            cell.classList.remove('color-changing');
            
            // تحديث العدادات
            greenCellsCount = greenCellsCount - oldGreen + newGreen;
            redCellsCount = redCellsCount - oldRed + newRed;
            updateCounters();
            
            // حفظ التقدم
            saveProgress();
        }, 150);
    }

    // تحديث عدادات الخلايا
    function updateCounters() {
        if (greenCount) {
            greenCount.innerText = greenCellsCount;
        }
        if (redCount) {
            redCount.innerText = redCellsCount;
        }
    }
    
    // تحديث نص الحالة
    function updateStatusText(status) {
        if (!statusText) return;
        
        const statusMessages = {
            'default': {
                'ar': 'اختر لوناً ثم انقر على الخلايا لتغيير لونها',
                'en': 'Select a color then click on cells to change their color'
            },
            'color-green': {
                'ar': 'اختر الخلايا لتلوينها بالأخضر',
                'en': 'Select cells to color them green'
            },
            'color-red': {
                'ar': 'اختر الخلايا لتلوينها بالأحمر',
                'en': 'Select cells to color them red'
            },
            'color-cream': {
                'ar': 'اختر الخلايا لإعادتها للون الأصلي',
                'en': 'Select cells to reset them to original color'
            },
            'select-color-first': {
                'ar': 'الرجاء اختيار لون أولاً',
                'en': 'Please select a color first'
            },
            'cell-fixed': {
                'ar': 'لا يمكن تغيير لون الخلايا الثابتة',
                'en': 'Fixed cells cannot be changed'
            },
            'green-fixed': {
                'ar': 'لا يمكن تغيير لون الخلايا الخضراء الثابتة',
                'en': 'Fixed green cells cannot be changed'
            },
            'random-letter': {
                'ar': 'تم اختيار حرف عشوائي! سيختفي بعد 3 ثوان',
                'en': 'Random letter selected! Will disappear in 3 seconds'
            },
            'reset-success': {
                'ar': 'تم مسح جميع الألوان!',
                'en': 'All colors have been reset!'
            },
            'shuffle-success': {
                'ar': 'تم تبديل الحروف بنجاح!',
                'en': 'Letters have been shuffled successfully!'
            }
        };
        
        statusText.innerText = statusMessages[status][currentLang];
        
        // إضافة تأثير التحديث
        statusText.classList.add('status-text-update');
        
        // إزالة تأثير التحديث بعد انتهاء الرسوم المتحركة
        setTimeout(() => {
            statusText.classList.remove('status-text-update');
        }, 500);
    }

    // إعادة تعيين جميع الخلايا
    function resetAllCells() {
        hexCells.forEach(cell => {
            cell.classList.remove('selected-green', 'selected-red', 'highlight', 'purple', 'color-changing');
        });

        // إعادة تعيين العدادات
        greenCellsCount = 0;
        redCellsCount = 0;
        updateCounters();

        // إزالة التظليل
        if (highlightedCell) {
            highlightedCell.classList.remove('highlight', 'purple');
            highlightedCell = null;
        }

        // إلغاء أي مؤقت حالي
        if (randomLetterTimeout) {
            clearTimeout(randomLetterTimeout);
            randomLetterTimeout = null;
        }
        
        // حفظ التقدم بعد إعادة التعيين
        saveProgress();
    }

    // تظليل حرف عشوائي
    function highlightRandomLetter() {
        // إلغاء أي مؤقت سابق
        if (randomLetterTimeout) {
            clearTimeout(randomLetterTimeout);
        }
        
        // إزالة التظليل السابق إذا وجد
        if (highlightedCell) {
            highlightedCell.classList.remove('highlight', 'purple');
        }

        // اختيار خلية حرف عشوائية
        if (letterCells.length > 0) {
            const randomIndex = Math.floor(Math.random() * letterCells.length);
            highlightedCell = letterCells[randomIndex];
            
            // إضافة تأثير التظليل واللون البنفسجي
            highlightedCell.classList.add('highlight', 'purple');
            
            // تعيين مؤقت لإزالة التظليل بعد 3 ثوان
            randomLetterTimeout = setTimeout(function() {
                if (highlightedCell) {
                    highlightedCell.classList.remove('highlight', 'purple');
                    highlightedCell = null;
                    updateStatusText('default');
                }
                randomLetterTimeout = null;
            }, 3000);
        }
    }

    // عرض مربع حوار التأكيد
    function showConfirmDialog(action) {
        if (!confirmDialog || !confirmTitle || !confirmMessage) return;
        
        currentAction = action;
        
        if (action === 'reset') {
            confirmTitle.innerText = currentLang === 'ar' ? 'تأكيد عملية المسح' : 'Confirm Reset';
            confirmMessage.innerText = currentLang === 'ar' ? 'سيتم مسح جميع التقدم الحالي. هل أنت متأكد؟' : 'All current progress will be erased. Are you sure?';
        } else if (action === 'shuffle') {
            confirmTitle.innerText = currentLang === 'ar' ? 'تأكيد العملية' : 'Confirm Action';
            confirmMessage.innerText = currentLang === 'ar' ? 'سيتم حذف جميع التقدم الحالي وتبديل الحروف. هل أنت متأكد؟' : 'All current progress will be erased and letters will be shuffled. Are you sure?';
        }
        
        confirmDialog.style.display = 'flex';
    }

    // إخفاء مربع حوار التأكيد
    function hideConfirmDialog() {
        if (confirmDialog) {
            confirmDialog.style.display = 'none';
        }
    }

    // تبديل الحروف
    function shuffleLetters() {
        // تشغيل صوت التبديل
        if (shuffleSound) shuffleSound.play();
        
        // الحصول على الحروف المناسبة للغة الحالية
        const letters = currentLang === 'ar' ? arabicLetters.slice() : englishLetters.slice();
        
        // اختيار عدد من الحروف يساوي عدد خلايا الحروف في اللعبة
        const selectedLetters = letters.slice(0, letterCells.length);
        
        // خلط الحروف
        shuffleArray(selectedLetters);

        // تطبيق الحروف المخلوطة
        letterCells.forEach((cell, index) => {
            if (index < selectedLetters.length) {
                // إضافة تأثير الحركة
                cell.classList.add('shuffling');
                
                // تأخير تغيير النص للحصول على تأثير بصري أفضل
                setTimeout(() => {
                    cell.innerText = selectedLetters[index];
                    
                    // إزالة تأثير الحركة بعد انتهاء التبديل
                    setTimeout(() => {
                        cell.classList.remove('shuffling');
                    }, 500);
                }, 100);
            }
        });
    }

    // دالة خلط المصفوفة (خوارزمية Fisher-Yates)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // إضافة دعم للأجهزة المحمولة (تعديل أحجام الخلايا حسب حجم الشاشة)
    function resizeHoneycomb() {
        const container = document.querySelector('.honeycomb-container');
        const honeycomb = document.querySelector('.honeycomb');
        
        if (!container || !honeycomb) return;
        
        const windowWidth = window.innerWidth;
        
        if (windowWidth <= 400) {
            container.style.height = `${340 * currentZoom}px`;
            honeycomb.style.transform = `scale(${0.45 * currentZoom})`;
            honeycomb.style.transformOrigin = 'center center';
        } else if (windowWidth <= 500) {
            container.style.height = `${380 * currentZoom}px`;
            honeycomb.style.transform = `scale(${0.55 * currentZoom})`;
            honeycomb.style.transformOrigin = 'center center';
        } else if (windowWidth <= 700) {
            container.style.height = `${420 * currentZoom}px`;
            honeycomb.style.transform = `scale(${0.7 * currentZoom})`;
            honeycomb.style.transformOrigin = 'center center';
        } else {
            container.style.height = `${540 * currentZoom}px`;
            honeycomb.style.transform = `scale(${1 * currentZoom})`;
            honeycomb.style.transformOrigin = 'center center';
        }
    }

    // حفظ التقدم في localStorage
    function saveProgress() {
        const gameState = {
            greenCells: [],
            redCells: [],
            currentZoom: currentZoom,
            language: currentLang,
            darkMode: darkMode
        };
        
        // حفظ حالة الخلايا المحددة
        hexCells.forEach((cell, index) => {
            if (cell.classList.contains('selected-green')) {
                gameState.greenCells.push(index);
            } else if (cell.classList.contains('selected-red')) {
                gameState.redCells.push(index);
            }
        });
        
        // حفظ الحالة في localStorage
        try {
            localStorage.setItem('honeycombGameState', JSON.stringify(gameState));
        } catch (error) {
            console.error('Error saving game state:', error);
        }
    }
    
    // تحميل التقدم من localStorage
    function loadProgress() {
        const savedState = localStorage.getItem('honeycombGameState');
        if (!savedState) return;
        
        try {
            const gameState = JSON.parse(savedState);
            
            // استعادة حالة الخلايا
            if (gameState.greenCells && Array.isArray(gameState.greenCells)) {
                gameState.greenCells.forEach(index => {
                    if (index < hexCells.length) {
                        hexCells[index].classList.add('selected-green');
                        greenCellsCount++;
                    }
                });
            }
            
            if (gameState.redCells && Array.isArray(gameState.redCells)) {
                gameState.redCells.forEach(index => {
                    if (index < hexCells.length) {
                        hexCells[index].classList.add('selected-red');
                        redCellsCount++;
                    }
                });
            }
            
            // استعادة حالة التكبير/التصغير
            if (gameState.currentZoom) {
                currentZoom = gameState.currentZoom;
                applyZoom();
            }
            
            // استعادة حالة اللغة إذا كانت موجودة
            if (gameState.language) {
                currentLang = gameState.language;
                setLanguage(currentLang);
            }
            
            // استعادة حالة الوضع الليلي إذا كانت مختلفة عن الافتراضي
            if (gameState.darkMode !== undefined && gameState.darkMode !== darkMode) {
                darkMode = gameState.darkMode;
                if (darkMode) {
                    document.body.classList.add('dark-mode');
                } else {
                    document.body.classList.remove('dark-mode');
                }
                updateThemeToggleText();
            }
            
            // تحديث العدادات
            updateCounters();
            
        } catch (error) {
            console.error('Error loading saved game state:', error);
        }
    }

    // استدعاء دالة تغيير الحجم عند تحميل الصفحة
    resizeHoneycomb();
    
    // استدعاء دالة تغيير الحجم عند تغيير حجم النافذة
    window.addEventListener('resize', resizeHoneycomb);

    // إضافة رسالة وصفية في وحدة التحكم
    console.log("تم تهيئة لعبة خلية الحروف بنجاح!");
});
