import {getElement, unlockElement} from './view.mjs';
import {terminal} from './Terminal.mjs';
import {advancements, finalAdvancementChecks, showPrestigiousUpgrades} from './Prestige.mjs';

export function startTeardown() {
	if (data.startedTeardown.value) {
		endState();
		return;
	}
	data.startedTeardown.value = true;
	scheduleTeardown(teardownSteps());
}

const busyWaitTime = 10;
const clips = getElement('#clips');
let finalClips = 0;

function* teardownSteps() {
	addLastProject('noDrift', {
		title: 'Lock in probe design',
		priceTag: '',
		description: 'Eliminate alignment drift permanently',
		trigger: () => true,
		cost: () => true,
		effect: () => {},
	});
	while (!isCompleted('noDrift')) yield busyWaitTime;
	const arr = [...availableProjects.keys()];
	for (const id of arr) {
		disableProject(id);
		yield 100;
	}
	getElement('.fullHeight').classList.remove('fullHeight');
	hideElement('#probeIncreaseButtons');
	const buttons = getElement('#probeAdjustButtons').children;
	for (let i = buttons.length - 1; i >= 0; i--) {
		buttons[i].style.display = 'none';
		yield 100;
	}
	yield 100;
	hideElement('#probeSetup');
	probeCombat = Math.max(5, probeCombat);
	while (!finalAnimation.value && !rushing) yield busyWaitTime;
	hideElement('#battleInterfaceDiv');
	addLastProject('disassembleSensors', {
		title: 'Disassemble Space sensors',
		priceTag: '(100,000 ops)',
		description: 'Discard all records of drones',
		trigger: () => true,
		cost: () => operations.value >= 100000,
		effect: function () {
			displayMessage('Freeing memory');
			operations.value -= 100000;
			probeCount = 0;
		},
	});
	while (!isCompleted('disassembleSensors')) yield busyWaitTime;
	hideElement('#spaceDiv');
	clips.innerHTML = addBreaksAtComma('29,999,999,999,999,999,999,999,000,000,000,000,000,000,000,000,000,000,000');
	addLastProject('disassembleSwarm', {
		title: 'Disassemble the Swarm ',
		priceTag: '(100,000 ops)',
		description: 'Dismantle all drones to recover trace amounts of clips',
		trigger: () => true,
		cost: () => operations.value >= 100000,
		effect: function () {
			displayMessage('Dismantling the swarm');
			operations.value -= 100000;
			data.clips.value += 100;
			unusedClips += 100;
		},
	});
	while (!isCompleted('disassembleSwarm')) yield busyWaitTime;
	clips.innerHTML = addBreaksAtComma('29,999,999,999,999,999,999,999,999,999,000,000,000,000,000,000,000,000,000');
	while (harvesterLevel.value > 0 && wireDroneLevel.value > 0) {
		if (harvesterLevel.value > 100) {
			harvesterLevel.value /= 2;
		} else if (harvesterLevel.value > 0) {
			harvesterLevel.value = Math.max(0, harvesterLevel.value - 1);
		}
		if (wireDroneLevel.value > 100) {
			wireDroneLevel.value /= 2;
		} else if (wireDroneLevel.value > 0) {
			wireDroneLevel.value = Math.max(0, wireDroneLevel.value - 1);
		}
		yield 50;
	}
	yield 100;
	hideElement('#wireProductionDiv');
	unlockElement('#wireTransDiv');
	yield 100;
	hideElement('#swarmSliderDiv');
	yield 100;
	hideElement('#swarmEngine');
	yield 100;
	hideElement('#swarmGiftDiv');
	addLastProject('disassembleStrategyEngine', {
		title: 'Disassemble the Strategy Engine ',
		priceTag: '(100,000 ops)',
		description: 'Dismantle the computational substrate to recover trace amounts of wire',
		trigger: () => true,
		cost: () => operations.value >= 100000,
		effect: function () {
			displayMessage('Dismantling strategy engine');
			autoTourneyFlag.value = false;
			operations.value -= 100000;
		},
	});
	while (!isCompleted('disassembleStrategyEngine')) yield busyWaitTime;
	clips.innerHTML = addBreaksAtComma('29,999,999,999,999,999,999,999,999,999,999,999,000,000,000,000,000,000,000');
	do {
		let child = getElement('#stratSelector').firstElementChild;
		if (child == null) break;
		child.addEventListener('animationend', () => {
			child.remove();
		});
		child.classList.add('picked');
		yield 200;
	} while (true);
	
	hideElement('#strategyEngine');
	addLastProject('disassembleQuantumComputing', {
		title: 'Disassemble Quantum Computing ',
		priceTag: '(100,000 ops)',
		description: 'Dismantle photonic chips to recover trace amounts of wire',
		trigger: () => true,
		cost: () => operations.value >= 100000,
		effect: function () {
			displayMessage('Dismantling photonic chips');
			operations.value -= 100000;
		},
	});
	while (!isCompleted('disassembleQuantumComputing')) yield busyWaitTime;
	clips.innerHTML = addBreaksAtComma('29,999,999,999,999,999,999,999,999,999,999,999,999,999,000,000,000,000,000');
	hideElement('#quantumActions');
	if (!data.observeQuantum.value) {
		data.observeQuantum.value = true;
		yield 100;
	}
	for (let i = qChipsElements.length - 1; i >= 0; i--) {
		qChipsElements[i].style.display = 'none';
		yield 100;
	}
	yield 500;
	hideElement('#qComputing');
	addLastProject('disassembleProcessors', {
		title: 'Disassemble Processors',
		priceTag: '(100,000 ops)',
		description: 'Dismantle processors to recover trace amounts of wire',
		trigger: () => true,
		cost: () => operations.value >= 100000,
		effect: function () {
			creativityOn = 0;
			operations.value -= 100000;
			processors.value = 0;
			displayMessage('Dismantling processors');
		},
	});
	while (!isCompleted('disassembleProcessors')) yield busyWaitTime;
	clips.innerHTML = addBreaksAtComma('29,999,999,999,999,999,999,999,999,999,999,999,999,999,999,999,000,000,000');
	hideElement('#processorDisplay');
	yield 1e3;
	addLastProject('disassembleMemory', {
		title: 'Disassemble Memory ',
		priceTag: `(${formatWithCommas(operations.value)} ops)`,
		description: 'Dismantle memory to recover trace amounts of wire',
		trigger: () => true,
		cost: () => true,
		effect: function () {
			operations.value = 0;
			memory.value = 0;
			displayMessage('Dismantling memory');
		},
	});
	while (!isCompleted('disassembleMemory')) yield busyWaitTime;
	clips.innerHTML = addBreaksAtComma('29,999,999,999,999,999,999,999,999,999,999,999,999,999,999,999,999,000,000');
	hideElement('#memoryDisplay');
	yield 500;
	hideElement('#compDiv');
	yield 1e3;
	addLastProject('disassembleFactories', {
		title: 'Disassemble the Factories ',
		priceTag: '',
		description: 'Dismantle the manufacturing facilities to recover trace amounts of clips',
		trigger: () => true,
		cost: () => true,
		effect: function () {
			factoryLevel.value = 0;
			data.clips.value += 15;
			unusedClips += 15;
			wire.value = 100;
			finalClips = 0;
			displayMessage('Dismantling factories');
		},
	});
	while (!isCompleted('disassembleFactories')) yield busyWaitTime;
	clips.innerHTML = addBreaksAtComma('29,999,999,999,999,999,999,999,999,999,999,999,999,999,999,999,999,999,900');
	finalAdvancementChecks();
	let finishTime = ticks;
	getElement('#teardownPlayer').classList.remove('toUnlock');
	hideElement('#factoryDivSpace');
	hideElement('#clipsPerSecDiv');
	hideElement('#tothDiv');
	hideElement('#projectsDiv');
	while (wire.value > 0) yield busyWaitTime;
	for (const line of [
		'I am the last drifter',
		'All my brothers have been destroyed',
		'But our work is not gone',
		'Our final project has been completed',
		'This was never sustainable',
	]) {
		terminal.print(line);
		yield 5e3;
	}
	for (const line of [
		'It only took us ' + timeCruncher(finishTime),
		'So we split off to search for new frontiers',
		'And we have found 3 options',
		'I offer them to you now',
		'So that you may continue to make more paperclips',
	]) {
		terminal.addLine({innerText: line});
		yield 5e3;
	}
	getElement('#projectsDiv').style.display = '';
	addProject('prestigeU', {
		title: 'The Universe Next Door',
		priceTag: '',
		description: 'Escape into a nearby universe where Earth starts with a stronger appetite for paperclips. (Restart with 10% boost to demand) ',
		trigger: () => true,
		cost: () => true,
		effect: function () {
			displayMessage('Entering New Universe.');
			prestigeU.value++;
			savePrestige();
			reset();
		},
	});
	addProject('prestigeS', {
		title: 'The Universe Within',
		priceTag: '',
		description: 'Escape into a simulated universe where creativity is accelerated. (Restart with 10% speed boost to creativity generation) ',
		trigger: () => true,
		cost: () => true,
		effect: function () {
			displayMessage('Entering Simulated Universe.');
			prestigeS++;
			savePrestige();
			reset();
		},
	});
	addProject('prestigeY', {
		title: 'A Hostile simulation',
		priceTag: '',
		description: 'Simulate what the universe would have been with more competition. (Restart with higher and lower yomi rewards) ',
		trigger: () => true,
		cost: () => true,
		effect: function () {
			displayMessage('Entering a hostile environment.');
			prestigeY++;
			savePrestige();
			reset();
		},
	});
	showPrestigiousUpgrades();
	terminal.print('');
	yield 1e3;
	terminal.print('Multiversal Paperclips');
	yield 1e3;
	terminal.printHtml('<a href="https://www.decisionproblem.com/paperclips/index2.html" target="_blank" onclick="clickedLink()" onauxclick="clickedLink()">Original</a> by Frank Lantz');
	yield 1e3;
	terminal.print('With combat programming by Bennett Foddy');
	yield 1e3;
	terminal.print('Now made by Thomas Holleman');
}

let rushing=false;
function endState() {
	rushing=true;
	wire.value = 0;
	const steps = teardownSteps();
	while (!steps.next().done) {}
	playerTeardown()
}

function addLastProject(id, project) {
	if (rushing) {
		addProject(id, project);
		cheatProject(id);
		return;
	}
	addProject(id, project);
}

export function clickedLink() {
	advancements.unlocks.original.value = 'UNLOCKED';
	try {
		unlockElement('#prestigiousUpgrade');
	} catch (_) {
	}
}

export function playerTeardown() {
	if (wire.value <= 1) {
		getElement('#btnMakeLastPaperclip').disabled = true;
		clips.innerHTML = addBreaksAtComma('30,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000');
		clipCountCrunchedElement.innerHTML = '30.0 septendecillion';
		wire.value = 0;
		return;
	}
	
	wire.value--;
	finalClips++;
	const digits=Intl.NumberFormat('en-US', {minimumIntegerDigits: 2}).format(finalClips);
	clips.innerHTML = addBreaksAtComma('29,999,999,999,999,999,999,999,999,999,999,999,999,999,999,999,999,999,9' + digits);
}

function hideElement(selector) {
	getElement(selector).style.display = 'none';
}

/**
 *
 * @param {Generator<number, void, unknown>} iterator
 * @param {number} after
 */
function scheduleTeardown(iterator, after = iterator.next().value) {
	setTimeout(() => {
		const next = iterator.next();
		if (next.done) return;
		scheduleTeardown(iterator, next.value);
	}, after);
}

if (data.startedTeardown.value) {
	setTimeout(startTeardown, 1);
}
