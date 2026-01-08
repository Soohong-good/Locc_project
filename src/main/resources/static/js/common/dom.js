/**
 * DOM 조작 유틸리티
 * React처럼 선언적으로 DOM 조작
 */

/**
 * 엘리먼트 표시
 * @param {string|HTMLElement} element - 엘리먼트 ID 또는 객체
 * @param {string} displayType - display 타입 (기본: 'block')
 */
function show(element, displayType = 'block') {
    const el = typeof element === 'string' ? document.getElementById(element) : element;
    if (el) {
        el.style.display = displayType;
    }
}

/**
 * 엘리먼트 숨김
 * @param {string|HTMLElement} element - 엘리먼트 ID 또는 객체
 */
function hide(element) {
    const el = typeof element === 'string' ? document.getElementById(element) : element;
    if (el) {
        el.style.display = 'none';
    }
}

/**
 * 엘리먼트 토글
 * @param {string|HTMLElement} element - 엘리먼트 ID 또는 객체
 * @param {string} displayType - display 타입 (기본: 'block')
 */
function toggle(element, displayType = 'block') {
    const el = typeof element === 'string' ? document.getElementById(element) : element;
    if (el) {
        el.style.display = el.style.display === 'none' ? displayType : 'none';
    }
}

/**
 * 클래스 추가
 * @param {string|HTMLElement} element - 엘리먼트 ID 또는 객체
 * @param {string} className - 추가할 클래스명
 */
function addClass(element, className) {
    const el = typeof element === 'string' ? document.getElementById(element) : element;
    if (el) {
        el.classList.add(className);
    }
}

/**
 * 클래스 제거
 * @param {string|HTMLElement} element - 엘리먼트 ID 또는 객체
 * @param {string} className - 제거할 클래스명
 */
function removeClass(element, className) {
    const el = typeof element === 'string' ? document.getElementById(element) : element;
    if (el) {
        el.classList.remove(className);
    }
}

/**
 * 클래스 토글
 * @param {string|HTMLElement} element - 엘리먼트 ID 또는 객체
 * @param {string} className - 토글할 클래스명
 */
function toggleClass(element, className) {
    const el = typeof element === 'string' ? document.getElementById(element) : element;
    if (el) {
        el.classList.toggle(className);
    }
}

/**
 * 클래스 존재 확인
 * @param {string|HTMLElement} element - 엘리먼트 ID 또는 객체
 * @param {string} className - 확인할 클래스명
 * @returns {boolean}
 */
function hasClass(element, className) {
    const el = typeof element === 'string' ? document.getElementById(element) : element;
    return el ? el.classList.contains(className) : false;
}

/**
 * 텍스트 설정
 * @param {string|HTMLElement} element - 엘리먼트 ID 또는 객체
 * @param {string} text - 설정할 텍스트
 */
function setText(element, text) {
    const el = typeof element === 'string' ? document.getElementById(element) : element;
    if (el) {
        el.textContent = text;
    }
}

/**
 * HTML 설정
 * @param {string|HTMLElement} element - 엘리먼트 ID 또는 객체
 * @param {string} html - 설정할 HTML
 */
function setHTML(element, html) {
    const el = typeof element === 'string' ? document.getElementById(element) : element;
    if (el) {
        el.innerHTML = html;
    }
}

/**
 * 속성 설정
 * @param {string|HTMLElement} element - 엘리먼트 ID 또는 객체
 * @param {string} attr - 속성명
 * @param {string} value - 속성값
 */
function setAttribute(element, attr, value) {
    const el = typeof element === 'string' ? document.getElementById(element) : element;
    if (el) {
        el.setAttribute(attr, value);
    }
}

/**
 * 속성 가져오기
 * @param {string|HTMLElement} element - 엘리먼트 ID 또는 객체
 * @param {string} attr - 속성명
 * @returns {string|null}
 */
function getAttribute(element, attr) {
    const el = typeof element === 'string' ? document.getElementById(element) : element;
    return el ? el.getAttribute(attr) : null;
}

/**
 * data 속성 설정
 * @param {string|HTMLElement} element - 엘리먼트 ID 또는 객체
 * @param {string} key - data 키
 * @param {string} value - 값
 */
function setData(element, key, value) {
    const el = typeof element === 'string' ? document.getElementById(element) : element;
    if (el) {
        el.dataset[key] = value;
    }
}

/**
 * data 속성 가져오기
 * @param {string|HTMLElement} element - 엘리먼트 ID 또는 객체
 * @param {string} key - data 키
 * @returns {string|undefined}
 */
function getData(element, key) {
    const el = typeof element === 'string' ? document.getElementById(element) : element;
    return el ? el.dataset[key] : undefined;
}

/**
 * 자식 엘리먼트 추가
 * @param {string|HTMLElement} parent - 부모 엘리먼트
 * @param {HTMLElement} child - 자식 엘리먼트
 */
function appendChild(parent, child) {
    const parentEl = typeof parent === 'string' ? document.getElementById(parent) : parent;
    if (parentEl && child) {
        parentEl.appendChild(child);
    }
}

/**
 * 엘리먼트 제거
 * @param {string|HTMLElement} element - 엘리먼트 ID 또는 객체
 */
function removeElement(element) {
    const el = typeof element === 'string' ? document.getElementById(element) : element;
    if (el && el.parentNode) {
        el.parentNode.removeChild(el);
    }
}

/**
 * 모든 자식 엘리먼트 제거
 * @param {string|HTMLElement} element - 엘리먼트 ID 또는 객체
 */
function removeAllChildren(element) {
    const el = typeof element === 'string' ? document.getElementById(element) : element;
    if (el) {
        while (el.firstChild) {
            el.removeChild(el.firstChild);
        }
    }
}

/**
 * 엘리먼트 생성
 * @param {string} tag - 태그명
 * @param {Object} options - {className, id, text, html, attributes, dataset}
 * @returns {HTMLElement}
 */
function createElement(tag, options = {}) {
    const el = document.createElement(tag);
    
    if (options.className) {
        el.className = options.className;
    }
    
    if (options.id) {
        el.id = options.id;
    }
    
    if (options.text) {
        el.textContent = options.text;
    }
    
    if (options.html) {
        el.innerHTML = options.html;
    }
    
    if (options.attributes) {
        Object.keys(options.attributes).forEach(key => {
            el.setAttribute(key, options.attributes[key]);
        });
    }
    
    if (options.dataset) {
        Object.keys(options.dataset).forEach(key => {
            el.dataset[key] = options.dataset[key];
        });
    }
    
    return el;
}

/**
 * 쿼리 셀렉터 (단일)
 * @param {string} selector - CSS 셀렉터
 * @param {HTMLElement} parent - 부모 엘리먼트 (옵션)
 * @returns {HTMLElement|null}
 */
function $(selector, parent = document) {
    return parent.querySelector(selector);
}

/**
 * 쿼리 셀렉터 (전체)
 * @param {string} selector - CSS 셀렉터
 * @param {HTMLElement} parent - 부모 엘리먼트 (옵션)
 * @returns {NodeList}
 */
function $$(selector, parent = document) {
    return parent.querySelectorAll(selector);
}

/**
 * 이벤트 리스너 추가 (위임)
 * @param {string|HTMLElement} parent - 부모 엘리먼트
 * @param {string} eventType - 이벤트 타입
 * @param {string} selector - 자식 셀렉터
 * @param {Function} handler - 핸들러 함수
 */
function delegate(parent, eventType, selector, handler) {
    const parentEl = typeof parent === 'string' ? document.getElementById(parent) : parent;
    if (!parentEl) return;
    
    parentEl.addEventListener(eventType, function(event) {
        const target = event.target.closest(selector);
        if (target && parentEl.contains(target)) {
            handler.call(target, event);
        }
    });
}

/**
 * 스크롤 최상단 이동
 * @param {boolean} smooth - 부드러운 스크롤 여부
 */
function scrollToTop(smooth = true) {
    window.scrollTo({
        top: 0,
        behavior: smooth ? 'smooth' : 'auto'
    });
}

/**
 * 엘리먼트로 스크롤
 * @param {string|HTMLElement} element - 엘리먼트 ID 또는 객체
 * @param {boolean} smooth - 부드러운 스크롤 여부
 */
function scrollToElement(element, smooth = true) {
    const el = typeof element === 'string' ? document.getElementById(element) : element;
    if (el) {
        el.scrollIntoView({
            behavior: smooth ? 'smooth' : 'auto',
            block: 'start'
        });
    }
}

/**
 * 클립보드에 복사
 * @param {string} text - 복사할 텍스트
 * @returns {Promise<void>}
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('클립보드에 복사되었습니다.', 'success');
    } catch (err) {
        console.error('Failed to copy:', err);
        showToast('복사에 실패했습니다.', 'error');
    }
}

/**
 * 포커스 설정
 * @param {string|HTMLElement} element - 엘리먼트 ID 또는 객체
 */
function setFocus(element) {
    const el = typeof element === 'string' ? document.getElementById(element) : element;
    if (el) {
        el.focus();
    }
}

// 전역 스코프에 노출
window.show = show;
window.hide = hide;
window.toggle = toggle;
window.addClass = addClass;
window.removeClass = removeClass;
window.toggleClass = toggleClass;
window.hasClass = hasClass;
window.setText = setText;
window.setHTML = setHTML;
window.setAttribute = setAttribute;
window.getAttribute = getAttribute;
window.setData = setData;
window.getData = getData;
window.appendChild = appendChild;
window.removeElement = removeElement;
window.removeAllChildren = removeAllChildren;
window.createElement = createElement;
window.$ = $;
window.$$ = $$;
window.delegate = delegate;
window.scrollToTop = scrollToTop;
window.scrollToElement = scrollToElement;
window.copyToClipboard = copyToClipboard;
window.setFocus = setFocus;
