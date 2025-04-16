document.addEventListener('DOMContentLoaded', function() {
    // استيراد الخدمات والمكونات
    const GameService = {
        // تهيئة بيانات اللعبة
        init() {
            return {
                currentColor: null,
                greenCellsCount: 0,
                redCellsCount: 0,
                highlightedCell: null,
                randomLetterTimeout: null,
                currentAction: null,
                darkMode: localStorage.getItem('darkMode') === 'enabled',
                isMobile: false,
                // بيانات ثابتة
                arabicLetters: [
                    'أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر',
                    'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف',
                    'ق', 'ك', 'ل', 'م', 'ن', 'هـ', 'و', 'ي'
                ],
                // الإعدادات والتفضيلات
                settings: {
                    highlightDuration: 3000 // مدة تظليل الحرف العشوائي بالمللي ثانية
                }
            };
        },
        
        // خلط مصفوفة (خوارزمية Fisher-Yates)
        shuffleArray(array) {
            const newArray = [...array];
            for (let i = newArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
            }
            return newArray;
        }
    };
    
    // مدير UI
    const UIManager = {
        // عناصر DOM
        elements: {
            // سيتم تعبئتها في دالة init()
        },
        
        // تهيئة إدارة واجهة المستخدم
        init() {
            // الحصول على جميع العناصر المطلوبة من DOM
            this.elements = {
                hexCells: document.querySelectorAll('.hex'),
                letterCells: document.querySelectorAll('.hex.letter'),
                greenBtn: document.getElementById('greenBtn'),
                redBtn: document.getElementById('redBtn'),
                creamBtn: document.getElementById('creamBtn'),
                resetBtn: document.getElementById('resetBtn'),
                randomBtn: document.getElementById('randomBtn'),
                shuffleBtn: document.getElementById('shuffleBtn'),
                statusText: document.getElementById('statusText'),
                greenCount: document.getElementById('greenCount'),
                redCount: document.getElementById('redCount'),
                confirmDialog: document.getElementById('confirmDialog'),
                confirmYes: document.getElementById('confirmYes'),
                confirmNo: document.getElementById('confirmNo'),
                confirmTitle: document.getElementById('confirmTitle'),
                confirmMessage: document.getElementById('confirmMessage'),
                themeToggle: document.getElementById('themeToggle'),
                honeycomb: document.getElementById('honeycomb'),
                honeycombContainer: document.querySelector('.honeycomb-container')
            };
            
            // إنشاء مصفوفة خلية العسل بشكل ديناميكي
            this.createHoneycomb();
            
            // تحديث العناصر بعد إنشاء الخلايا
            this.elements.hexCells = document.querySelectorAll('.hex');
            this.elements.letterCells = document.querySelectorAll('.hex.letter');
        },
        
        // تحديث عدادات الخلايا
        updateCounters(greenCount, redCount) {
            this.elements.greenCount.textContent = greenCount;
            this.elements.redCount.textContent = redCount;
        },
        
        // تحديث نص الحالة - تم تعديلها لإزالة اللون البنفسجي
        updateStatusText(text) {
            this.elements.statusText.textContent = text;
            
            // تطبيق تأثير بسيط للتنبيه بدون تغيير اللون
            this.elements.statusText.style.transform = 'scale(1.02)';
            
            // إعادة النص إلى حجمه الطبيعي بعد وقت قصير
            setTimeout(() => {
                this.elements.statusText.style.transform = 'scale(1)';
            }, 200);
        },
        
        // إظهار مربع حوار التأكيد
        showConfirmDialog(action, title, message, onConfirm) {
            this.elements.confirmTitle.textContent = title;
            this.elements.confirmMessage.textContent = message;
            this.elements.confirmDialog.style.display = 'flex';
            
            // تعيين وظيفة التأكيد
            const confirmYesHandler = () => {
                this.elements.confirmYes.removeEventListener('click', confirmYesHandler);
                this.hideConfirmDialog();
                onConfirm();
            };
            
            this.elements.confirmYes.addEventListener('click', confirmYesHandler);
            this.elements.confirmNo.addEventListener('click', () => this.hideConfirmDialog());
        },
        
        // إخفاء مربع حوار التأكيد
        hideConfirmDialog() {
            this.elements.confirmDialog.style.display = 'none';
        },
        
        // تبديل الوضع الليلي
        toggleDarkMode(isDarkMode) {
            if (isDarkMode) {
                document.body.classList.add('dark-mode');
                this.elements.themeToggle.innerHTML = '<i class="fas fa-moon"></i> <span>الوضع العادي</span>';
            } else {
                document.body.classList.remove('dark-mode');
                this.elements.themeToggle.innerHTML = '<i class="fas fa-moon"></i> <span>الوضع الليلي</span>';
            }
        },
        
        // إنشاء هيكل خلية العسل ديناميكياً - طريقة محسنة للتوافق مع الهواتف
        createHoneycomb() {
            const honeycomb = this.elements.honeycomb;
            honeycomb.innerHTML = '';
            
            // ضبط نمط container للتناسق
            honeycomb.style.position = 'absolute';
            honeycomb.style.width = '480px';
            honeycomb.style.height = '500px';
            
            // تحديد أبعاد الخلية بدقة
            const hexWidth = 80;
            const hexHeight = 92;
            
            // إنشاء الصف الأول (لون وردي)
            for (let i = 0; i < 6; i++) {
                const hex = document.createElement('div');
                hex.className = 'hex pink';
                hex.id = `hex-row1-${i}`;
                hex.style.left = `${-35 + (i * hexWidth)}px`;
                hex.style.top = '0px';
                
                // تحديد الأبعاد بشكل صريح لضمان التلاصق
                hex.style.width = `${hexWidth}px`;
                hex.style.height = `${hexHeight}px`;
                
                honeycomb.appendChild(hex);
            }
            
            // الحروف العربية للخلايا
            const arabicLetters = GameService.init().arabicLetters.slice(0, 25);
            let letterIndex = 0;
            
            // إنشاء الصفوف الداخلية (الصفوف من 2 إلى 6)
            for (let row = 0; row < 5; row++) {
                const isEvenRow = row % 2 === 0;
                const leftStart = isEvenRow ? -75 : -35;
                const topPosition = 70 + (row * 70);
                
                // إنشاء 7 خلايا لكل صف داخلي
                for (let i = 0; i < 7; i++) {
                    const hex = document.createElement('div');
                    
                    // الخلايا الخضراء على الجانبين، والحروف في الوسط
                    if (i === 0 || i === 6) {
                        hex.className = 'hex green';
                    } else {
                        hex.className = 'hex cream letter';
                        // إضافة حرف عربي
                        if (letterIndex < arabicLetters.length) {
                            hex.textContent = arabicLetters[letterIndex++];
                        }
                    }
                    
                    hex.id = `hex-row${row+2}-${i}`;
                    hex.style.left = `${leftStart + (i * hexWidth)}px`;
                    hex.style.top = `${topPosition}px`;
                    
                    // تحديد الأبعاد بشكل صريح لضمان التلاصق
                    hex.style.width = `${hexWidth}px`;
                    hex.style.height = `${hexHeight}px`;
                    
                    honeycomb.appendChild(hex);
                }
            }
            
            // إنشاء الصف الأخير (لون وردي)
            for (let i = 0; i < 6; i++) {
                const hex = document.createElement('div');
                hex.className = 'hex pink';
                hex.id = `hex-row7-${i}`;
                hex.style.left = `${-35 + (i * hexWidth)}px`;
                hex.style.top = '420px';
                
                // تحديد الأبعاد بشكل صريح لضمان التلاصق
                hex.style.width = `${hexWidth}px`;
                hex.style.height = `${hexHeight}px`;
                
                honeycomb.appendChild(hex);
            }
        },
        
        // تحديد اللون الحالي بصرياً
        setCurrentColorUI(color) {
            const { greenBtn, redBtn, creamBtn } = this.elements;
            // إزالة التأثيرات البصرية من جميع الأزرار
            [greenBtn, redBtn, creamBtn].forEach(btn => {
                btn.style.boxShadow = 'var(--shadow-sm)';
                btn.style.transform = 'translateY(0px)';
                btn.setAttribute('aria-pressed', 'false');
            });
            
            // إبراز الزر المحدد
            if (color === 'green') {
                greenBtn.style.boxShadow = '0 0 0 3px var(--primary-dark)';
                greenBtn.style.transform = 'translateY(-3px)';
                greenBtn.setAttribute('aria-pressed', 'true');
            } else if (color === 'red') {
                redBtn.style.boxShadow = '0 0 0 3px var(--secondary-dark)';
                redBtn.style.transform = 'translateY(-3px)';
                redBtn.setAttribute('aria-pressed', 'true');
            } else if (color === 'cream') {
                creamBtn.style.boxShadow = '0 0 0 3px #e0e0e0';
                creamBtn.style.transform = 'translateY(-3px)';
                creamBtn.setAttribute('aria-pressed', 'true');
            }
        },
        
        // تظليل حرف عشوائي
        highlightRandomLetter() {
            const letterCells = Array.from(this.elements.letterCells);
            if (letterCells.length === 0) return null;
            
            // اختيار خلية عشوائية
            const randomIndex = Math.floor(Math.random() * letterCells.length);
            const cell = letterCells[randomIndex];
            
            // إضافة تأثير التظليل
            cell.classList.add('highlight', 'purple');
            
            return cell;
        },
        
        // تبديل الحروف بصرياً
        shuffleLettersUI(letters) {
            const letterCells = Array.from(this.elements.letterCells);
            if (letterCells.length === 0 || letters.length !== letterCells.length) return false;
            
            // تطبيق الحروف المخلوطة
            letterCells.forEach((cell, index) => {
                // إضافة تأثير الحركة
                cell.classList.add('shuffling');
                
                // تأخير تغيير النص للحصول على تأثير بصري أفضل
                setTimeout(() => {
                    cell.textContent = letters[index];
                    
                    // إزالة تأثير الحركة بعد انتهاء التبديل
                    setTimeout(() => {
                        cell.classList.remove('shuffling');
                    }, 500);
                }, 100);
            });
            
            return true;
        },
        
        // تغيير حجم خلية العسل بناءً على حجم الشاشة - طريقة محسنة
        resizeHoneycomb(isMobile) {
            const { honeycombContainer, honeycomb } = this.elements;
            const windowWidth = window.innerWidth;
            
            // إعادة ضبط نمط الخلية أولاً
            honeycomb.style = '';
            
            // تطبيق النمط الثابت
            honeycomb.style.position = 'absolute';
            honeycomb.style.width = '480px';
            honeycomb.style.height = '500px';
            honeycomb.style.top = '50%';
            honeycomb.style.left = '50%';
            
            // تحديد مقياس التحويل المناسب لكل حجم شاشة
            let scale;
            if (isMobile) {
                // مقياس للأجهزة المحمولة بدقة أكبر
                if (windowWidth <= 320) {
                    scale = 0.45;
                    honeycombContainer.style.height = '330px';
                } else if (windowWidth <= 375) {
                    scale = 0.52;
                    honeycombContainer.style.height = '360px';
                } else if (windowWidth <= 480) {
                    scale = 0.58;
                    honeycombContainer.style.height = '390px';
                } else if (windowWidth <= 600) {
                    scale = 0.65;
                    honeycombContainer.style.height = '420px';
                } else {
                    scale = 0.75;
                    honeycombContainer.style.height = '460px';
                }
            } else {
                scale = 1;
                honeycombContainer.style.height = '540px';
            }
            
            // تطبيق التحويل مع توسيط دقيق
            honeycomb.style.transformOrigin = 'center center';
            honeycomb.style.transform = `translate(-50%, -50%) scale(${scale})`;
            
            // إضافة تأخير لإعادة ضبط الخلايا
            setTimeout(() => {
                // إجبار إعادة الرسم وضمان أبعاد ثابتة
                const hexCells = document.querySelectorAll('.hex');
                const hexWidth = 80;
                const hexHeight = 92;
                
                hexCells.forEach(cell => {
                    // تأكيد على الأبعاد بشكل صريح
                    cell.style.width = `${hexWidth}px`;
                    cell.style.height = `${hexHeight}px`;
                    
                    // تطبيق تحديث بسيط لإجبار المتصفح على إعادة رسم العنصر
                    cell.style.display = 'none';
                    // إجبار المتصفح على إعادة تقييم الDOMحالاً
                    cell.offsetHeight;
                    cell.style.display = 'flex';
                });
            }, 50);
        },
        
        // تأكيد تطبيق أبعاد ثابتة على جميع الخلايا
        enforceHexDimensions() {
            const hexCells = document.querySelectorAll('.hex');
            const hexWidth = 80;
            const hexHeight = 92;
            
            hexCells.forEach(cell => {
                cell.style.width = `${hexWidth}px`;
                cell.style.height = `${hexHeight}px`;
            });
        }
    };
    
    // مدير اللعبة - المتحكم الرئيسي
    const GameManager = {
        // حالة اللعبة
        state: GameService.init(),
        
        // تهيئة اللعبة
        init() {
            // تهيئة واجهة المستخدم
            UIManager.init();
            
            // اكتشاف نوع الجهاز
            this.detectDevice();
            
            // تطبيق الوضع الليلي إذا كان مفعلاً
            UIManager.toggleDarkMode(this.state.darkMode);
            
            // تحديث العدادات
            UIManager.updateCounters(this.state.greenCellsCount, this.state.redCellsCount);
            
            // تهيئة حجم خلية العسل
            UIManager.resizeHoneycomb(this.state.isMobile);
            
            // إضافة أحداث المستمعين
            this.setupEventListeners();
            
            // ضمان التطبيق الصحيح للتوسيط
            this.ensureProperRendering();
        },
        
        // ضمان التطبيق الصحيح للتوسيط
        ensureProperRendering() {
            // تأكيد تطبيق الأبعاد الثابتة للخلايا
            UIManager.enforceHexDimensions();
            
            // تطبيق آلية اختبار التحميل للتأكد من التوسيط بعد تحميل الصفحة بالكامل
            if (document.readyState === 'complete') {
                this.centerHoneycomb();
            } else {
                window.addEventListener('load', () => {
                    setTimeout(() => this.centerHoneycomb(), 100);
                });
            }
            
            // إضافة تأكيد متأخر لضمان الاستقرار
            setTimeout(() => this.centerHoneycomb(), 300);
        },
        
        // توسيط خلية العسل في وسط الحاوية
        centerHoneycomb() {
            UIManager.resizeHoneycomb(this.state.isMobile);
            
            // تأكيد إضافي للأبعاد
            setTimeout(() => {
                UIManager.enforceHexDimensions();
            }, 100);
        },
        
        // إعداد مستمعي الأحداث
        setupEventListeners() {
            const { 
                greenBtn, redBtn, creamBtn, resetBtn, randomBtn, shuffleBtn,
                themeToggle
            } = UIManager.elements;
            
            // أحداث أزرار الألوان
            greenBtn.addEventListener('click', () => this.setCurrentColor('green'));
            redBtn.addEventListener('click', () => this.setCurrentColor('red'));
            creamBtn.addEventListener('click', () => this.setCurrentColor('cream'));
            
            // أحداث أزرار الإجراءات
            resetBtn.addEventListener('click', () => this.confirmReset());
            randomBtn.addEventListener('click', () => this.highlightRandomLetter());
            shuffleBtn.addEventListener('click', () => this.confirmShuffle());
            themeToggle.addEventListener('click', () => this.toggleDarkMode());
            
            // أحداث النقر على الخلايا
            this.setupCellClickEvents();
            
            // استخدام ResizeObserver لمراقبة تغييرات الحجم بدقة
            if (window.ResizeObserver) {
                const resizeObserver = new ResizeObserver(() => {
                    // إعادة اكتشاف الجهاز
                    this.detectDevice();
                    // تحديث حجم خلية العسل
                    this.centerHoneycomb();
                });
                
                // مراقبة حجم الحاوية
                resizeObserver.observe(UIManager.elements.honeycombContainer);
            } else {
                // دعم المتصفحات القديمة التي لا تدعم ResizeObserver
                window.addEventListener('resize', () => {
                    this.detectDevice();
                    this.centerHoneycomb();
                });
            }
            
            // التعامل مع تدوير الشاشة في الأجهزة المحمولة
            window.addEventListener('orientationchange', () => {
                setTimeout(() => {
                    this.detectDevice();
                    this.centerHoneycomb();
                }, 200);
            });
        },
        
        // إعداد أحداث النقر على الخلايا
        setupCellClickEvents() {
            document.querySelectorAll('.hex').forEach(cell => {
                if (cell.classList.contains('letter') || cell.classList.contains('cream') || 
                    cell.classList.contains('green') || cell.classList.contains('pink')) {
                    cell.addEventListener('click', () => {
                        if (this.state.currentColor) {
                            this.applyColorToCell(cell);
                        } else {
                            UIManager.updateStatusText('الرجاء اختيار لون أولاً');
                        }
                    });
                }
            });
        },
        
        // تحقق من نوع الجهاز
        detectDevice() {
            this.state.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
            return this.state.isMobile;
        },
        
        // تعيين اللون الحالي
        setCurrentColor(color) {
            this.state.currentColor = color;
            UIManager.setCurrentColorUI(color);
            
            // تحديث نص الحالة
            if (color === 'green') {
                UIManager.updateStatusText('اختر الخلايا لتلوينها بالأخضر');
            } else if (color === 'red') {
                UIManager.updateStatusText('اختر الخلايا لتلوينها بالأحمر');
            } else if (color === 'cream') {
                UIManager.updateStatusText('اختر الخلايا لإعادتها للون الأصلي');
            }
        },
        
        // تطبيق اللون على الخلية
        applyColorToCell(cell) {
            // إذا كانت الخلية وردية ثابتة في الهيكل، لا تقم بأي تغيير
            if (cell.classList.contains('pink') && !cell.classList.contains('selected-green') && !cell.classList.contains('selected-red')) {
                return;
            }

            // حساب التغيير في العدادات قبل تغيير الألوان
            let oldGreen = cell.classList.contains('selected-green') ? 1 : 0;
            let oldRed = cell.classList.contains('selected-red') ? 1 : 0;
            let newGreen = this.state.currentColor === 'green' ? 1 : 0;
            let newRed = this.state.currentColor === 'red' ? 1 : 0;

            // إزالة جميع ألوان التحديد
            cell.classList.remove('selected-green', 'selected-red');

            // إضافة لون التحديد الجديد
            if (this.state.currentColor === 'green' && !cell.classList.contains('green')) {
                cell.classList.add('selected-green');
            } else if (this.state.currentColor === 'red' && !cell.classList.contains('pink')) {
                cell.classList.add('selected-red');
            }

            // تحديث العدادات
            this.state.greenCellsCount = this.state.greenCellsCount - oldGreen + newGreen;
            this.state.redCellsCount = this.state.redCellsCount - oldRed + newRed;
            UIManager.updateCounters(this.state.greenCellsCount, this.state.redCellsCount);
            
            // تأكيد على الأبعاد بعد تغيير اللون
            setTimeout(() => UIManager.enforceHexDimensions(), 10);
        },
        
        // تظليل حرف عشوائي
        highlightRandomLetter() {
            // إلغاء أي مؤقت سابق
            if (this.state.randomLetterTimeout) {
                clearTimeout(this.state.randomLetterTimeout);
            }
            
            // إزالة التظليل السابق إذا وجد
            if (this.state.highlightedCell) {
                this.state.highlightedCell.classList.remove('highlight', 'purple');
            }

            // تظليل حرف عشوائي
            this.state.highlightedCell = UIManager.highlightRandomLetter();
            if (!this.state.highlightedCell) return;
            
            UIManager.updateStatusText('تم اختيار حرف عشوائي! سيختفي بعد 3 ثوان');
            
            // تعيين مؤقت لإزالة التظليل
            this.state.randomLetterTimeout = setTimeout(() => {
                if (this.state.highlightedCell) {
                    this.state.highlightedCell.classList.remove('highlight', 'purple');
                    this.state.highlightedCell = null;
                    UIManager.updateStatusText('اختر لوناً ثم انقر على الخلايا لتغيير لونها');
                }
                this.state.randomLetterTimeout = null;
            }, this.state.settings.highlightDuration);
        },
        
        // إعادة تعيين جميع الخلايا
        resetAllCells() {
            const hexCells = document.querySelectorAll('.hex');
            hexCells.forEach(cell => {
                cell.classList.remove('selected-green', 'selected-red', 'highlight', 'purple');
            });

            // إعادة تعيين العدادات
            this.state.greenCellsCount = 0;
            this.state.redCellsCount = 0;
            UIManager.updateCounters(0, 0);

            // إزالة التظليل
            if (this.state.highlightedCell) {
                this.state.highlightedCell.classList.remove('highlight', 'purple');
                this.state.highlightedCell = null;
            }

            // إلغاء أي مؤقت حالي
            if (this.state.randomLetterTimeout) {
                clearTimeout(this.state.randomLetterTimeout);
                this.state.randomLetterTimeout = null;
            }
            
            UIManager.updateStatusText('تم مسح جميع الألوان!');
            
            // تأكيد على الأبعاد بعد إعادة التعيين
            setTimeout(() => UIManager.enforceHexDimensions(), 10);
        },
        
        // تبديل الوضع الليلي
        toggleDarkMode() {
            this.state.darkMode = !this.state.darkMode;
            
            // تحديث واجهة المستخدم
            UIManager.toggleDarkMode(this.state.darkMode);
            
            // حفظ التفضيل
            if (this.state.darkMode) {
                localStorage.setItem('darkMode', 'enabled');
            } else {
                localStorage.removeItem('darkMode');
            }
        },
        
        // تأكيد إعادة تعيين اللعبة
        confirmReset() {
            this.state.currentAction = 'reset';
            UIManager.showConfirmDialog(
                'reset',
                'تأكيد عملية المسح',
                'سيتم مسح جميع التقدم الحالي. هل أنت متأكد؟',
                () => this.resetAllCells()
            );
        },
        
        // تأكيد تبديل الحروف
        confirmShuffle() {
            this.state.currentAction = 'shuffle';
            UIManager.showConfirmDialog(
                'shuffle',
                'تأكيد العملية',
                'سيتم حذف جميع التقدم الحالي وتبديل الحروف. هل أنت متأكد؟',
                () => this.shuffleLetters()
            );
        },
        
        // تبديل الحروف
        shuffleLetters() {
            // الحصول على جميع الحروف الحالية
            const letters = [];
            document.querySelectorAll('.hex.letter').forEach(cell => {
                letters.push(cell.textContent);
            });
            
            // خلط الحروف
            const shuffledLetters = GameService.shuffleArray(letters);
            
            // تطبيق الحروف المخلوطة
            UIManager.shuffleLettersUI(shuffledLetters);
            
            // إعادة تعيين الخلايا
            this.resetAllCells();
            UIManager.updateStatusText('تم تبديل الحروف بنجاح!');
            
            // تأكيد على الأبعاد بعد تبديل الحروف
            setTimeout(() => UIManager.enforceHexDimensions(), 500);
        }
    };
    
    // بدء اللعبة
    GameManager.init();
});
