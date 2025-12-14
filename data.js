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
	#isComputed = false;
	
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
		if (this.#isComputed) throw new Error('Computed values are read only');
		this.#setValue(value);
	}
	
	/**
	 * @param {Type} value
	 */
	#setValue(value) {
		if (this.#value === value) return;
		this.#value = value;
		this.changedContents();
	}
	
	changedContents() {
		for (const lambda of this.#observers) {
			lambda(this.#value);
		}
		for (let i = this.#triggers.length - 1; i >= 0; i--) {
			let trigger = this.#triggers[i];
			if (trigger.predicate(this.#value)) {
				trigger.then(this.#value);
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
		if (this.#isComputed) {
			return undefined;
		} else {
			return this.#value;
		}
	}
	
	/**
	 * @template A
	 * @template B
	 * @template C
	 * @template D
	 * @template Result
	 * @param {[ObservableValue<A>] | [ObservableValue<A>, ObservableValue<B>] | [ObservableValue<A>, ObservableValue<B>, ObservableValue<C>] | [ObservableValue<A>, ObservableValue<B>, ObservableValue<C>, ObservableValue<D>, ...ObservableValue<any>]} observables
	 * @param {(a: A, b: B, c: C, d: D, ...z: any) => Result} lambda
	 */
	static onAnyChange(observables, lambda) {
		for (const observable of observables) {
			observable.#observers.push(() => lambda(...observables.map(o => o.value)));
		}
		lambda(...observables.map(o => o.value));
	}
	
	/**
	 * @template A
	 * @template B
	 * @template C
	 * @template D
	 * @template Result
	 * @param {[ObservableValue<A>] | [ObservableValue<A>, ObservableValue<B>] | [ObservableValue<A>, ObservableValue<B>, ObservableValue<C>] | [ObservableValue<A>, ObservableValue<B>, ObservableValue<C>, ObservableValue<D>, ...ObservableValue<any>]} observables
	 * @param {(a: A, b: B, c: C, d: D, ...z: any) => NoInfer<Result>} compute
	 * @param {Result} [_typeInference]
	 * @return {ObservableValue<Result>}
	 */
	static computed(observables, compute, _typeInference) {
		const result = ObservableValue.new(compute(...observables.map(o => o.value)));
		result.#isComputed = true;
		for (const observable of observables) {
			observable.onChangeDelayed(() => {
				result.#setValue(compute(...observables.map(o => o.value)));
			});
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
	const data = {
		mute: new ObservableBoolean(init(loaded.mute, false)),
		clips: ObservableValue.new(init(loaded.clips, 0), [
			updateElement('#clipCountCrunched', value => spellf(Math.round(value))),
			updateElement('#clips', value => addBreaksAtComma(formatClips(Math.ceil(value)))),
		]),
		bribe: ObservableValue.new(init(loaded.bribe, 1_000_000)),
		wireBuyerStatus: new ObservableBoolean(init(loaded.wireBuyerStatus, true)),
		operationsNormalizer: init(loaded.operationsNormalizer, 0),
		observeQuantum: new ObservableBoolean(init(loaded.observeQuantum, true)),
		investmentInterestCountdown: ObservableValue.new(init(loaded.investmentInterestCountdown, 60)),
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
		wonEveryStrategicModelling: ObservableValue.new(init(loaded.wonEveryStrategicModelling, true)),
		winStreak: ObservableValue.new(init(loaded.winStreak, 0)),
		startedTeardown: ObservableValue.new(init(loaded.startedTeardown, false)),
		loaned: ObservableValue.new(init(loaded.loaned, 0)),
		investmentEngineFlag: ObservableValue.new(init(loaded.investmentEngineFlag, false)),
		advancementTracking: loadSection(loaded.advancementTracking, advancementTracking => ({
			usedQuantum: ObservableValue.new(init(advancementTracking.usedQuantum, false)),
		})),
		stocks: loadSection(loaded.stocks, stocks => ({
			investLevel: ObservableValue.new(init(stocks.investLevel, 1), updateElement('#investmentLevel')),
			list: ObservableValue.new(init(stocks.list, castArray([], {
				symbol: '',
				price: 0,
				amount: 0,
				total: 0,
				profit: 0,
				riskiness: 0,
			}))),
			maxPortfolio: ObservableValue.new(init(stocks.maxPortfolio, 3)),
			bankroll: ObservableValue.new(init(stocks.bankroll, 0)),
			secTotal: ObservableValue.new(init(stocks.secTotal, 0)),
			stockGainThreshold: ObservableValue.new(init(stocks.stockGainThreshold, 0.5)),
			investUpgradeCost: ObservableValue.new(init(stocks.investUpgradeCost, 100)),
			sellDelay: ObservableValue.new(init(stocks.sellDelay, 0)),
			ledger: ObservableValue.new(init(stocks.ledger, 0)),
			riskiness: ObservableValue.new(init(stocks.riskiness, 10)),
		})),
	};
	data.stocks.portfolioTotal = ObservableValue.computed([data.stocks.bankroll, data.stocks.secTotal], (bankroll, secTotal) => bankroll + secTotal, 0);
	return data;
	
	/**
	 * @template T
	 * @param {NoInfer<T>} loaded
	 * @param {T} def
	 * @return {T}
	 */
	function init(loaded, def) {
		return loaded ?? def;
	}
	
	/**
	 * @template T
	 * @param {*} value
	 * @param {T} _inferType
	 * @return {T}
	 */
	function cast(value, _inferType) {
		return value;
	}
	
	/**
	 * @template T
	 * @param {*} value
	 * @param {T} _inferType
	 * @return {T[]}
	 */
	function castArray(value, _inferType) {
		return value;
	}
	
	/**
	 * @Template T
	 * @param {Object} loaded
	 * @param {(Object) => T} fn
	 * @return {T}
	 */
	function loadSection(loaded, fn) {
		return fn(loaded ?? {});
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
	localStorage.setItem(id, JSON.stringify(object));
}

/**
 * @template T
 * @param {string} selector
 * @param {(value: *) => string} [formatter]
 * @param {keyof HTMLElement | 'value'} update
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

const megaClipperCost = ObservableValue.computed([data.megaClipperLevel], (value) => {
	if (value < 1) {
		return 500;
	} else {
		return Math.pow(1.07, value) * 1000;
	}
}, 0).onChange(updateElement('#megaClipperCost', value => formatWithCommas(value, 2)));
data.wireBuyerStatus.onChange(updateElement('#wireBuyerStatus', value => value ? 'ON' : 'OFF'));
let isSetUp = false;
data.mute.onChange(value => {
	document.querySelector('#mute img').src = value ? 'assets/mute.svg' : 'assets/unmute.svg';
	if (isSetUp && !value) {
		buttonSound.play();
	}
});
isSetUp = true;
