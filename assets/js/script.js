document.addEventListener('DOMContentLoaded', () => {
    console.log('Script loaded');
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    let globalCursor = null;
    let isScrolling = false;
    const TYPING_SPEED = 30;

    function createCursor() {
        if (!globalCursor) {
            globalCursor = document.createElement('span');
            globalCursor.className = 'cursor';
            document.body.appendChild(globalCursor);
        }
        return globalCursor;
    }

    // Initialize all line numbers at once
    function initializeLineNumbers() {
        try {
            const lineNumbers = document.querySelector('.line-numbers');
            const container = document.querySelector('.container');
            
            if (!lineNumbers || !container) {
                console.error('Required elements not found');
                return;
            }

            const containerHeight = container.scrollHeight;
            const lineHeight = parseInt(getComputedStyle(container).lineHeight);
            const totalLines = Math.ceil(containerHeight / lineHeight);
            
            lineNumbers.innerHTML = '';
            
            for (let i = 1; i <= totalLines; i++) {
                const lineNum = document.createElement('div');
                lineNum.textContent = i;
                lineNumbers.appendChild(lineNum);
            }
        } catch (error) {
            console.error('Error initializing line numbers:', error);
        }
    }

    async function smoothScrollTo(element) {
        if (isScrolling) return;
        isScrolling = true;

        const mainContent = document.querySelector('.main-content');
        const elementRect = element.getBoundingClientRect();
        const elementTop = elementRect.top;
        const viewportHeight = window.innerHeight;
        
        const viewportMiddleStart = viewportHeight * 0.3;
        const viewportMiddleEnd = viewportHeight * 0.7;
        
        if (elementTop < viewportMiddleStart || elementTop > viewportMiddleEnd) {
            const targetScroll = mainContent.scrollTop + elementTop - (viewportHeight / 2);
            mainContent.scrollTo({
                top: targetScroll,
                behavior: 'smooth'
            });
            await sleep(300);
        }
        
        isScrolling = false;
    }

    function updateCursorPosition(element, charIndex) {
        const range = document.createRange();
        
        if (element.childNodes.length > 0) {
            range.setStart(element.childNodes[0], charIndex);
            range.setEnd(element.childNodes[0], charIndex);
            
            const rect = range.getBoundingClientRect();
            globalCursor.style.left = `${rect.right}px`;
            globalCursor.style.top = `${rect.top}px`;

            smoothScrollTo(element);
        }
    }

    async function typeWriter(element, text) {
        element.style.opacity = '1';
        let i = 0;
        const hasIcon = element.querySelector('i');
        
        if (hasIcon) {
            const iconHTML = hasIcon.outerHTML;
            element.innerHTML = iconHTML + ' ';
            await sleep(TYPING_SPEED);
        }

        while (i < text.length) {
            if (!hasIcon) {
                element.textContent += text.charAt(i);
            } else {
                element.innerHTML = hasIcon.outerHTML + ' ' + text.substring(0, i + 1);
            }
            
            updateCursorPosition(element, hasIcon ? text.length : i + 1);
            i++;
            await sleep(TYPING_SPEED);
        }
        
        await sleep(50);
        return Promise.resolve();
    }

    async function revealSection(section) {
        section.style.opacity = '1';
        section.style.transform = 'translateY(0)';
        await sleep(200);
    }

    async function typeAllContent() {
        createCursor();
        const sections = document.querySelectorAll('section');
        const header = document.querySelector('header');
        
        const mainContent = document.querySelector('.main-content');
        mainContent.scrollTo({top: 0, behavior: 'instant'});

        // Initialize all line numbers at start
        initializeLineNumbers();

        // Type header content
        const headerElements = header.querySelectorAll('.typing-content');
        for (let element of headerElements) {
            const originalText = element.textContent.trim();
            element.textContent = '';
            await typeWriter(element, originalText);
        }

        // Type sections
        for (let section of sections) {
            await revealSection(section);
            const elements = section.querySelectorAll('.typing-content');
            for (let element of elements) {
                const originalText = element.textContent.trim();
                element.textContent = '';
                await typeWriter(element, originalText);
            }
        }

        // Update line numbers one final time after all content is typed
        await sleep(500);
        initializeLineNumbers();
        globalCursor.style.display = 'none';
    }

    typeAllContent();
});
