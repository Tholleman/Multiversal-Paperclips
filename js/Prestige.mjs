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
		})),
		/** @type {ObservableValue<'' | 'noPrestige' | 'night'>} */
		challengeRun: ObservableValue.new(initEnum(loaded.challengeRun, ['', 'noPrestige', 'night'])),
		longestWinStreak: ObservableValue.new(init(loaded.longestWinStreak, 0)),
		fastestWin: ObservableValue.new(init(loaded.fastestWin, -1)),
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
manageButton(advancements.unlocks.trading, '#prestigiousUpgradeTrading');
manageButton(advancements.unlocks.winner, '#prestigiousUpgradeWinner');
manageButton(advancements.unlocks.noPrestige, '#prestigiousUpgradeNoPrestige');
manageButton(advancements.unlocks.nightRun, '#prestigiousUpgradeNightRun');
manageButton(advancements.unlocks.noQuantum, '#prestigiousUpgradeNoQuantum');
manageButton(advancements.unlocks.againstTheOdds, '#prestigiousUpgradeAgainstTheOdds');
manageButton(advancements.unlocks.speedRun, '#prestigiousUpgradeSpeedrun');
if (advancements.unlocks.againstTheOdds.value === 'LOCKED') {
	ObservableValue.onAnyChange([drifterCount$, probeCount$], () => {
		if (advancements.unlocks.againstTheOdds.value !== 'LOCKED') return;
		if (drifterCount$.value - probeCount$.value > 100) {
			advancements.unlocks.againstTheOdds.value = 'UNLOCKED';
		}
	});
}

export function finalAdvancementChecks() {
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
	unlock(advancements.unlocks.noPrestige, advancements.challengeRun.value === 'noPrestige');
	
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
	if (prestigeS > 0 && prestigeU.value > 0 && prestigeY > 0) {
		getElement('#prestigiousUpgradeExplanation').style.display = 'none';
		unlockElement('#prestigiousUpgrade');
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
		}
	}
}
