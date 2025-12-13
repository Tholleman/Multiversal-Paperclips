'use strict';

// noinspection JSValidateJSDoc
/**
 * @template Type
 */
class ObservableValue {
	/** @type {Type} */
	#value;
	/** @type {((value: Type) => void)[]} */
	#observers;
	/** @type {{predicate: (value: Type) => boolean, then: (value: Type) => void}[]} */
	#triggers = [];
	
	/**
	 * Helper method that will set the generic correctly which doesn't happen with the constructor
	 *
	 * @template Type
	 * @param {Type} value
	 * @param {((value: Type) => void) | ((value: Type) => void)[]} observers
	 * @return ObservableValue<Type>
	 */
	static new(value, observers = []) {
		return new ObservableValue(value, observers);
	}
	
	/**
	 * @param {Type} value
	 * @param {((value: Type) => void) | ((value: Type) => void)[]} observers
	 */
	constructor(value, observers = []) {
		if (Array.isArray(observers)) {
			this.#observers = observers;
		} else {
			this.#observers = [observers];
		}
		this.value = value;
	}
	
	/**
	 * @returns {Type}
	 */
	get value() {
		return this.#value;
	}
	
	/**
	 * @param {Type} value
	 */
	set value(value) {
		if (this.#value === value) return;
		this.#value = value;
		for (const lambda of this.#observers) {
			lambda(value);
		}
		for (let i = this.#triggers.length - 1; i >= 0; i--) {
			let trigger = this.#triggers[i];
			if (trigger.predicate(value)) {
				trigger.then(value);
				this.#triggers.splice(i);
			}
		}
	}
	
	/**
	 * @param {(Type) => void} lambda
	 */
	onChange(lambda) {
		this.#observers.push(lambda);
		lambda(this.value);
		return this;
	}
	
	/**
	 * @param {(Type) => void} lambda
	 */
	onChangeDelayed(lambda) {
		this.#observers.push(lambda);
	}
	
	/**
	 * Will run a function once, as soon as the predicate becomes true.
	 *
	 * Make sure to keep in mind that this could run as soon as the game is loaded
	 *
	 * @param {(Type) => boolean} predicate
	 * @param {(Type) => void} lambda
	 */
	onTrigger(predicate, lambda) {
		if (predicate(this.value)) {
			lambda(this.value);
			return;
		}
		this.#triggers.push({predicate: predicate, then: lambda});
	}
	
	toJSON() {
		return this.#value;
	}
	
	/**
	 * @template R
	 * @param {(arg: Type) => R} compute
	 * @param {R} [_typeInference]
	 * @return ObservableValue<R>
	 */
	newComputed(compute, _typeInference) {
		const result = new ObservableValue(undefined);
		this.onChange(value => result.value = compute(value));
		return result;
	}
	
	/**
	 * @param {ObservableValue[]} observables
	 * @param {function} lambda
	 */
	static onAnyChange(observables, lambda) {
		for (const observable of observables) {
			observable.#observers.push(lambda);
		}
		lambda();
	}

	/**
	 * @template A
	 * @template B
	 * @template C
	 * @template D
	 * @template Result
	 * @param {[ObservableValue<A>] | [ObservableValue<A>, ObservableValue<B>] | [ObservableValue<A>, ObservableValue<B>, ObservableValue<C>] | [ObservableValue<A>, ObservableValue<B>, ObservableValue<C>, ObservableValue<D>, ...ObservableValue<any>]} observables
	 * @param {(a: A, b: B, c: C, d: D, ...z: any) => Result} compute
	 * @param {Result} [_typeInference]
	 * @return {ObservableValue<Result>}
	 */
	static computed(observables, compute, _typeInference) {
		const result = ObservableValue.new(compute(...observables.map(o => o.value)));
		for (const observable of observables) {
			observable.onChangeDelayed(() => {result.value = compute(...observables.map(o => o.value))});
		}
		return result;
	}
}

/**
 * @extends {ObservableValue<boolean>}
 */
class ObservableBoolean extends ObservableValue {
	/** @type {(() => void)[]} */
	#onTrue;
	/** @type {(() => void)[]} */
	#onFalse;
	
	/**
	 * @param {boolean} value
	 * @param {(()=>void|any)[]} onTrue
	 * @param {(()=>void|any)[]} onFalse
	 */
	constructor(value, onTrue = [], onFalse = []) {
		// noinspection JSCheckFunctionSignatures
		super(value);
		this.#onTrue = onTrue;
		this.#onFalse = onFalse;
		this.onChange(isTrue => {
			for (const lambda of isTrue ? this.#onTrue : this.#onFalse) {
				lambda();
			}
		});
	}
	
	/**
	 * @param {() => void} lambda
	 */
	onTrue(lambda) {
		this.#onTrue.push(lambda);
		if (this.isTrue) lambda();
	}
	
	/**
	 * @param {() => void} lambda
	 */
	onFalse(lambda) {
		this.#onFalse.push(lambda);
		if (!this.isTrue) lambda();
	}
	
	get isTrue() {
		return this.value;
	}
	
	get isFalse() {
		return !this.value;
	}
	
	toggle() {this.value = !this.value;}
}

/**
 * @template Type
 * @param {ObservableValue<any>[]} used
 * @param {() => Type} compute
 * @param {((value: Type) => void) | ((value: Type) => void)[]} [observers]
 * @returns {ObservableValue<Type>}
 */
function computed(used, compute, observers) {
	const result = new ObservableValue(compute(), observers);
	for (const observable of used) {
		observable.onChangeDelayed(() => {result.value = compute();});
	}
	return result;
}

/**
 * @template Type
 * @param {() => Type} provider
 * @param {number} interval
 * @param {((value: Type) => void) | ((value: Type) => void)[]} [observers]
 * @return {ObservableValue<Type>}
 */
function spy(interval, provider, observers) {
	const result = new ObservableValue(provider(), observers);
	setInterval(() => {result.value = provider();}, interval);
	return result;
}

const data = (() => {
	const loaded = JSON.parse(localStorage.getItem('universalPaperclips')) ?? {};
	return {
		mute: new ObservableBoolean(init(loaded.mute, false)),
		clips: ObservableValue.new(init(loaded.clips, 0), [
			updateElement('#clipCountCrunched', value => spellf(Math.round(value))),
			updateElement('#clips', value => addBreaksAtComma(formatClips(Math.ceil(value)))),
		]),
		wireBuyerStatus: new ObservableBoolean(init(loaded.wireBuyerStatus, true)),
		operationsNormalizer: init(loaded.operationsNormalizer, 0),
		observeQuantum: new ObservableBoolean(init(loaded.observeQuantum, true)),
		investmentInterestCountdown: init(loaded.investmentInterestCountdown, 60),
		clipperBoost: ObservableValue.new(init(loaded.clipperBoost, 1)),
		megaClipperLevel: ObservableValue.new(init(loaded.megaClipperLevel, 0), updateElement('#megaClipperLevel')),
		megaClipperBoost: ObservableValue.new(init(loaded.megaClipperBoost, 1)),
		unsoldClips: ObservableValue.new(init(loaded.unsoldClips, 0), updateElement('#unsoldClips', formatWithCommas)),
		harvesterAmountSelected: ObservableValue.new(init(loaded.harvesterAmountSelected, 1)),
		wireDroneAmountSelected: ObservableValue.new(init(loaded.wireDroneAmountSelected, 1)),
		farmAmountSelected: ObservableValue.new(init(loaded.farmAmountSelected, 1)),
		batteryAmountSelected: ObservableValue.new(init(loaded.batteryAmountSelected, 1)),
		maxDrones: ObservableValue.new(init(loaded.maxDrones, 0)),
		maxFactories: ObservableValue.new(init(loaded.maxFactories, 0)),
		compFlag: ObservableValue.new(init(loaded.compFlag, false)),
		projectsFlag: ObservableValue.new(init(loaded.projectsFlag, false)),
		tothFlag: ObservableValue.new(init(loaded.tothFlag, false)),
		givenFundBonus: ObservableValue.new(init(loaded.givenFundBonus, false)),
		lastClickTickStamp: ObservableValue.new(init(loaded.lastClickTickStamp, 0)),
		marginChanged: ObservableValue.new(init(loaded.marginChanged, false)),
		investLevel: ObservableValue.new(init(loaded.investLevel, 1), updateElement('#investmentLevel')),
		wonEveryStrategicModelling: ObservableValue.new(init(loaded.wonEveryStrategicModelling, true)),
		winStreak: ObservableValue.new(init(loaded.winStreak, 0)),
		usedQuantum: ObservableValue.new(init(loaded.usedQuantum, false)),
		startedTeardown: ObservableValue.new(init(loaded.startedTeardown, false)),
	};
	
	/**
	 * @template T
	 * @param {NoInfer<T>} loaded
	 * @param {T} def
	 * @return {T}
	 */
	function init(loaded, def) {
		return loaded ?? def;
	}
})();

function saveData() {
	saveObject('universalPaperclips', data);
}

/**
 * @param {string} id
 * @param {{[k: string]: any}} object
 */
function saveObject(id, object) {
	for (const key in object) {
		let value = object[key];
		if (value == null || (typeof value.toJSON === 'function' && value.toJSON() == null)) {
			throw new Error('null values can not be saved: ' + key + ': ' + value);
		}
	}
	localStorage.setItem(id, JSON.stringify(object));
}

/**
 * @template T
 * @param {string} selector
 * @param {(value: *) => string} [formatter]
 * @param {keyof HTMLElement} update
 * @returns {(function(T): void)}
 */
function updateElement(selector, formatter = undefined, update = 'innerHTML') {
	const element = document.querySelector(selector);
	if (element === null) throw new Error('Element not found: ' + selector);
	if (formatter === undefined) {
		return value => element[update] = value;
	}
	return value => element[update] = formatter(value);
}

function updateFieldset(selector) {
	const element = document.querySelector(selector);
	if (element == null) throw new Error('Element not found: ' + selector);
	return value => {
		const input = element.querySelector(`input[value="${value}"]`);
		if (input == null) throw new Error('Input not found with value ' + value);
		input.checked = true;
	};
}

/**
 * @param {string} selector
 * @param {(any) => boolean} predicate
 * @returns {function(*): void}
 */
function enableButton(selector, predicate) {
	const element = document.querySelector(selector);
	if (element === undefined) throw new Error('Element not found: ' + selector);
	return value => {
		const disabled = !predicate(value);
		element.disabled = disabled;
		if (disabled) element.classList.remove('enter');
	};
}

const megaClipperCost = data.megaClipperLevel.newComputed(value => value < 1 ? 500 : Math.pow(1.07, value) * 1000)
                            .onChange(updateElement('#megaClipperCost', value => formatWithCommas(value, 2)));
data.wireBuyerStatus.onChange(updateElement('#wireBuyerStatus', value => value ? 'ON' : 'OFF'));
let isSetUp = false;
data.mute.onChange(value => {
	document.querySelector('#mute img').src = value ? 'assets/mute.svg' : 'assets/unmute.svg';
	if (isSetUp && !value) {
		buttonSound.play();
	}
});
isSetUp = true;