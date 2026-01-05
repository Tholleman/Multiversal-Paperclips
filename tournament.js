"use strict";
let tourneyCost = 1000;
const choiceANames = ["cooperate", "swerve", "macro", "fight", "bet", "raise_price", "opera", "go", "heads", "particle", "discrete", "peace", "search", "lead", "accept", "accept", "attack"];
const choiceBNames = ["defect", "straight", "micro", "back_down", "fold", "lower_price", "football", "stay", "tails", "wave", "continuous", "war", "evaluate", "follow", "reject", "deny", "decay"];
const namesElements = [document.querySelector('#vLabela'), document.querySelector('#vLabelb'), document.querySelector('#hLabela'), document.querySelector('#hLabelb')];
const horizStratElement = document.querySelector('#horizStrat');
const vertStratElement = document.querySelector('#vertStrat');
const stratSelector = document.getElementById('stratSelector');
const tournamentRound = document.getElementById('tournamentRound');

/** @typedef {[[number, number], [number, number]]} scoreChoices */
/** @typedef {[[0|1|2|3, 0|1|2|3],[0|1|2|3, 0|1|2|3]]} preference */
/** @typedef {{name: string, currentScore?:number, preferences?: preference[], pickMove:(scoreChoices, 0|1|undefined)=>undefined|0|1, afterMove?: ()=>void, element ?: HTMLElement}} strategy */

const cells = [
	[document.getElementById("payoffCellAA"), document.getElementById("payoffCellAB")],
	[document.getElementById("payoffCellBA"), document.getElementById("payoffCellBB")]
];
const crossLabels = [
	document.querySelectorAll('.abPayoff'),
	document.querySelectorAll('.baPayoff')]
for (const row of cells) {
	for (const cell of row) {
		cell.addEventListener('animationend', () => cell.classList.remove('picked'));
	}
}
let averageCellValue = 5;
const rerollButton = document.querySelector('#rerollGridButton');
const rerollCost = ObservableValue.new(0, updateElement('#rerollCost', formatWithCommas));
const tourneyInProg = new ObservableBoolean(false,
	[() => btnNewTournamentElement.disabled = true]);
ObservableValue.onAnyChange([tourneyInProg, yomi, rerollCost], () => rerollButton.disabled = !tourneyInProg.isTrue || yomi.value < rerollCost.value);
let pick = -1;
let yomiBoost = 1;
let stratsUnlocked = 1;
/** @type {[[number, number],[number, number]]} */
let payoffGrid;
/** @type {[number, number]} */
let prevMoves = [undefined, undefined];
let stratH, stratV;
let currentRound;
let currentMove;
let nameIndex;
const allowStrategyRerolls = new ObservableBoolean(false,
	[() => document.querySelector('#strategyRerolls').style.display = ''],
	[() => document.querySelector('#strategyRerolls').style.display = 'none']);
const autoTourneyFlag = new ObservableBoolean(false,
	[() => document.querySelector('#btnToggleAutoTourney').style.display = ''],
	[() => document.querySelector('#btnToggleAutoTourney').style.display = 'none']);
const autoTourneyStatus = new ObservableBoolean(false,
	[() => {
		document.querySelector('#autoTourneyStatus').innerText = 'ON';
	}],
	[() => document.querySelector('#autoTourneyStatus').innerText = 'OFF']);
/** @type {strategy[]} */
const allStrats = []; // NOSONAR
const altersTheGrid = [];

/** @type {strategy[]} */
let strats;

function newTourney(startingData = undefined) {
	if (tourneyInProg.isTrue) return;
	if (startingData === undefined) {
		newEmptyTournament();
	} else {
		unmarshallTournament(startingData);
		if (!tourneyInProg.isTrue) {
			rerollCost.value = stratsUnlocked ** 2 * (5 + 2.5 * (prestigeY.value + 1));
			return;
		}
	}
	
	const totalRounds = strats.length ** 2;
	rerollCost.value = totalRounds * (5 + 2.5 * (prestigeY.value + 1));
	tourneyInProg.value = true;
	if (startingData === undefined) {
		save();
	}
	resetStrategySelector();
	createScoreboard();
	startRound();
	
	function newEmptyTournament() {
		if (operations.value < tourneyCost) return;
		operations.value -= tourneyCost; // NOSONAR
		strats = [];
		for (let i = 0; i < stratsUnlocked; i++) {
			const strat = allStrats[i];
			strat.currentScore = 0;
			strats.push(strat);
		}
		if (isCompleted('rerollStrategyGrid') || strats.some(strat => altersTheGrid.includes(strat))) {
			for (let i = strats.length - 1; i >= 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[strats[i], strats[j]] = [strats[j], strats[i]];
			}
		}
		rerollStrategyGrid(strats);
		setChoiceNames(Math.floor(Math.random() * choiceANames.length));
		currentRound = 0;
		currentMove = 0;
	}
	
	function resetStrategySelector() {
		let previousEl = undefined;
		for (let i = 0; i < stratsUnlocked; i++) {
			const elId=`strategy${i}`;
			const labelEl = document.getElementById(elId).nextElementSibling;
			labelEl.innerText = allStrats[i].name;
			const container = labelEl.parentElement;
			if (previousEl != null) {
				previousEl.after(container);
			}
			previousEl = container;
		}
	}
	
	function startRound() {
		if (currentRound >= totalRounds) {
			finish();
			return;
		}
		tournamentRound.innerText = "Round " + (currentRound + 1);
		stratH = strats[Math.floor(currentRound / strats.length)];
		stratV = strats[currentRound % strats.length];
		horizStratElement.innerText = stratH.name;
		vertStratElement.innerText = stratV.name;
		if (currentMove === 0) {
			prevMoves = [undefined, undefined];
		}
		runRound();
	}
	
	function runRound() {
		if (currentMove >= 10) {
			currentMove = 0;
			currentRound++;
			setTimeout(startRound, 100);
			return;
		}
		choice(stratH, stratV);
		if (stratH.afterMove) stratH.afterMove();
		if (stratV.afterMove) stratV.afterMove();
		currentMove++;
		updateScoreboard(stratH, stratV);
		setTimeout(runRound, 100);
	}
	
	/**
	 * @param {strategy} of
	 */
	function updateScoreboard(...of) {
		if (!isCompleted('scoreboard')) return;
		for (const strat of of) {
			if (strat.element) {
				strat.element.innerText = formatWithCommas(strat.currentScore);
			}
		}
	}
	
	/**
	 * @param {strategy} a
	 * @param {strategy} b
	 */
	function choice(a, b) {
		const moveA = a.pickMove(payoffGrid, prevMoves[1]);
		const moveB = b.pickMove(payoffGrid, prevMoves[0]);
		prevMoves = [moveA, moveB];
		if (moveA !== undefined && moveB !== undefined) {
			cells[moveA][moveB].classList.add('picked');
			a.currentScore += payoffGrid[moveA][moveB];
			b.currentScore += payoffGrid[moveB][moveA];
		} else if (moveA !== undefined) {
			cells[moveA][0].classList.add('picked');
			cells[moveA][1].classList.add('picked');
			a.currentScore += payoffGrid[moveA][0] + payoffGrid[moveA][1];
		} else if (moveB !== undefined) {
			cells[0][moveB].classList.add('picked');
			cells[1][moveB].classList.add('picked');
			b.currentScore += payoffGrid[0][moveB] + payoffGrid[1][moveB];
		}
	}
	
	function finish() {
		for (const row of cells) { for (const cell of row) { cell.classList.remove('picked'); } }
		tourneyInProg.value = false;
		const pick = getSelectedStratId();
		const results = strats.toSorted((a, b) => b.currentScore - a.currentScore);
		const donation = strats.includes(stratDonator) ? stratDonator.currentScore : 0;
		if (pick >= 0 && pick < strats.length) {
			const beatBoost = calculateStratsBeaten(results, pick);
			const picked = allStrats[pick];
			const earnings = picked.currentScore * yomiBoost * (beatBoost + 1) + donation;
			yomi.value += earnings; // NOSONAR
			if (milestoneFlag < 15) {
				let donationMessage = '';
				if (donation > 0) {
					donationMessage = 'DONATOR added ' + donation + '. ';
				}
				const w = beatBoost === 1 ? "strat" : "strats";
				displayMessage(`${picked.name} scored ${picked.currentScore} and beat ${beatBoost} ${w}. ${donationMessage}Yomi increased by ${formatWithCommas(earnings)}`);
			}
			if (picked.currentScore >= results[0].currentScore) {
				data.winStreak.value++;
			} else {
				if (data.winStreak.value > 2) {
					displayMessage(`First loss after ${data.winStreak.value} wins`)
				}
				advancements.longestWinStreak.value = Math.max(advancements.longestWinStreak.value, data.winStreak.value)
				data.winStreak.value = 0;
				data.wonEveryStrategicModelling.value = false;
			}
			if (isCompleted('bonusYomi')) {
				bonusYomi(results, pick);
			}
		}
		if (results[0].currentScore <= 0 && stratsUnlocked >= 8) {
			savelyMakeProjectAvailable('avoidNegativeCells');
			if (pick === -1) {
				savelyMakeProjectAvailable('rerollStrategyGrid');
			}
		}
		if (pick === -1 && donation !== 0) {
			displayMessage('DONATOR added ' + donation + ' yomi.');
			yomi.value += donation;
		}
		populateTourneyReport(results);
		save();
	}
	
	function calculateStratsBeaten(results, pick) {
		for (let i = 0; i < results.length; i++) {
			if (results[i].currentScore < allStrats[pick].currentScore) {
				return results.length - i;
			}
		}
		return 0;
	}
	
	function bonusYomi(results, pick) {
		const scoreSet = [results[0].currentScore];
		for (let i = 1; i < results.length; i++) {
			if (scoreSet[scoreSet.length - 1] !== results[i]) {
				scoreSet.push(results[i].currentScore);
			}
		}
		switch (scoreSet.indexOf(allStrats[pick].currentScore) + 1) {
			case 1:
				// noinspection JSUndeclaredVariable
				yomi.value += 50000;
				if (milestoneFlag < 15) {
					displayMessage("Selected strategy won the tournament (or tied for first). +50,000 yomi");
				}
				break;
			case 2:
				// noinspection JSUndeclaredVariable
				yomi.value += 30000;
				if (milestoneFlag < 15) {
					displayMessage("Selected strategy finished in (or tied for) second place. +30,000 yomi");
				}
				break;
			case 3:
				// noinspection JSUndeclaredVariable
				yomi.value += 20000;
				if (milestoneFlag < 15) {
					displayMessage("Selected strategy finished in (or tied for) third place. +20,000 yomi");
				}
				break;
		}
	}
	
	/**
	 * @param {strategy[]} results
	 */
	function populateTourneyReport(results) {
		let previousEl = undefined;
		for (const strategy of results) {
			const elId=`strategy${allStrats.indexOf(strategy)}`;
			const labelEl = document.getElementById(elId).nextElementSibling;
			labelEl.innerHTML = `${strategy.name}: <span class="number">${formatWithCommas(strategy.currentScore)}</span>`;
			const container = labelEl.parentElement;
			if (previousEl != null) {
				previousEl.after(container);
			}
			previousEl = container;
		}
		horizStratElement.innerText = '';
		vertStratElement.innerText = '';
		tournamentRound.innerHTML = '&nbsp;';
		crossLabels[0][1].innerText = '';
		crossLabels[1][0].innerText = '';
	}
}

function buyRerollStrategyGrid() {
	if (yomi.value < rerollCost.value) return;
	yomi.value -= rerollCost.value;
	rerollStrategyGrid();
}

/** @returns {[number, number]} */
function minMaxCellValue() {
	return [
		0 - prestigeY.value * 5,
		10 + prestigeY.value * 5
	]
}
function rerollStrategyGrid(strategies = strats) {
	const [min, max] = minMaxCellValue();
	averageCellValue = 5;
	
	let completelyRandom = Math.random() < 0.5;
	let distribution;
	if (!completelyRandom) {
		distribution = selectDistribution(strategies);
		completelyRandom = distribution.flatMap(i => i).every(v => v === distribution[0][0]);
	}
	if (completelyRandom) {
		payoffGrid = [
			[Math.ceil(randBetween(min, max)), Math.ceil(randBetween(min, max))],
			[Math.ceil(randBetween(min, max)), Math.ceil(randBetween(min, max))]
		];
	} else {
		const values = [
			Math.ceil(randBetween(min, max)),
			Math.ceil(randBetween(min, max)),
			Math.ceil(randBetween(min, max)),
			Math.ceil(randBetween(min, max))
		].sort((a,b) => a - b);
		payoffGrid = [
			[values[distribution[0][0]], values[distribution[0][1]],],
			[values[distribution[1][0]], values[distribution[1][1]],]
		];
	}
	updateGrid();
	
	/**
	 * @param {strategy[]} strategies
	 * @returns {preference}
	 */
	function selectDistribution(strategies) {
		/** @type {preference[]} */
		const preferences = [];
		for (let strategy of strategies) {
			if (strategy.preferences) {
				preferences.push(...strategy.preferences);
			}
		}
		if (preferences.length === 0) return random;
		return preferences[Math.floor(Math.random() * preferences.length)];
	}
	
}

/**
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function randBetween(min, max) {
	return Math.random() * (max - min) + min;
}

function updateGrid() {
	cells[0][0].innerText = String(payoffGrid[0][0]);
	const abIsBa = payoffGrid[0][1] === payoffGrid[1][0];
	crossLabels[0][0].innerHTML = String(payoffGrid[0][1]);
	crossLabels[0][1].innerHTML = abIsBa ? '' : String(payoffGrid[0][1]);
	crossLabels[1][0].innerHTML = abIsBa ? '' : String(payoffGrid[1][0]);
	crossLabels[1][1].innerHTML = String(payoffGrid[1][0]);
	cells[1][1].innerText = String(payoffGrid[1][1]);
}

function createScoreboard(force = false) {
	if (!isCompleted('scoreboard') || force) return;
	for (let i = 0; i < strats.length; i++) {
		const strat = allStrats[i];
		const elId=`strategy${i}`;
		const labelEl = document.getElementById(elId).nextElementSibling;
		strat.element = document.createElement('span');
		strat.element.classList.add('number');
		strat.element.innerText = formatWithCommas(strat.currentScore);
		labelEl.innerText = strat.name + ': ';
		labelEl.appendChild(strat.element);
	}
}

function marshalTournament() {
	const base = {
		stratsUnlocked: stratsUnlocked,
		tourneyInProg: tourneyInProg.value,
		allowStrategyRerolls: allowStrategyRerolls.value,
		autoTourneyFlag: autoTourneyFlag.value,
		autoTourneyStatus: autoTourneyStatus.value,
	}
	if (!tourneyInProg.isTrue) {
		return base;
	}
	return {
		...base,
		strats: strats.map(strat => {
			const res = {};
			res[strat.name] = strat.currentScore;
			return res;
		}),
		currentRound: currentRound,
		currentMove: currentMove,
		payoffGrid: payoffGrid,
		prevMoves: prevMoves,
		currentScores: strats.map(strat => strat.currentScore),
		nameIndex: nameIndex,
	};
}

function unmarshallTournament(startingData) {
	stratsUnlocked = startingData.stratsUnlocked;
	rerollCost.value = stratsUnlocked ** 2 * 5;
	allowStrategyRerolls.value = startingData.allowStrategyRerolls;
	autoTourneyFlag.value = startingData.autoTourneyFlag;
	autoTourneyStatus.value = startingData.autoTourneyStatus;
	for (let i = 1; i < stratsUnlocked; i++) {
		addStrat(i, allStrats[i]);
	}
	selectStrat(pick);
	tourneyInProg.value = startingData.tourneyInProg;
	
	if (!tourneyInProg.isTrue) return;
	strats = startingData.strats.map(kv => {
		const name = Object.keys(kv)[0];
		const strat = allStrats.find(strat => strat.name === name);
		if (strat === undefined) {
			console.warn('Unknown strat: ' + name);
			tourneyInProg.value = false;
			return undefined;
		}
		strat.currentScore = kv[name];
		return strat;
	});
	if (strats.includes(undefined)) return;
	payoffGrid = startingData.payoffGrid;
	updateGrid()
	setChoiceNames(startingData.nameIndex);
	currentRound = startingData.currentRound;
	currentMove = startingData.currentMove;
	prevMoves = startingData.prevMoves.map(val => val ?? undefined);
}

function addStrat(id, strat) {
	const div = document.createElement('div');
	div.innerHTML = `<input type="radio" name="strategy" id="strategy${id}" value="${id}"><label for="strategy${id}">${strat.name}</label>`
	stratSelector.appendChild(div);
}

const selectNoStrategy = document.getElementById('selectNoStrategy');
function selectStrat(id) {
	const pickedEl = stratSelector.querySelector(`#strategy${id}`);
	if (pickedEl != null) {
		pickedEl.checked = true;
		selectNoStrategy.disabled = false;
	}
}

function getSelectedStratId() {
	return Number(stratSelector.querySelector('input:checked')?.value);
}

stratSelector.addEventListener('change', (e) => {
	selectNoStrategy.disabled = false;
});
selectNoStrategy.addEventListener('click', () => {
	selectNoStrategy.disabled = true;
	const checked = stratSelector.querySelector('input:checked');
	if (checked != null) checked.checked = false;
})

function setChoiceNames(index) {
	nameIndex = index;
	namesElements[0].innerText = choiceANames[index];
	namesElements[1].innerText = choiceBNames[index];
	namesElements[2].innerText = choiceANames[index];
	namesElements[3].innerText = choiceBNames[index];
}

let resultsTimer = 0;
let results = [];

/** @type preference */
const random = [[1, 1], [1, 1]];
/** @type preference */
const classic = [[2, 3], [1, 0]];

const stratA100 = {
	name: "A100",
	preferences: [[[3, 2], [1, 0]]],
	pickMove() {return 0;}
}
allStrats.push(stratA100);

const stratB100 = {
	name: "B100",
	preferences: [[[0, 1], [2, 3]]],
	pickMove() {return 1;}
}
allStrats.push(stratB100);

const stratRandom = {
	name: "RANDOM",
	preferences: [random, classic],
	pickMove() {return Math.round(Math.random());}
}
allStrats.push(stratRandom);

/** @type {strategy} */
const stratCopycat = {
	name: "COPYCAT",
	preferences: [[[3, 0], [1, 3]]],
	pickMove(choices, op) {
		if (op !== undefined) return op;
		if (stratH !== stratCopycat) return copyMove(stratH, choices, prevMoves[1], Math.round(Math.random()));
		if (stratV !== stratCopycat) return copyMove(stratV, choices, prevMoves[0], Math.round(Math.random()));
		return Math.round(Math.random());
	}
}
allStrats.push(stratCopycat);

/** @type {strategy[]} */
const beingCopied = [];
/**
 * @param {strategy} strat
 * @param {scoreChoices} choices
 * @param {0|1|undefined} op
 * @param {0|1|undefined} fallback
 * @return {0|1|undefined}
 */
function copyMove(strat, choices, op, fallback) {
	if (beingCopied.includes(strat)) return fallback;
	beingCopied.push(strat);
	const result = strat.pickMove(choices, op);
	beingCopied.pop();
	return result;
}

function greedy(choices) {
	const maxA = Math.max(...choices[0]);
	const maxB = Math.max(...choices[1]);
	if (isCompleted('avoidNegativeCells') && Math.max(maxA, maxB) < 0) {
		return undefined;
	}
	return maxA > maxB ? 0 : 1;
}

/** @type {strategy} */
const stratGreedy = {
	name: "GREEDY",
	preferences: [random],
	pickMove: greedy
}
allStrats.push(stratGreedy);

/** @type {strategy} */
const stratMinimax = {
	name: "MINIMAX",
	pickMove(choices, op) {
		const opValuesA = [choices[0][0], choices[1][0]];
		const opValuesB = [choices[0][1], choices[1][1]];
		if (op === undefined) {
			return Math.min(...opValuesA) < Math.min(...opValuesB) ? 0 : 1;
		}
		if (opValuesA[op] < 0 && opValuesB[op] < 0) {
			return undefined;
		}
		return opValuesA[op] < opValuesB[op] ? 0 : 1;
	}
}
allStrats.push(stratMinimax);

/** @type {strategy} */
const stratTitfortat = {
	name: "TIT FOR TAT",
	preferences: [classic],
	pickMove(choices, op) {
		const bestCompromise = bestSharedStrategy(choices);
		if (bestCompromise === undefined) {
			return highestPositiveTotal(choices);
		}
		if (op !== undefined && op !== bestCompromise) {
			return bestCompromise ^ 1;
		}
		return bestCompromise;
	}
}
allStrats.push(stratTitfortat);

/**
 * @param {scoreChoices} choices
 * @return {0|1|undefined}
 */
function bestSharedStrategy(choices) {
	const compromise = choices[0][0] > choices[1][1] ? 0 : 1;
	const payoff = choices[compromise][compromise];
	if (Math.min(choices[0][1], choices[1][0]) >= payoff) {
		return undefined;
	}
	if (isCompleted('avoidNegativeCells') && payoff < 0) {
		return undefined;
	}
	return compromise;
}

/** @param {scoreChoices} choices */
function highestPositiveTotal(choices) {
	const sumA = choices[0][0] + choices[0][1];
	const sumB = choices[1][0] + choices[1][1];
	if (isCompleted('avoidNegativeCells') && sumA < 0 && sumB < 0) return undefined;
	return sumA >= sumB ? 0 : 1;
}

/** @type {strategy} */
const stratBeatlast = {
	name: "BEAT LAST",
	pickMove(choices, op) {
		if (op === undefined) {
			return highestPositiveTotal(choices);
		}
		const choice = choices[0][op] > choices[1][op] ? 0 : 1;
		if (isCompleted('avoidNegativeCells') && choices[choice][op] < 0) return undefined;
		return choice;
	}
}
allStrats.push(stratBeatlast);

/** @type {strategy} */
const stratAverage = {
	name: "AVERAGE",
	preferences: [random],
	pickMove: highestPositiveTotal
};
allStrats.push(stratAverage);

/**
 * @type {strategy}
 */
const stratGenerous = {
	name: 'GENEROUS',
	pickMove(choices, op) {
		const opValuesA = [choices[0][0], choices[1][0]];
		const opValuesB = [choices[0][1], choices[1][1]];
		if (op !== undefined) {
			if (opValuesA[op] > 0 && opValuesB[op] > 0) {
				return undefined;
			}
			return opValuesA[op] > opValuesB[op] ? 0 : 1;
		}
		return Math.max(...opValuesA) > Math.max(...opValuesB) ? 0 : 1;
	}
};
allStrats.push(stratGenerous);

/**
 * Won't choose options that could have negative outcomes
 * @type {strategy}
 */
const stratSpineless = {
	name: 'SPINELESS',
	preferences: [random],
	pickMove(choices, op) {
		const negativeA = Math.min(...choices[0]) < 0;
		const negativeB = Math.min(...choices[1]) < 0;
		if (negativeA && negativeB) return undefined;
		if (negativeB) return 0;
		if (negativeA) return 1;
		const bestCompromise = bestSharedStrategy(choices);
		if (bestCompromise !== undefined) return bestCompromise;
		return stratGenerous.pickMove(choices, op);
	},
};
allStrats.push(stratSpineless);

/**
 * Copy the strategy of whoever is currently in the lead
 * @type {strategy}
 */
const stratPeeker = {
	name: 'PEEKER',
	pickMove(choices, op) {
		const best = strats.reduce((best, comp) => {
			if (best === stratPeeker) return comp;
			return best.currentScore > comp.currentScore ? best : comp;
		}, stratPeeker);
		if (isCompleted('avoidNegativeCells') && best.currentScore < 0) return undefined;
		return copyMove(best, choices, op, Math.round(Math.random()));
	}
};
allStrats.push(stratPeeker);

/** @returns {[number, number][]} */
function getChosenCells() {
	if (prevMoves[0] === undefined && prevMoves[1] === undefined) {
		return [];
	} else if (prevMoves[0] === undefined) {
		return [
			[0, prevMoves[1]],
			[1, prevMoves[1]]
		];
	} else if (prevMoves[1] === undefined) {
		return [
			[prevMoves[0], 0],
			[prevMoves[0], 1]
		];
	} else {
		return [prevMoves];
	}
}

/**
 * DONATOR - Choose the lowest positive number, donate the results after the tournament
 * @type {strategy}
 */
const stratDonator = {
	name: 'DONATOR',
	pickMove(choices) {
		if (!isCompleted('avoidNegativeCells')) {
			return Math.min(...choices[0]) < Math.min(...choices[1]) ? 0 : 1;
		}
		const a = Math.min(...choices[0].filter(v => v > 0));
		const b = Math.min(...choices[1].filter(v => v > 0));
		if (Number.isFinite(a) && Number.isFinite(b)) {
			return a < b ? 0 : 1;
		}
		if (Number.isFinite(a)) return 0;
		if (Number.isFinite(b)) return 1;
		return undefined;
	},
	preferences: [classic],
};
allStrats.push(stratDonator);

/**
 * Choose like GREED, changes the history to show a compromise
 * @type {strategy}
 */
const stratFraud = {
	name: 'FRAUD',
	preferences: [classic],
	pickMove: greedy,
	afterMove() {
		const bestCompromise = bestSharedStrategy(payoffGrid);
		if (bestCompromise === undefined) return;
		prevMoves = [bestCompromise, bestCompromise];
	}
};
allStrats.push(stratFraud);

/**
 * Chance to increase the cell. More likely the higher the investor's current score is
 * @type {strategy}
 */
const stratInvestor = {
	name: 'INVESTOR',
	pickMove: greedy,
	afterMove() {
		const chosen = getChosenCells();
		if (stratH !== stratInvestor) vertRotation(chosen);
		const rerollCellCost = rerollCost.value / 4;
		for (const pos of chosen) {
			if (stratInvestor.currentScore < rerollCellCost) return;
			if (payoffGrid[pos[0]][pos[1]] >= averageCellValue) continue;
			stratInvestor.currentScore -= rerollCellCost;
			payoffGrid[pos[0]][pos[1]] = Math.ceil(randBetween(...minMaxCellValue()));
			updateGrid();
		}
	}
};
allStrats.push(stratInvestor);
altersTheGrid.push(stratInvestor);

/**
 * Switch the picked cell with the highest value cell afterward
 * @type {strategy}
 */
const stratFlip = {
	name: 'FLIP',
	preferences: [[[3, 2], [1, 0]]],
	pickMove() {return 0;},
	afterMove() {
		const chosen = getChosenCells().sort((a, b) => payoffGrid[b[0]][b[1]] - payoffGrid[a[0]][a[1]]);
		if (stratH !== stratFlip) vertRotation(chosen);
		const sorted = payoffGrid.flatMap(i => i).sort((a, b) => b - a);
		while (payoffGrid[chosen[0][0]][chosen[0][1]] === sorted[0]) {
			if (chosen.length === 1) return;
			chosen.shift();
			sorted.shift();
		}
		do {
			const pos = chosen.shift();
			const toFind = sorted.shift();
			let switchWith;
			if (toFind === payoffGrid[0][0]) switchWith = [0, 0];
			else if (toFind === payoffGrid[0][1]) switchWith = [0, 1];
			else if (toFind === payoffGrid[1][0]) switchWith = [1, 0];
			else if (toFind === payoffGrid[1][1]) switchWith = [1, 1];
			[payoffGrid[switchWith[0]][switchWith[1]], payoffGrid[pos[0]][pos[1]]] = [payoffGrid[pos[0]][pos[1]], payoffGrid[switchWith[0]][switchWith[1]]];
		} while (chosen.length > 0)
		updateGrid();
	}
};
allStrats.push(stratFlip);
altersTheGrid.push(stratFlip);

/**
 * @param {[number, number][]} chosen
 */
function vertRotation(chosen) {
	for (let i = 0; i < chosen.length; i++) {
		if (chosen[i][0] !== chosen[i][1]) {
			chosen[i] = [chosen[i][1], chosen[i][0]];
		}
	}
}
