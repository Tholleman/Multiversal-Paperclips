import {getElement, unlockElement, withElement} from './view.mjs';
import {advancements} from './Prestige.mjs';

const unusedClipsSpy = spy(10, () => unusedClips);

data.tothFlag.onChange(value => {
	tothDivElement.style.display = value ? '' : 'none';
});

ObservableValue.onAnyChange([harvesterLevel, wireDroneLevel], () => {
	data.maxDrones.value = Math.max(data.maxDrones.value, harvesterLevel.value + wireDroneLevel.value);
});
data.maxDrones.onChange(withElement('#droneUpgradeDisplay', withElement('#nextDroneUpgrade', (nextEl, nextContainer, max) => {
	let nextDroneUp = undefined;
	if (max < 500) {
		nextDroneUp = 500;
	} else if (max < 5000) {
		nextDroneUp = 5000;
	} else if (max < 50000) {
		nextDroneUp = 50000;
	} else {
		nextContainer.style.display = 'none';
		return;
	}
	nextEl.innerText = formatWithCommas(nextDroneUp);
})));

class Resource {
	/** @type {ObservableValue<number>} */
	#amount;
	/** @type {ObservableValue<number>} */
	#cost;
	#saveData;
	
	/**
	 * @param {{
	 * 	current: ObservableValue<number>,
	 * 	amount: ObservableValue<number>,
	 * 	bill: ObservableValue<number>,
	 * }} saveData
	 * @param {{
	 * 	startingCost: number,
	 *  growthRate: number,
	 *  multiplier: number,
	 * }} settings
	 * @param {{
	 * 	cost: string,
	 *  action: string,
	 * 	actionBtn: string,
	 *  incBtn: string,
	 *  decBtn: string,
	 *  disBtn: string,
	 * }} selectors
	 * @param {{
	 * 	disassemble: string,
	 * 	singular: string,
	 * 	plural: string
	 * }} text
	 */
	constructor(saveData, settings, selectors, text) {
		this.#saveData = saveData;
		this.#cost = ObservableValue.computed([saveData.current, saveData.amount], (currentAmount, toAdd) => {
			if (toAdd === 0) {
				return -saveData.bill.value;
			}
			let sum = currentAmount === 0 ? settings.startingCost : Math.pow(currentAmount + 1, settings.growthRate) * settings.multiplier;
			const end = toAdd + currentAmount;
			let calculatedAmount = currentAmount + 1;
			while (calculatedAmount < end) {
				sum += Math.pow(++calculatedAmount, settings.growthRate) * settings.multiplier;
			}
			return sum;
		}, 0).onChange(
			withElement(selectors.cost, (costEl, value) => {
				if (value <= 0) {
					costEl.innerText = `+${spellf(-value)}`;
					return;
				}
				costEl.innerText = spellf(value);
			}),
		);
		this.#amount = ObservableValue.computed([saveData.current, saveData.amount],
		                                        (currentAmount, toAdd) => {
			                                        if (toAdd === 0) {
				                                        return -currentAmount;
			                                        } else {
				                                        return toAdd;
			                                        }
		                                        });
		ObservableValue.onAnyChange([saveData.amount], withElement(selectors.action, label => {
			switch (saveData.amount.value) {
				case 0:
					label.innerText = text.disassemble;
					break;
				case 1:
					label.innerText = text.singular;
					break;
				default:
					label.innerText = `+${formatWithCommas(saveData.amount.value)} ${text.plural}`;
			}
		}));
		ObservableValue.onAnyChange([unusedClipsSpy, this.#cost, saveData.amount, saveData.current], withElement(selectors.actionBtn, btn => {
			if (saveData.amount.value === 0) {
				btn.disabled = saveData.current.value === 0;
			} else {
				btn.disabled = unusedClipsSpy.value < this.#cost.value;
			}
		}));
		ObservableValue.onAnyChange([saveData.amount, saveData.current], withElement(selectors.incBtn, btn => {
			btn.disabled = saveData.amount.value >= Math.max(saveData.current.value * 100, 1000);
		}));
		saveData.amount.onChange(withElement(selectors.decBtn, (btn, value) => btn.disabled = value <= 1));
		saveData.current.onChange(withElement(selectors.disBtn, (btn, value) => btn.disabled = value === 0));
	}
	
	increase() {
		if (this.#saveData.amount.value <= 0) {
			this.#saveData.amount.value = 1;
			return;
		}
		if (this.#saveData.amount.value >= Math.max(this.#saveData.current.value * 100, 1000)) {
			return;
		}
		this.#saveData.amount.value = Math.pow(10, Math.floor(Math.log10(this.#saveData.amount.value)) + 1);
	}
	
	decrease() {
		if (this.#saveData.amount.value < 1) {
			this.#saveData.amount.value = 1;
			return;
		}
		this.#saveData.amount.value = Math.pow(10, Math.floor(Math.log10(this.#saveData.amount.value - 1)));
	}
	
	round() {
		const goal = Math.max(10, Math.pow(10, Math.floor(Math.log10(this.#saveData.amount.value)) + 1));
		this.#saveData.amount.value = goal - this.#saveData.current.value % goal;
	}
	
	make() {
		if (this.#cost.value > unusedClips) {
			console.warn(`Requires ${this.#cost.value} clips`);
			return;
		}
		
		unusedClips -= this.#cost.value;
		this.#saveData.bill.value += this.#cost.value;
		this.#saveData.current.value += this.#amount.value;
		
		if (this.#saveData.amount.value === 0) {
			this.#saveData.amount.value = 1;
		} else if (Math.pow(10, Math.floor(Math.log10(this.#amount.value))) !== this.#amount.value) {
			this.increase();
		}
		
		unusedClipsDisplayElement.innerHTML = spellf(unusedClips);
	}
}

const harvesters = new Resource(
	{current: harvesterLevel, amount: data.harvesterAmountSelected, bill: harvesterBill},
	{startingCost: 1_000_000, growthRate: 2.25, multiplier: 1_000_000},
	{
		cost: '#harvesterCostDisplay',
		action: '#harvesterCostLabel',
		actionBtn: '#btnMakeHarvester',
		incBtn: '#incHarvesterAmount',
		decBtn: '#decHarvesterAmount',
		disBtn: '#resetHarvesterAmount',
	},
	{
		disassemble: 'Disassemble all Harvester Drones',
		singular: 'Harvester Drone',
		plural: 'Harvester Drones',
	},
);

export function incHarvesterAmount() { harvesters.increase(); }

export function decHarvesterAmount() { harvesters.decrease(); }

export function roundHarvesterAmount() { harvesters.round(); }

export function makeHarvester() { harvesters.make(); }

const wireDrones = new Resource(
	{current: wireDroneLevel, amount: data.wireDroneAmountSelected, bill: wireDroneBill},
	{startingCost: 1_000_000, growthRate: 2.25, multiplier: 1_000_000},
	{
		cost: '#wireDroneCostDisplay',
		action: '#wireDroneCostLabel',
		actionBtn: '#btnMakeWireDrone',
		incBtn: '#incWireDroneAmount',
		decBtn: '#decWireDroneAmount',
		disBtn: '#resetWireDroneAmount',
	},
	{
		disassemble: 'Disassemble all Wire Drone',
		singular: 'Wire Drone',
		plural: 'Wire Drones',
	},
);

export function incWireDroneAmount() { wireDrones.increase(); }

export function decWireDroneAmount() { wireDrones.decrease(); }

export function roundWireDroneAmount() { wireDrones.round(); }

export function makeWireDrone() { wireDrones.make(); }

const farms = new Resource(
	{current: farmLevel, amount: data.farmAmountSelected, bill: farmBill},
	{startingCost: 10_000_000, growthRate: 2.78, multiplier: 100_000_000},
	{
		cost: '#farmCostDisplay',
		action: '#farmActionLabel',
		actionBtn: '#btnMakeFarm',
		incBtn: '#incFarmAmount',
		decBtn: '#decFarmAmount',
		disBtn: '#resetFarmAmount',
	},
	{
		disassemble: 'Disassemble all Solar Farms',
		singular: 'Solar Farm',
		plural: 'Solar Farms',
	},
);

export function incFarmAmount() { farms.increase(); }

export function decFarmAmount() { farms.decrease(); }

export function roundFarmAmount() { farms.round(); }

export function makeFarm() { farms.make(); }

const batteries = new Resource(
	{current: batteryLevel, amount: data.batteryAmountSelected, bill: batteryBill},
	{startingCost: 1_000_000, growthRate: 2.54, multiplier: 100_000_000},
	{
		cost: '#batteryCostDisplay',
		action: '#batteryActionLabel',
		actionBtn: '#btnMakeBattery',
		incBtn: '#incBatteryAmount',
		decBtn: '#decBatteryAmount',
		disBtn: '#resetBatteryAmount',
	},
	{
		disassemble: 'Disassemble all Battery Towers',
		singular: 'Battery Tower',
		plural: 'Battery Towers',
	},
);

export function incBatteryAmount() { batteries.increase(); }

export function decBatteryAmount() { batteries.decrease(); }

export function roundBatteryAmount() { batteries.round(); }

export function makeBattery() { batteries.make(); }

advancements.unlocks.afk.onChange(value => {
	if (value !== 'ACTIVE') return;
	unlockElement('#powerSurgeContainer');
});
const storedPower$ = spy(10, () => storedPower);
const powMod$ = spy(1e3, () => powMod);
const powerSurgeMs = ObservableValue.computed([storedPower$],
                                              (storedPower) => storedPower / 1, 0)
                                    .onChange(withElement('#powerSurgeDuration', (el, ms) => {
	                                    el.innerText = timeCruncher(ms / 10);
                                    }));
ObservableValue.onAnyChange([powerSurgeMs, powMod$], withElement('#powerSurge', (el) => {
	el.disabled = powerSurgeMs.value < 1e3 || powMod$.value < 10;
}));

export function powerSurge() {
	if (advancements.unlocks.afk.value !== 'ACTIVE') return;
	if (powMod$.value < 10) return;
	const ms = powerSurgeMs.value;
	storedPower = 0;
	acquireMatter(ms);
	processMatter(ms);
	workFactories(ms);
	powMod -= 10;
}

window.cheatPowerSurge = () => {
	acquireMatter(3600e3);
	processMatter(3600e3);
	workFactories(3600e3);
}

factoryLevel.onChange(value => {
	data.droneManufacturing.maxFactoryLevel.value = Math.max(data.droneManufacturing.maxFactoryLevel.value, value);
});
data.droneManufacturing.maxFactoryLevel.onChange(withElement('#nextFactoryUpgrade', withElement('#factoryUpgradeDisplay', (container, el, value) => {
	let nextFactoryUp = 0;
	if (value < 10) {
		nextFactoryUp = 10;
	} else if (value < 20) {
		nextFactoryUp = 20;
	} else if (value < 50) {
		nextFactoryUp = 50;
	} else {
		container.style.display = 'none';
		return;
	}
	el.innerText = formatWithCommas(nextFactoryUp);
})));
const factoryButton = getElement('#btnMakeFactory');

// updateElement('#factoryRebootToolTip', value => '+' + spellf(value))
ObservableValue.onAnyChange([data.droneManufacturing.factoryAmountSelected, factoryLevel, unusedClipsSpy, factoryCost],
                            (selected, factories, unused, cost, bill) => {
	                            if (selected === 0) {
		                            factoryButton.disabled = factories === 0;
	                            } else {
		                            factoryButton.disabled = unused < cost;
	                            }
                            });
ObservableValue.onAnyChange([data.droneManufacturing.factoryAmountSelected, factoryBill, factoryCost], withElement('#factoryCostDisplay', (el, selected, bill, cost) => {
	if (selected === 0) {
		el.innerText = `+${spellf(bill)}`;
	} else {
		el.innerText = `${spellf(cost)}`;
	}
}));
ObservableValue.onAnyChange([data.droneManufacturing.factoryAmountSelected], withElement('#factoryActionLabel', (label, amount) => {
	if (amount === 0) {
		label.innerText = 'Disassemble All Clip Factories';
	} else {
		label.innerText = 'Clip Factory';
	}
}));

export function factoryAction() {
	if (data.droneManufacturing.factoryAmountSelected.value === 0) {
		factoryReboot();
		return;
	}
	if (unusedClips < factoryCost.value) return;
	unusedClips -= factoryCost.value;
	factoryBill.value += factoryCost.value;
	unusedClipsDisplayElement.innerHTML = spellf(unusedClips);
	factoryLevel.value++;
	let priceMod;
	if (factoryLevel.value < 8) {
		priceMod = 11 - factoryLevel.value;
	} else if (factoryLevel.value < 13) {
		priceMod = 2;
	} else if (factoryLevel.value < 20) {
		priceMod = 1.5;
	} else if (factoryLevel.value < 39) {
		priceMod = 1.25;
	} else if (factoryLevel.value < 79) {
		priceMod = 1.15;
	} else {
		priceMod = 1.10;
	}
	factoryCost.value *= priceMod;
}
