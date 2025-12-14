/**
 * @param {string} query
 * @returns {HTMLElement}
 */
export function getElement(query) {
	const result = document.querySelector(query);
	if (result == null) throw Error(`Could not find element: ${query}`);
	return result;
}

/**
 * @template Args
 * @param {string} query
 * @param {(el: HTMLElement, args: Args) => any} cb
 * @returns {(args: Args) => void}
 */
export function withElement(query, cb) {
	const element = getElement(query);
	return (...args) => { cb(element, ...args); };
}

export function unlockElement(query) {
	const element = getElement(query);
	if (!element.classList.contains('toUnlock')) throw new Error('query does not have the class toUnlock');
	element.classList.remove('toUnlock');
}

/**
 * @template {keyof HTMLElementTagNameMap} T
 * @param {T} tag
 * @param {{style?: Partial<CSSStyleDeclaration>} & {innerText?: string} & {innerHTML?: string} & {[key: Exclude<string, 'style'>]: string}} [attributes]
 * @param {HTMLElement} children
 * @returns {HTMLElementTagNameMap[T]}
 */
export function el(tag, attributes, ...children) {
	const result = document.createElement(tag);
	if (attributes != null) {
		if ('innerText' in attributes) {
			result.innerText = attributes.innerText;
			delete attributes.innerText;
		}
		if ('innerHTML' in attributes) {
			result.innerHTML = attributes.innerHTML;
			delete attributes.innerHTML;
		}
		if ('style' in attributes) {
			for (const style in attributes.style) {
				result.style[style] = attributes.style[style] ?? '';
			}
			delete attributes.style;
		}
		for (const key in attributes) {
			result.setAttribute(key, attributes[key]);
		}
	}
	
	for (const element of children ?? []) {
		result.appendChild(element);
	}
	return result;
}

export function bindDropdown(selector, subject) {
	const element = document.querySelector(selector);
	if (element == null) throw new Error('Element not found: ' + selector);
	subject.onChange(value => element.value = value);
	element.addEventListener('change', () => {
		subject.value = element.value;
	});
}
