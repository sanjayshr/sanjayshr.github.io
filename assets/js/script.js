document.addEventListener('DOMContentLoaded', () => {
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    let globalCursor = null;

    function createCursor() {
        if (!globalCursor) {
            globalCursor = document.createElement('span');
            globalCursor.className = 'cursor';
            document.body.appendChild(globalCursor);
        }
        return globalCursor;
    }

    function updateCursorPosition(element, charIndex) {
        const range = document.createRange();
        
        if (element.childNodes.length > 0) {
            range.setStart(element.childNodes[0], charIndex);
            range.setEnd(element.childNodes[0], charIndex);
            
            const rect = range.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const cursorTop = rect.top + window.scrollY;
            
            // Update cursor position
            globalCursor.style.left = `${rect.right}px`;
            globalCursor.style.top = `${rect.top}px`;

            // Calculate scroll position
            const desiredPosition = cursorTop - (viewportHeight / 2);
            
            // Only scroll if the cursor is below the middle of the viewport
            if (rect.top > viewportHeight / 1.5) {
                window.scrollTo({
                    top: desiredPosition,
                    behavior: 'smooth'
                });
            }
        }
    }

    async function typeWriter(element, text, speed = 30) { // Reduced speed for smoother typing
        element.style.opacity = '1';
        let i = 0;
        
        // Handle elements with icons
        const hasIcon = element.querySelector('i');
        if (hasIcon) {
            const iconHTML = hasIcon.outerHTML;
            element.innerHTML = iconHTML + ' ';
            await sleep(speed);
        }

        while (i < text.length) {
            if (!hasIcon) {
                element.textContent += text.charAt(i);
            } else {
                element.innerHTML = hasIcon.outerHTML + ' ' + text;
            }
            updateCursorPosition(element, hasIcon ? text.length : i + 1);
            i++;
            await sleep(speed);
        }
        await sleep(100); // Slight pause after each element
        return Promise.resolve();
    }

    async function typeAllContent() {
        createCursor();
        const sections = document.querySelectorAll('section');
        const header = document.querySelector('header');
        
        // Reset scroll position
        window.scrollTo({top: 0, behavior: 'instant'});
        await sleep(500);

        // Type header content
        const headerElements = header.querySelectorAll('.typing-content');
        for (let element of headerElements) {
            const originalText = element.textContent.trim();
            element.textContent = '';
            await typeWriter(element, originalText);
        }

        // Type sections
        for (let section of sections) {
            section.style.opacity = '1';
            const elements = section.querySelectorAll('.typing-content');
            for (let element of elements) {
                const originalText = element.textContent.trim();
                element.textContent = '';
                await typeWriter(element, originalText);
            }
            await sleep(500); // Pause between sections
        }

        // Keep cursor visible at the end
        await sleep(1000);
        globalCursor.style.display = 'none';
    }

    typeAllContent();
});
