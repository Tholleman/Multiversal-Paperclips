import {getElement, unlockElement} from './view.mjs';
import {terminal} from './Terminal.mjs';

export const advancements = (() => {
	const loaded = JSON.parse(localStorage.getItem('MultiversalPaperclipsAdvancements')) ?? {};
	return {
		unlocks: loadSection(loaded.unlocks, unlocks => ({
			original: ObservableValue.new(advancementStatus(unlocks.original)),
			beg: ObservableValue.new(advancementStatus(unlocks.beg)),
			afk: ObservableValue.new(advancementStatus(unlocks.afk)),
			unchanged: ObservableValue.new(advancementStatus(unlocks.unchanged)),
			trading: ObservableValue.new(advancementStatus(unlocks.trading)),
			winner: ObservableValue.new(advancementStatus(unlocks.winner)),
			noPrestige: ObservableValue.new(advancementStatus(unlocks.noPrestige)),
			nightRun: ObservableValue.new(advancementStatus(unlocks.nightRun)),
			noQuantum: ObservableValue.new(advancementStatus(unlocks.noQuantum)),
			againstTheOdds: ObservableValue.new(advancementStatus(unlocks.againstTheOdds)),
			speedRun: ObservableValue.new(advancementStatus(unlocks.speedRun)),
			negativeYomi: ObservableValue.new(advancementStatus(unlocks.negativeYomi)),
		})),
		/** @type {ObservableValue<'' | 'noPrestige' | 'night'>} */
		challengeRun: ObservableValue.new(initEnum(loaded.challengeRun, ['', 'noPrestige', 'night'])),
		longestWinStreak: ObservableValue.new(init(loaded.longestWinStreak, 0)),
		fastestWin: ObservableValue.new(init(loaded.fastestWin, -1)),
		prestigeCounter: ObservableValue.new(init(loaded.prestigeCounter, 0)),
	};
	
	/**
	 * @param loaded
	 * @return {'LOCKED' | 'UNLOCKED' | 'ACTIVE'}
	 */
	function advancementStatus(loaded) {
		return initEnum(loaded, ['LOCKED', 'UNLOCKED', 'ACTIVE']);
	}
})();

export function saveAdvancements() {
	saveObject('MultiversalPaperclipsAdvancements', advancements);
}

/** @type {Map<any, HTMLButtonElement>} */
const advancementToElement = new Map();

manageButton(advancements.unlocks.original, '#prestigiousUpgradeClickLink');
advancements.unlocks.original.onChange(value => {
	getElement('#accentSelector').style.display = value === 'ACTIVE' ? '' : 'none';
});
manageButton(advancements.unlocks.beg, '#prestigiousUpgradeBeg');
advancements.unlocks.beg.onChange(status => {
	if (status !== 'ACTIVE') return;
	if (data.givenFundBonus.value) return;
	if (!humanFlag.value) return;
	data.givenFundBonus.value = true;
	funds.value += 500;
	terminal.print('$ 500 starting capital has been granted');
});
manageButton(advancements.unlocks.afk, '#prestigiousUpgradeAFK');
advancements.unlocks.afk.onChange(status => {
	if (status === 'LOCKED') {
		document.body.addEventListener('click', trackClicks);
	} else {
		document.body.removeEventListener('click', trackClicks);
	}
	
	function trackClicks() {
		if (advancements.unlocks.afk.value !== 'LOCKED') return;
		const lastClick = data.lastClickTickStamp.value;
		const durationInSeconds = (ticks - lastClick) / 100;
		if (durationInSeconds > 3600) {
			advancements.unlocks.afk.value = 'UNLOCKED';
		} else {
			data.lastClickTickStamp.value = ticks;
		}
	}
});
manageButton(advancements.unlocks.unchanged, '#prestigiousUpgradeUnchanged');
advancements.unlocks.unchanged.onChange(value => {
	data.allowAutoPriceAdjust.value = value === 'ACTIVE';
});
manageButton(advancements.unlocks.trading, '#prestigiousUpgradeTrading');
manageButton(advancements.unlocks.winner, '#prestigiousUpgradeWinner');
manageButton(advancements.unlocks.noPrestige, '#prestigiousUpgradeNoPrestige');
manageButton(advancements.unlocks.nightRun, '#prestigiousUpgradeNightRun');
if (advancements.challengeRun.value === 'night') {
	unlockElement('#dayNightEfficiencyContainer');
}
if (advancements.unlocks.nightRun.value === 'ACTIVE') {
	cheatProject('momentum');
}
manageButton(advancements.unlocks.noQuantum, '#prestigiousUpgradeNoQuantum');
manageButton(advancements.unlocks.againstTheOdds, '#prestigiousUpgradeAgainstTheOdds');
if (advancements.unlocks.againstTheOdds.value === 'LOCKED') {
	ObservableValue.onAnyChange([drifterCount$, probeCount$], () => {
		if (advancements.unlocks.againstTheOdds.value !== 'LOCKED') return;
		if (drifterCount$.value - probeCount$.value > 100) {
			advancements.unlocks.againstTheOdds.value = 'UNLOCKED';
		}
	});
}
manageButton(advancements.unlocks.speedRun, '#prestigiousUpgradeSpeedrun');
manageButton(advancements.unlocks.negativeYomi, '#prestigiousNegativeYomi');
if (advancements.unlocks.negativeYomi.value === 'LOCKED') {
	yomi.onTrigger(yomi => yomi <= 32000, () => {
		if (advancements.unlocks.negativeYomi.value === 'LOCKED') {
			advancements.unlocks.negativeYomi.value = 'UNLOCKED';
		}
	});
}
advancements.unlocks.negativeYomi.onTrigger(negativeYomi => negativeYomi === 'ACTIVE', () => {
	cheatProject('avoidNegativeCells');
});

export function finalAdvancementChecks() {
	unlock(advancements.unlocks.beg, data.begForWireCount.value >= 3);
	unlock(advancements.unlocks.unchanged, !data.marginChanged.value);
	unlock(advancements.unlocks.trading, data.stocks.investLevel.value >= 20);
	unlock(advancements.unlocks.winner, data.wonEveryStrategicModelling.value);
	unlock(advancements.unlocks.noQuantum, !data.advancementTracking.usedQuantum.value);
	unlock(advancements.unlocks.speedRun, ticks / 100 < 30 * 60);
	if (advancements.fastestWin.value <= 0) {
		advancements.fastestWin.value = ticks;
	} else {
		advancements.fastestWin.value = Math.min(advancements.fastestWin.value, ticks);
	}
	unlock(advancements.unlocks.nightRun, advancements.challengeRun.value === 'night');
	if (advancements.unlocks.nightRun.value !== 'LOCKED') {
		getElement('#nightRunButton').remove();
	}
	unlock(advancements.unlocks.noPrestige, advancements.challengeRun.value === 'noPrestige');
	if (advancements.unlocks.noPrestige.value !== 'ACTIVE' && (prestigeS.value + prestigeU.value + prestigeY.value) < 9) {
		const buttons = document.querySelectorAll('#challengeRun button');
		for (let button of buttons) {
			button.disabled = true;
		}
	} else {
		if (advancements.unlocks.noPrestige.value !== 'LOCKED') {
			getElement('#noPrestigeButton').remove();
		}
	}
	
	/**
	 * @param {ObservableValue<'LOCKED' | 'UNLOCKED' | 'ACTIVE'>} advancement
	 * @param {boolean} when
	 */
	function unlock(advancement, when) {
		if (advancement.value !== 'LOCKED') return;
		if (!when) return;
		advancement.value = 'UNLOCKED';
	}
}

/**
 * @param {ObservableValue<'LOCKED' | 'UNLOCKED' | 'ACTIVE'>} subject
 * @param {string} selector
 */
function manageButton(subject, selector) {
	const btn = getElement(selector);
	advancementToElement.set(subject, btn);
	subject.onChange(status => {
		btn.disabled = status === 'LOCKED';
		if (status !== 'LOCKED') {
			btn.style.display = '';
		}
		if (status === 'ACTIVE') {
			btn.remove();
		}
	});
	btn.addEventListener('click', () => {
		subject.value = 'ACTIVE';
		saveAdvancements();
	});
}

export function showPrestigiousUpgrades() {
	if ((prestigeS.value > 0 && prestigeU.value > 0 && prestigeY.value > 0)
	    || advancements.unlocks.noPrestige.value === 'ACTIVE'
	    || advancements.challengeRun.value === 'noPrestige') {
		getElement('#prestigiousUpgradeExplanation').style.display = 'none';
		unlockElement('#prestigiousUpgrade');
		unlockElement('#challengeRun');
	} else {
		let anyUnlocked = false;
		for (let key in advancements.unlocks) {
			if (advancements.unlocks[key].value === 'UNLOCKED') {
				anyUnlocked = true;
			} else {
				advancementToElement.get(advancements.unlocks[key]).style.display = 'none';
			}
		}
		if (anyUnlocked) {
			unlockElement('#prestigiousUpgrade');
			unlockElement('#challengeRun');
		}
	}
}

export function startNoPrestigeRun() {
	advancements.challengeRun.value = 'noPrestige';
	advancements.prestigeCounter = 1 + prestigeS.value + prestigeU.value + prestigeY.value;
	prestigeS.value = 0;
	prestigeU.value = 0;
	prestigeY.value = 0;
	save();
	reset();
}

export function startNightRun() {
	advancements.challengeRun.value = 'night';
	save();
	reset();
}

export function finishRun() {
	save();
	reset();
}

export function unlockNoPrestigeRun() {
	getElement('#projectsDiv').style.display = 'none';
	unlockElement('#resetBonuses');
}

const resetBonusAssignedEl = getElement('#resetBonusAssigned');
const resetBonusTotalEl = getElement('#resetBonusTotal');
ObservableValue.computed([totalPrestigeBonuses, advancements.prestigeCounter], (assigned, unassigned) => assigned + unassigned)
               .onChange(value => resetBonusTotalEl.innerText = `${value + 3}`);
totalPrestigeBonuses.onChange(value => resetBonusAssignedEl.innerText = `${value + 3}`);

/**
 * @param {ObservableValue} observable
 * @param {{dec: string, inc: string, label: string}} selectors
 */
function managePrestigeControls(observable, selectors) {
	const dec = getElement(selectors.dec);
	const inc = getElement(selectors.inc);
	const label = getElement(selectors.label);
	advancements.prestigeCounter.onChange(value => {
		inc.disabled = value <= 0;
	});
	observable.onChange(value => {
		dec.disabled = value <= 0;
		label.innerText = `${value + 1}`;
	});
	inc.addEventListener('click', () => {
		observable.value++;
		advancements.prestigeCounter.value--;
	});
	dec.addEventListener('click', () => {
		observable.value--;
		advancements.prestigeCounter.value++;
	});
}

managePrestigeControls(prestigeU, {
	dec: '#prestigeUDec',
	inc: '#prestigeUInc',
	label: '#prestigeURespec',
});
managePrestigeControls(prestigeS, {
	dec: '#prestigeSDec',
	inc: '#prestigeSInc',
	label: '#prestigeSRespec',
});
managePrestigeControls(prestigeY, {
	dec: '#prestigeYDec',
	inc: '#prestigeYInc',
	label: '#prestigeYRespec',
});
