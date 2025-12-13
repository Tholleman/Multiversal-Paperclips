import { getElement, el } from "./view.mjs";

class Terminal {
	/** @type {HTMLUListElement} */
	#ul;
	#counter = 0;
	/**	@type {string | undefined} */
	#head;
	
	constructor() {
		this.#ul = getElement('#consoleDiv > ul');
	}
	
	clear() {
		for (const element of this.#ul.children) {
			element.innerText = '';
		}
		this.#head = undefined;
	}
	
	/**
	 * @param {string} line 
	 * @param {'INFO' | 'WARNING' | 'ERROR'} logLevel 
	 */
	print(line, logLevel = 'INFO') {
		if (line === this.#head) {
			this.#ul.lastElementChild.innerText = `${line} (${++this.#counter})`;
			return;
		}
		this.#counter = 1;
		this.#head = line;
		const attributes={innerText: line};
		switch (logLevel) {
			case 'WARNING':
				attributes.style={color: '#FF7C00'};
				console.warn(line);
				break;
			case 'ERROR':
				attributes.style={color: '#F00', fontWeight: 'bold'};
				break;
		}
		this.#ul.firstElementChild.remove();
		this.addLine(attributes);
	}
	
	printHtml(html) {
		this.#head = undefined;
		this.#ul.firstElementChild.remove();
		this.addLine({innerHTML: html});
	}
	
	/**
	 * @param {string} line 
	 */
	warn(line) {
		this.print(line, 'WARNING');
	}
	
	addLine(attributes = {}) {
		const li = el('li', attributes);
		this.#ul.appendChild(li);
	}
}

export const terminal = new Terminal();

window.addEventListener('error', (ev) => {
  terminal.print(ev.message, 'ERROR');
});

terminal.warn('This is an ongoing development build. Your save file will be corrupted in the future');
terminal.print('Welcome to Multiversal Paperclips');
