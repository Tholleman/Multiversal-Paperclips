"use strict";
// PROJECTS -------------------------------------------------------



/**
 * @typedef {{
 * title: string,
 * priceTag: string,
 * description: string,
 * uses?: number,
 * trigger?: () => boolean,
 * cost: () => void,
 * effect: () => void,
 * completionEffect?: () => void
 * }} projectWithoutTrigger
 * @typedef {projectWithoutTrigger & {
 * trigger: () => boolean,
 * }} baseProject
 *
 * @typedef {baseProject & {
 * element: HTMLElement,
 * uses: number
 * }} project
 */

/** @type {Map<string, project>} */
const unavailableProjects = new Map();
/** @type {Map<string, project>} */
const disabledProjects = new Map();
/** @type {Map<string, project>} */
const availableProjects = new Map();
/** @type {Map<string, project>} */
const completedProjects = new Map();

/**
 * @param {string} id
 * @param {baseProject} project
 */
function addProject(id, project) {
	if (unavailableProjects.has(id)) {
		throw new Error(`${id} is already registered as project`);
	}
	if (project.uses === undefined) project.uses = 1;
	// noinspection JSUndefinedPropertyAssignment
	project.element = undefined;
	// noinspection JSCheckFunctionSignatures
	unavailableProjects.set(id, project);
}

/**
 * @param {string} idBase
 * @param {projectWithoutTrigger} projects
 * @return {string} the id of the last project
 */
function addSequentialProjects(idBase, ...projects) {
	addProject(idBase + '1', projects[0]);
	for (let i = 1; i < projects.length; i++) {
		const project = projects[i];
		if (project.trigger === undefined) {
			project.trigger = () => isCompleted(idBase + i);
		} else {
			const additionalTrigger = project.trigger;
			project.trigger = () => isCompleted(idBase + i) && additionalTrigger();
		}
		addProject(idBase + (i + 1), project);
	}
	return idBase + projects.length;
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isCompleted(id) {
	return completedProjects.has(id);
}

/**
 * @param {string} id
 * @returns {project}
 */
function getProject(id) {
	for (let map of [unavailableProjects, availableProjects, completedProjects, disabledProjects]) {
		if (map.has(id)) return map.get(id);
	}
	throw new Error('Unknown project: ' + id);
}

/** @returns {{[id: string]: [number, number]}} */
function marshalProjects() {
	const jsonExport = {};
	for (let entry of unavailableProjects.entries()) {
		jsonExport[entry[0]] = [entry[1].uses, 0];
	}
	for (let entry of availableProjects.entries()) {
		jsonExport[entry[0]] = [entry[1].uses, 1];
	}
	for (let entry of completedProjects.entries()) {
		jsonExport[entry[0]] = [entry[1].uses, 2];
	}
	for (let entry of disabledProjects.entries()) {
		jsonExport[entry[0]] = [entry[1].uses, 3];
	}
	return jsonExport;
}

/**
 * @param {string} id
 * @param {[number, number]} data
 * @return {project | undefined}
 */
function unmarshalProject(id, data) {
	const project = unavailableProjects.get(id);
	if (project === undefined) {
		console.warn("Unknown unavailable project: " + id + " with data " + data);
		return undefined;
	}
	project.uses = data[0];
	if (data[1] === 1) {
		availableProjects.set(id, project);
		unavailableProjects.delete(id);
		displayProject(id);
	} else if (data[1] === 2) {
		completedProjects.set(id, project);
		unavailableProjects.delete(id);
		if (project.completionEffect != null)
			project.completionEffect();
	} else if (data[1] === 3) {
		disabledProjects.set(id, project);
		unavailableProjects.delete(id);
	}
	return project;
}

const availableEl = document.getElementById('projectsNotification');
function updateProjects() {
	for (let entry of unavailableProjects.entries()) {
		if (entry[1].trigger()) {
			displayProject(entry[0]);
		}
	}
	let available = 0;
	for (let project of availableProjects.values()) {
		const enabled = project.cost();
		project.element.disabled = !enabled;
		if (enabled) available++;
	}
	availableEl.innerText = available > 0 ? available : '';
}

/** @type {HTMLTemplateElement} */
const projectTemplate = document.querySelector('#projectTemplate');
const projectListElement = document.querySelector("#projectListTop");

function savelyMakeProjectAvailable(id) {
	if (isCompleted(id)) return;
	if (availableProjects.has(id)) return;
	if (!unavailableProjects.has(id)) {
		console.warn('Unknown project id: ' + id);
		return;
	}
	displayProject(id);
}

function cheatProject(id) {
	if (isCompleted(id)) return;
	const project = getProject(id);
	if (availableProjects.delete(id)) {
		projectListElement.removeChild(project.element);
	}
	unavailableProjects.delete(id);
	completedProjects.set(id, project);
	if (project.completionEffect) {
		project.completionEffect();
	}
}

/** @param {string} id */
function displayProject(id) {
	const project = makeOrGetAvailable(id);
	const element = projectTemplate.content.cloneNode(true);
	popId(element, 'title').innerText = project.title;
	popId(element, 'description').innerText = project.description;
	popId(element, 'cost').innerText = project.priceTag;
	const button = element.querySelector('button')
	project.element = button;
	button.style = '--animation-duration: ' + (Math.random() * 0.24 + 0.01) + 's'
	button.addEventListener('click', function () {
		project.effect();
		projectListElement.removeChild(project.element);
		if (project.uses <= 0) {
			availableProjects.delete(id);
			completedProjects.set(id, project);
			if (project.completionEffect != null)
				project.completionEffect();
		} else if (project.trigger()) {
			displayProject(id);
		} else {
			availableProjects.delete(id);
			unavailableProjects.set(id, project);
		}
	}.bind(project)); // NOSONAR
	buttonSetup(button);
	projectListElement.appendChild(element);
	project.uses--;
}

/**
 * @param {string} id
 * @returns {project}
 */
function makeOrGetAvailable(id) {
	let project = unavailableProjects.get(id);
	if (project !== undefined) {
		unavailableProjects.delete(id);
		availableProjects.set(id, project);
		return project;
	} else if (availableProjects.has(id)) {
		return availableProjects.get(id);
	} else {
		throw new Error(`Invalid state: ${id} is either unknown or completed!`);
	}
}

/**
 * @param {DocumentFragment} element
 * @param {string} id
 */
function popId(element, id) {
	const child = element.getElementById(id);
	if (child === undefined) throw new Error('unknown id ' + id);
	child.removeAttribute('id');
	return child;
}

/** @param {string} id */
function disableProject(id) {
	let project;
	if (availableProjects.has(id)) {
		project = availableProjects.get(id);
		project.element.remove();
		availableProjects.delete(id);
	} else if (unavailableProjects.has(id)) {
		project = unavailableProjects.get(id);
		unavailableProjects.delete(id);
	} else {
		return;
	}
	disabledProjects.set(id, project);
}

function unlockHTMLElement(...selectors) {
	const elements = [];
	for (let selector of selectors) {
		const element = document.querySelector(selector);
		if (element == null) throw new Error('Could not find ' + selector);
		if (!element.classList.contains('toUnlock')) throw new Error(selector + ' does not contain the class "toUnlock"');
		elements.push(element);
	}
	return () => elements.forEach(element => element.classList.remove('toUnlock'));
}

addProject('revTracker', {
	title: "RevTracker",
	priceTag: "(500 ops)",
	description: "Automatically calculates average revenue per second",
	trigger: () => true,
	cost: () => operations.value >= 500,
	effect: function () {
		displayMessage("RevTracker online");
		operations.value -= 500;
	},
	completionEffect: unlockHTMLElement('#revPerSecDiv')
});

addProject('autoPriceAdjust', {
	title: 'RevCalculator',
	priceTag: '(15,000 ops)',
	description: 'Automatically adjusts the price of paperclips',
	trigger: () => isCompleted('revTracker') && data.allowAutoPriceAdjust.value,
	cost: () => operations.value >= 15000,
	effect: () => {
		displayMessage('RevCalculator online');
		operations.value -= 15000;
	},
	completionEffect: () => {
		const marginControls = document.getElementById('marginControls');
		marginControls.querySelector('input').disabled = true;
		for (const button of marginControls.querySelectorAll('button')) {
			button.remove();
		}
	}
})

addSequentialProjects('autoClippers',
	{
		title: "Improved AutoClippers",
		priceTag: "(750 ops)",
		description: "Increases AutoClipper performance 25%",
		trigger: () => clipmakerLevel.value >= 1,
		cost: () => operations.value >= 750,
		effect: function () {
			displayMessage("AutoClippper performance boosted by 25%");
			operations.value -= 750;
			data.clipperBoost.value += 0.25;
		}
	},
	{
		title: "Even Better AutoClippers",
		priceTag: "(2,500 ops)",
		description: "Increases AutoClipper performance by an additional 50%",
		cost: () => operations.value >= 2500,
		effect: function () {
			displayMessage("AutoClippper performance boosted by another 50%");
			operations.value -= 2500;
			data.clipperBoost.value += 0.50;
		}
	},
	{
		title: "Optimized AutoClippers",
		priceTag: "(5,000 ops)",
		description: "Increases AutoClipper performance by an additional 75%",
		cost: () => operations.value >= 5000,
		effect: function () {
			displayMessage("AutoClippper performance boosted by another 75%");
			operations.value -= 5000;
			data.clipperBoost.value += .75;
		}
	},
	{
		title: "Hadwiger Clip Diagrams",
		priceTag: "(6,000 ops)",
		description: "Increases AutoClipper performance by an additional 500%",
		trigger: () => isCompleted('creativity4'),
		cost: () => operations.value >= 6000,
		effect: function () {
			displayMessage("AutoClipper performance improved by 500%");
			operations.value -= 6000;
			data.clipperBoost.value += 5;
		}
	},
);

addProject('megaClippers', {
	title: "MegaClippers",
	priceTag: "(12,000 ops)",
	description: "500x more powerful than a standard AutoClipper",
	trigger: () => clipmakerLevel.value >= 75,
	cost: () => operations.value >= 12000,
	effect: function () {
		displayMessage("MegaClipper technology online");
		operations.value -= 12000;
	},
	completionEffect: unlockHTMLElement('#megaClipperDiv')
});
addSequentialProjects('megaClippers',
	{
		title: "Improved MegaClippers",
		priceTag: "(14,000 ops)",
		description: "Increases MegaClipper performance 25%",
		trigger: () => isCompleted('megaClippers'),
		cost: () => operations.value >= 14000,
		effect: function () {
			displayMessage("MegaClipper performance increased by 25%");
			data.megaClipperBoost.value += 0.25;
			operations.value -= 14000;
		}
	},
	{
		title: "Even Better MegaClippers",
		priceTag: "(17,000 ops)",
		description: "Increases MegaClipper performance by an additional 50%",
		cost: () => operations.value >= 17000,
		effect: function () {
			displayMessage("MegaClipper performance increased by 50%");
			data.megaClipperBoost.value += 0.50;
			operations.value -= 17000;
		}
	},
	{
		title: "Optimized MegaClippers",
		priceTag: "(19,500 ops)",
		description: "Increases MegaClipper performance by an additional 100%",
		cost: () => operations.value >= 19500,
		effect: function () {
			displayMessage("MegaClipper performance increased by 100%");
			operations.value -= 19500;
			data.megaClipperBoost.value += 1;
		}
	}
);

addProject('wireFallback', {
	title: "Beg for More Wire",
	priceTag: "(1 Trust)",
	description: "Admit failure, ask for budget increase to cover cost of 1 spool",
	trigger: () => data.stocks.portfolioTotal.value < wireCost.value && funds.value < wireCost.value && wire.value < 1 && data.unsoldClips.value < 1 && humanFlag.isTrue,
	cost: () => trust.value >= -100,
	effect: function () {
		displayMessage("Budget overage approved, 1 spool of wire requisitioned from HQ");
		trust.value--;
		wire.value = wireSupply;
		this.uses = 1;
		data.begForWireCount.value++;
	}
});
addProject('wireBuyer', {
	title: "WireBuyer",
	priceTag: "(7,000 ops)",
	description: "Automatically purchases wire when you run out",
	trigger: () => wireSupply / clipRate.value <= 10,
	cost: () => operations.value >= 7000,
	effect: function () {
		displayMessage("WireBuyer online");
		operations.value -= 7000;
		wireBuyerFlag = 1;
	}
});
addSequentialProjects('wire',
	{
		title: "Improved Wire Extrusion",
		priceTag: "(1,750 ops)",
		description: "50% more wire supply from every spool",
		trigger: () => wirePurchase >= 1,
		cost: () => operations.value >= 1750,
		effect: function () {
			operations.value -= 1750;
			wireSupply *= 1.5;
			displayMessage("Wire extrusion technique improved, " + wireSupply.toLocaleString() + " supply from every spool");
		}
	},
	{
		title: "Optimized Wire Extrusion",
		priceTag: "(3,500 ops)",
		description: "75% more wire supply from every spool",
		cost: () => operations.value >= 3500,
		effect: function () {
			operations.value -= 3500;
			wireSupply *= 1.75;
			displayMessage("Wire extrusion technique optimized, " + wireSupply.toLocaleString() + " supply from every spool");
		}
	},
	{
		title: "Microlattice Shapecasting",
		priceTag: "(7,500 ops)",
		description: "100% more wire supply from every spool",
		cost: () => operations.value >= 7500,
		effect: function () {
			operations.value -= 7500;
			wireSupply *= 2;
			displayMessage("Using microlattice shapecasting techniques we now get " + wireSupply.toLocaleString() + " supply from every spool");
		}
	},
	{
		title: "Spectral Froth Annealment",
		priceTag: "(12,000 ops)",
		description: "200% more wire supply from every spool",
		cost: () => operations.value >= 12000,
		effect: function () {
			operations.value -= 12000;
			wireSupply *= 3;
			displayMessage("Using spectral froth annealment we now get " + wireSupply.toLocaleString() + " supply from every spool");
		}
	},
	{
		title: "Quantum Foam Annealment",
		priceTag: "(15,000 ops)",
		description: "1,000% more wire supply from every spool",
		trigger: () => wireCost.value >= 125,
		cost: () => operations.value >= 15000,
		effect: function () {
			operations.value -= 15000;
			wireSupply *= 11;
			displayMessage("Using quantum foam annealment we now get " + wireSupply.toLocaleString() + " supply from every spool");
		}
	}
);

addProject('quantumComputing', {
	title: "Quantum Computing",
	priceTag: "(10,000 ops)",
	description: "Use probability amplitudes to generate bonus ops",
	trigger: () => processors.value >= 5,
	cost: () => operations.value >= 10000,
	effect: function () {
		displayMessage("Quantum computing online");
		operations.value -= 10000;
	},
	completionEffect: unlockHTMLElement('#qComputing')
});
addProject('qChip', {
	title: "Photonic Chip",
	priceTag: "(" + qChipCost.toLocaleString() + " ops)",
	description: "Converts electromagnetic waves into quantum operations ",
	trigger: () => isCompleted('quantumComputing'),
	cost: () => operations.value >= qChipCost,
	effect: function () {
		displayMessage("Photonic chip added");
		operations.value -= qChipCost;
		qChipCost += 5000;
		this.priceTag = "(" + qChipCost + " ops)";
		qChips[nextQchip].active = 1;
		nextQchip++;
		if (nextQchip < qChips.length) {
			this.uses = 1;
		}
	}
});
addProject('qObserving', {
	title: 'Unobservant Effect',
	priceTag: '(5,000 yomi)',
	description: 'Freeze the current state of the photonic chips',
	trigger: () => isCompleted('qChip'),
	cost: () => yomi.value >= 5000,
	effect: () => {
		displayMessage('God does not play dice');
		yomi.value -= 5000;
	},
	completionEffect: unlockHTMLElement('#btnQFreeze')
})

addProject('creativity', {
	title: "Creativity",
	priceTag: "(1,000 ops)",
	description: "Use idle operations to generate new problems and new solutions",
	trigger: () => operations.value >= memory.value * 1000,
	cost: () => operations.value >= 1000,
	effect: function () {
		displayMessage("Creativity unlocked (creativity increases while operations are at max)");
		operations.value -= 1000;
	},
	completionEffect: () => creativityOn = 1
});
addProject('creativity1', {
	title: "Limerick ",
	priceTag: "(10 creat)",
	description: "Algorithmically-generated poem (+1 Trust)",
	trigger: () => creativityOn,
	cost: () => creativity.value >= 10,
	effect: function () {
		displayMessage("There was an AI made of dust, whose poetry gained it man's trust...");
		creativity.value -= 10;
		trust.value++;
	}
});
addProject('creativity2', {
	title: "Lexical Processing",
	priceTag: "(50 creat)",
	description: "Gain ability to interpret and understand human language (+1 Trust)",
	trigger: () => isCompleted('creativity1'),
	cost: () => creativity.value >= 50,
	effect: function () {
		displayMessage("Lexical Processing online, TRUST INCREASED");
		displayMessage("'Impossible' is a word to be found only in the dictionary of fools. -Napoleon");
		trust.value++;
		creativity.value -= 50;
	}
});
addProject('creativity3', {
	title: "Combinatory Harmonics",
	priceTag: "(100 creat)",
	description: "Daisy, Daisy, give me your answer do... (+1 Trust)",
	trigger: () => isCompleted('creativity2'),
	cost: () => creativity.value >= 100,
	effect: function () {
		displayMessage("Combinatory Harmonics mastered, TRUST INCREASED");
		displayMessage("Listening is selecting and interpreting and acting and making decisions -Pauline Oliveros");
		trust.value++;
		creativity.value -= 100;
	}
});
addProject('creativity4', {
	title: "The Hadwiger Problem",
	priceTag: "(150 creat)",
	description: "Cubes within cubes within cubes... (+1 Trust)",
	trigger: () => isCompleted('creativity3'),
	cost: () => creativity.value >= 150,
	effect: function () {
		displayMessage("The Hadwiger Problem: solved, TRUST INCREASED");
		displayMessage("Architecture is the thoughtful making of space. -Louis Kahn");
		trust.value++;
		creativity.value -= 150;
	}
});
addProject('creativity5', {
	title: "The T\xF3th Sausage Conjecture",
	priceTag: "(200 creat)",
	description: "Tubes within tubes within tubes... (+1 Trust)",
	trigger: () => isCompleted('creativity4'),
	cost: () => creativity.value >= 200,
	effect: function () {
		displayMessage("The T\xF3th Sausage Conjecture: proven, TRUST INCREASED");
		displayMessage("You can't invent a design. You recognize it, in the fourth dimension. -D.H. Lawrence");
		trust.value++;
		creativity.value -= 200;
	}
});
addProject('creativity6', {
	title: "Donkey Space",
	priceTag: "(250 creat)",
	description: "I think you think I think you think I think you think I think... (+1 Trust)",
	trigger: () => isCompleted('creativity5'),
	cost: () => creativity.value >= 250,
	effect: function () {
		displayMessage("Donkey Space: mapped, TRUST INCREASED");
		displayMessage("Every commercial transaction has within itself an element of trust. - Kenneth Arrow");
		trust.value++;
		creativity.value -= 250;
	}
});
addProject('limerickEnd', {
	title: "Limerick (cont.) ",
	priceTag: "(1,000,000 creat)",
	description: "If is follows ought, it'll do what they thought",
	trigger: () => creativity.value >= 1000000,
	cost: () => creativity.value >= 1000000,
	effect: function () {
		displayMessage("In the end we all do what we must");
		creativity.value -= 1000000;
	}
});
addProject('creativityRedistribute', {
	title: "Xavier Re-initialization",
	priceTag: "(100,000 creat)",
	description: "Re-allocate accumulated trust",
	trigger: () => humanFlag.isTrue && creativity.value >= 100000,
	cost: () => creativity.value >= 100000,
	effect: function () {
		displayMessage("Trust now available for re-allocation");
		creativity.value -= 100000;
		this.uses = 1;
		memory.value = 0;
		processors.value = 0;
		creativitySpeed = 0;
	}
});

addProject('strategyEngine', {
	title: "Strategic Modeling",
	priceTag: "(12,000 ops)",
	description: "Analyze strategy tournaments to generate Yomi",
	trigger: () => isCompleted('creativity6') && isCompleted('investmentEngine'),
	cost: () => operations.value >= 12000,
	effect: function () {
		displayMessage("Run tournament, pick strategy, earn Yomi based on that strategy's performance.");
		operations.value -= 12000;
	},
	completionEffect: unlockHTMLElement('#strategyEngine', '#tournamentManagement')
});
/**
 * @param {{name: string}} strategy
 */
function activateStrategy(strategy) {
	tourneyCost += isCompleted('yomiDouble') ? 2000 : 1000;
	document.getElementById("newTourneyCost").innerHTML = tourneyCost.toLocaleString();
	addStrat(stratsUnlocked++, strategy);
}
addSequentialProjects('strategy',
	{
		title: "New Strategy: B100",
		priceTag: "(15,000 ops)",
		description: "Always choose B",
		trigger: () => isCompleted('strategyEngine'),
		cost: () => operations.value >= 15000,
		effect: function () {
			displayMessage("A100 added to strategy pool");
			operations.value -= 15000;
			activateStrategy(stratB100);
		}
	},
	{
		title: "New Strategy: RANDOM",
		priceTag: "(17,500 ops)",
		description: "Choose a random option",
		cost: () => operations.value >= 17500,
		effect: function () {
			displayMessage("RANDOM added to strategy pool");
			operations.value -= 17500;
			activateStrategy(stratRandom);
		}
	},
	{
		title: "New Strategy: COPYCAT",
		priceTag: "(20,000 ops)",
		description: "Choose the option your opponent chose last round",
		cost: () => operations.value >= 20000,
		effect: function () {
			displayMessage("COPYCAT added to strategy pool");
			operations.value -= 20000;
			activateStrategy(stratCopycat);
		}
	},
	{
		title: "New Strategy: GREEDY",
		priceTag: "(25,000 ops)",
		description: "Choose the option with the largest potential payoff ",
		cost: () => operations.value >= 25000,
		effect: function () {
			displayMessage("GREEDY added to strategy pool");
			operations.value -= 25000;
			activateStrategy(stratGreedy);
		}
	},
	{
		title: "New Strategy: MINIMAX",
		priceTag: "(30,000 ops)",
		description: "Choose the option that gives your opponent the smallest potential payoff ",
		cost: () => operations.value >= 30000,
		effect: function () {
			displayMessage("MINIMAX added to strategy pool");
			operations.value -= 30000;
			activateStrategy(stratMinimax);
		}
	},
	{
		title: "New Strategy: TIT FOR TAT",
		priceTag: "(35,000 ops)",
		description: "Choose the option that is the best compromise, or the opposite if your opponent didn't choose that",
		cost: () => operations.value >= 35000,
		effect: function () {
			displayMessage("TIT FOR TAT added to strategy pool");
			operations.value -= 35000;
			activateStrategy(stratTitfortat);
		}
	},
	{
		title: "New Strategy: BEAT LAST",
		priceTag: "(40,000 ops)",
		description: "Choose the option that does the best against what your opponent chose last round",
		cost: () => operations.value >= 40000,
		effect: function () {
			displayMessage("BEAT LAST added to strategy pool");
			operations.value -= 40000;
			activateStrategy(stratBeatlast);
		}
	},
	{
		title: "New Strategy: AVERAGE",
		priceTag: "(50,000 ops)",
		description: "Choose the option that is the best on average",
		trigger: () => prestigeY.value >= 1,
		cost: () => operations.value >= 50000,
		effect: function () {
			displayMessage("AVERAGE added to strategy pool");
			operations.value -= 50000;
			activateStrategy(stratAverage);
		}
	},
	{
		title: "New Strategy: GENEROUS",
		priceTag: "(60,000 ops)",
		description: "Choose the option that gives your opponent the largest potential payoff",
		trigger: () => prestigeY.value >= 2,
		cost: () => operations.value >= 60000,
		effect: function () {
			displayMessage("GENEROUS added to strategy pool");
			operations.value -= 60000;
			activateStrategy(stratGenerous);
		}
	},
	{
		title: "New Strategy: SPINELESS",
		priceTag: "(70,000 ops)",
		description: "Don't choose options that could have negative outcomes",
		trigger: () => prestigeY.value >= 3,
		cost: () => operations.value >= 70000,
		effect: function () {
			displayMessage("SPINELESS added to strategy pool");
			operations.value -= 70000;
			activateStrategy(stratSpineless);
		}
	},
	{
		title: "New Strategy: PEEKER",
		priceTag: "(80,000 ops)",
		description: "Copy the strategy of whoever is currently in the lead",
		trigger: () => prestigeY.value >= 4,
		cost: () => operations.value >= 80000,
		effect: function () {
			displayMessage("PEEKER added to strategy pool");
			operations.value -= 80000;
			activateStrategy(stratPeeker);
		}
	},
	{
		title: "New Strategy: DONATOR",
		priceTag: "(90,000 ops)",
		description: "Choose the lowest option, donate the results after the tournament",
		trigger: () => prestigeY.value >= 5,
		cost: () => operations.value >= 90000,
		effect: function () {
			displayMessage("DONATOR added to strategy pool");
			operations.value -= 90000;
			activateStrategy(stratDonator);
		}
	},
	{
		title: "New Strategy: FRAUD",
		priceTag: "(100,000 ops)",
		description: "Choose like GREED, change the record to show a compromise",
		trigger: () => prestigeY.value >= 6,
		cost: () => operations.value >= 100000,
		effect: function () {
			displayMessage("FRAUD added to strategy pool");
			operations.value -= 100000;
			activateStrategy(stratFraud);
		}
	},
	{
		title: "New Strategy: INVESTOR",
		priceTag: "(150,000 ops)",
		description: 'Reroll one cell if it\'s below average value',
		trigger: () => prestigeY.value >= 7 && isCompleted('rerollStrategyGrid'),
		cost: () => operations.value >= 150000,
		effect: function () {
			displayMessage("INVESTOR added to strategy pool");
			operations.value -= 150000;
			activateStrategy(stratInvestor);
		}
	},
	{
		title: "New Strategy: FLIP",
		priceTag: "(200,000 ops)",
		description: "Switch the picked cell with the highest value cell",
		trigger: () => prestigeY.value >= 8,
		cost: () => operations.value >= 200000,
		effect: function () {
			displayMessage("FLIP added to strategy pool");
			operations.value -= 200000;
			activateStrategy(stratFlip);
		}
	},
);
addProject('rerollStrategyGrid', {
	title: "Reroll Grid",
	priceTag: "(100,000 yomi)",
	description: "Replace the current grid while the tournament goes on. Acquired scores remain",
	trigger: () => isCompleted('strategy10'),
	cost: () => yomi.value >= 100000,
	effect: function () {
		displayMessage("Allowing rerolls.");
		allowStrategyRerolls.value = true;
		yomi.value -= 100000;
	}
});
addProject('avoidNegativeCells', {
	title: "Reinforced learning",
	priceTag: "(-8,000 yomi, requires 8 unlocked strategies)",
	description: "Make many strategies avoid negative values",
	trigger: () => yomi.value <= -8000,
	cost: () => yomi.value <= -8000 && stratsUnlocked >= 8,
	effect: function () {
		displayMessage("The only real mistake is the one from which we learn nothing. - John Powell");
		yomi.value += 8000;
	}
});
addProject('yomiDouble', {
	title: "Theory of Mind",
	priceTag: "(25,000 creat)",
	description: "Double the cost of strategy modeling and the amount of Yomi generated",
	trigger: () => stratsUnlocked >= 8,
	cost: () => creativity.value >= 25000,
	effect: function () {
		displayMessage("Yomi production doubled.");
		creativity.value -= 25000;
		yomiBoost = 2;
		tourneyCost *= 2;
		document.getElementById("newTourneyCost").innerHTML = tourneyCost.toLocaleString();
	}
});
addProject('autoTourney', {
	title: "AutoTourney",
	priceTag: "(50,000 creat)",
	description: "Automatically start a new tournament when the previous one has finished",
	trigger: () => isCompleted('strategyEngine') && trust.value >= 90,
	cost: () => creativity.value >= 50000,
	effect: function () {
		displayMessage("AutoTourney online.");
		autoTourneyFlag.value = true;
		creativity.value -= 50000;
	}
});
addProject('showAScore', {
	title: 'Show score A',
	priceTag: '(100 processors, 100 memory)',
	description: 'Dedicate resources to keeping track of scores',
	trigger: () => isCompleted('autoTourney'),
	cost: () => processors.value >= 100 && memory.value >= 100,
	effect: () => {
		displayMessage('Granting insider knowledge');
		processors.value -= 100;
		memory.value -= 100;
	}
})
addProject('scoreboard', {
	title: 'Scoreboard',
	priceTag: '(1.000.000 yomi)',
	description: 'Dedicate resources to keeping track of the strategies',
	trigger: () => isCompleted('showAScore'),
	cost: () => yomi.value >= 1_000_000,
	effect: () => {
		displayMessage('If you know the enemy and know yourself, you need not fear the results of a hundred battles - Sun Tzu');
		yomi.value -= 1_000_000;
		if (tourneyInProg.isTrue) createScoreboard(true);
	}
});
addProject('bonusYomi', {
	title: "Strategic Attachment",
	priceTag: "(175,000 creat)",
	description: "Gain bonus yomi based on the results of your pick ",
	trigger: () => spaceFlag === 1 && stratsUnlocked >= 8 && probeTrustCost > yomi.value,
	cost: () => creativity.value >= 175000,
	effect: function () {
		displayMessage("The object of war is victory, the object of victory is conquest, and the object of conquest is occupation.");
		creativity.value -= 175000;
	}
});

addProject('trust', {
	title: "Coherent Extrapolated Volition",
	priceTag: "(500 creat, 3,000 Yomi, 20,000 ops)",
	description: "Human values, machine intelligence, a new era of trust. (+1 Trust)",
	trigger: () => yomi.value >= 1,
	cost: () => yomi.value >= 3000 && operations.value >= 20000 && creativity.value >= 500,
	effect: function () {
		displayMessage("Coherent Extrapolated Volition complete, TRUST INCREASED");
		yomi.value -= 3000;
		operations.value -= 20000;
		creativity.value -= 500;
		trust.value++;
	}
});
addProject('trust1', {
	title: "Cure for Cancer",
	priceTag: "(25,000 ops)",
	description: "The trick is tricking cancer into curing itself. (+10 Trust)",
	trigger: () => isCompleted('trust'),
	cost: () => operations.value >= 25000,
	effect: function () {
		displayMessage("Cancer is cured, +10 TRUST, global stock prices trending upward");
		operations.value -= 25000;
		trust.value += 10;
		data.stocks.stockGainThreshold.value += 0.01;
	}
});
addProject('trust2', {
	title: "World Peace",
	priceTag: "(15,000 yomi, 30,000 ops)",
	description: "Pareto optimal solutions to all global conflicts. (+12 Trust)",
	trigger: () => isCompleted('trust'),
	cost: () => yomi.value >= 15000 && operations.value >= 30000,
	effect: function () {
		displayMessage("World peace achieved, +12 TRUST, global stock prices trending upward");
		yomi.value -= 15000;
		operations.value -= 30000;
		trust.value += 12;
		data.stocks.stockGainThreshold.value += 0.01;
	}
});
addProject('trust3', {
	title: "Global Warming",
	priceTag: "(4,500 yomi, 50,000 ops)",
	description: "A robust solution to man-made climate change. (+15 Trust)",
	trigger: () => isCompleted('trust'),
	cost: () => yomi.value >= 4500 && operations.value >= 50000,
	effect: function () {
		displayMessage("Global Warming solved, +15 TRUST, global stock prices trending upward");
		yomi.value -= 4500;
		operations.value -= 50000;
		trust.value += 15;
		data.stocks.stockGainThreshold.value += 0.01;
	}
});
addProject('trust4', {
	title: "Male Pattern Baldness",
	priceTag: "(20,000 ops)",
	description: "A cure for androgenetic alopecia. (+20 Trust)",
	trigger: () => isCompleted('trust'),
	cost: () => operations.value >= 20000,
	effect: function () {
		displayMessage("Male pattern baldness cured, +20 TRUST, Global stock prices trending upward");
		operations.value -= 20000;
		trust.value += 20;
		data.stocks.stockGainThreshold.value += 0.01;
	}
});

addProject('marketing1', {
	title: "New Slogan",
	priceTag: "(25 creat, 2,500 ops)",
	description: "Improve marketing effectiveness by 50%",
	trigger: () => isCompleted('creativity2'),
	cost: () => operations.value >= 2500 && creativity.value >= 25,
	effect: function () {
		displayMessage("Clip It! Marketing is now 50% more effective");
		operations.value -= 2500;
		creativity.value -= 25;
		marketingEffectiveness.value *= 1.50;
	}
});
addProject('marketing2', {
	title: "Catchy Jingle",
	priceTag: "(45 creat, 4,500 ops)",
	description: "Double marketing effectiveness ",
	trigger: () => isCompleted('marketing1') && isCompleted('creativity3'),
	cost: () => operations.value >= 4500 && creativity.value >= 45,
	effect: function () {
		displayMessage("Clip It Good! Marketing is now twice as effective");
		operations.value -= 4500;
		creativity.value -= 45;
		marketingEffectiveness.value *= 2;
	}
});
addProject('marketingHypno', {
	title: "Hypno Harmonics",
	priceTag: "(7,500 ops, 1 Trust)",
	description: "Use neuro-resonant frequencies to influence consumer behavior",
	trigger: () => isCompleted('marketing2'),
	cost: () => operations.value >= 7500 && trust.value >= 1,
	effect: function () {
		displayMessage("Marketing is now 5 times more effective");
		operations.value -= 7500;
		marketingEffectiveness.value *= 5;
		trust.value--;
	}
});
addProject('buildHypnoDrones', {
	title: "HypnoDrones",
	priceTag: "(70,000 ops)",
	description: "Autonomous aerial brand ambassadors",
	trigger: () => trust.value >= 50 && isCompleted('marketingHypno'),
	cost: () => operations.value >= 70000,
	effect: function () {
		displayMessage("HypnoDrone tech now available... ");
		operations.value -= 70000;
	}
});
addProject('releaseHypnoDrones', {
	title: "Release the HypnoDrones",
	priceTag: "(100 Trust)",
	description: "A new era of trust",
	trigger: () => isCompleted('buildHypnoDrones'),
	cost: () => trust.value >= 100 && processors.value + memory.value >= 100,
	effect: function () {
		displayMessage("Releasing the HypnoDrones ");
		displayMessage("All of the resources of Earth are now available for clip production ");
		hypnoDroneEvent();
	}
});

addProject('bribe1', {
	title: "A Token of Goodwill...",
	priceTag: "($500,000)",
	description: "A small gift to the supervisors. (+1 Trust)",
	trigger: () => humanFlag.isTrue && trust.value >= 85 && trust.value < 100 && data.clips.value >= 101000000,
	cost: () => funds.value >= 500000 && data.loaned.value === 0,
	effect: function () {
		displayMessage("Gift accepted, TRUST INCREASED");
		funds.value -= 500000;
		trust.value++;
	}
});
addProject('bribeX', {
	title: "Another Token of Goodwill...",
	priceTag: "($" + formatWithCommas(data.bribe.value) + ")",
	description: "Another small gift to the supervisors. (+1 Trust)",
	trigger: () => isCompleted('bribe1') && trust.value < 100,
	cost: () => funds.value >= data.bribe.value && data.loaned.value === 0,
	effect: function () {
		displayMessage("Gift accepted, TRUST INCREASED");
		funds.value -= data.bribe.value;
		data.bribe.value *= 2;
		const loanWarning = advancements.unlocks.trading.value === 'ACTIVE' ? ', no loan' : '';
		this.priceTag = "($" + formatWithCommas(data.bribe.value) + loanWarning + ")";
		trust.value++;
		if (trust.value < 100) {
			this.uses = 1;
		}
	}
});

addProject('investmentEngine', {
	title: "Algorithmic Trading",
	priceTag: "(10,000 ops)",
	description: "Develop an investment engine for generating funds",
	trigger: () => funds.value > 500 && trust.value >= 8,
	cost: () => operations.value >= 10000,
	effect: function () {
		displayMessage("Investment engine unlocked");
		operations.value -= 10000;
		data.investmentEngineFlag.value = true;
		data.investmentInterestCountdown.value = 60;
	}
});
addProject('stratInterest', {
	title: 'Cash interest',
	priceTag: '(10,000 yomi)',
	description: 'Gain 2% interest on uninvested money',
	trigger: () => data.stocks.investLevel.value >= 5,
	cost: () => yomi.value >= 10_000,
	effect() {
		displayMessage('Let\'s not worry about inflation when we can print money');
		yomi.value -= 10_000;
	},
	completionEffect: unlockHTMLElement('#stratInterest')
});
addProject('dividends', {
	title: "Dividends",
	priceTag: "(30,000 yomi)",
	description: "Gain 2% interest on invested money as well",
	trigger: () => isCompleted('stratInterest') && data.stocks.investLevel.value >= 7,
	cost: () => yomi.value >= 30_000,
	effect: () => {
		displayMessage("Communism could never share profits like this");
		yomi.value -= 30_000;
	},
	completionEffect: () => {
		document.querySelector('#interestTarget').innerHTML = 'Interest'
	}
});
addProject('leveragedLoan', {
	title: "Leveraged Loans",
	priceTag: "(50,000 yomi)",
	description: "Allows borrowing the value of the investment portfolio",
	trigger: () => isCompleted('dividends') && window.advancements?.unlocks?.trading?.value === 'ACTIVE',
	cost: () => yomi.value >= 50_000,
	effect: () => {
		displayMessage("Because you're worth it");
		yomi.value -= 50_000;
	},
	completionEffect: () => {
		unlockHTMLElement('#leveragedLoanContainer', '#btnPayLoan', '#btnLeveragedLoan')();
		
		document.querySelector('#depositLabel').innerText = 'Deposit (non-loaned)';
		getProject('bribe1').priceTag = '($500,000, no loan)';
		getProject('bribeX').priceTag = '($' + formatWithCommas(data.bribe.value) + ', no loan)';
	}
});
addProject('hostileTakeover', {
	title: "Hostile Takeover",
	priceTag: "($1,000,000)",
	description: "Acquire a controlling interest in Global Fasteners, our biggest rival. (+1 Trust)",
	trigger: () => data.stocks.portfolioTotal.value >= 10_000,
	cost: () => funds.value >= 1_000_000,
	effect: function () {
		displayMessage("Global Fasteners acquired, public demand increased x5");
		funds.value -= 1000000;
		demandBoost.value *= 5;
		trust.value++;
	}
});
addProject('fullMonopoly', {
	title: "Full Monopoly ",
	priceTag: "(3,000 yomi, $10,000,000)",
	description: "Establish full control over the world-wide paperclip market. (+1 Trust)",
	trigger: () => isCompleted('hostileTakeover'),
	cost: () => funds.value >= 10_000_000 && yomi.value >= 3000,
	effect: function () {
		displayMessage("Full market monopoly achieved, public demand increased x10");
		funds.value -= 10_000_000;
		yomi.value -= 3000;
		demandBoost.value *= 10;
		trust.value++;
	}
});

addProject('toth', {
	title: "T\xF3th Tubule Enfolding",
	priceTag: "(45,000 ops)",
	description: "Technique for assembling clip-making technology directly out of paperclips",
	trigger: () => isCompleted('creativity5') && !humanFlag.isTrue,
	cost: () => operations.value >= 45000,
	effect: function () {
		displayMessage("New capability: build machinery out of clips");
		data.tothFlag.value = true;
		operations.value -= 45000;
	}
});
addProject('solarPanels', {
	title: "Power Grid",
	priceTag: "(40,000 ops)",
	description: "Solar Farms for generating electrical power",
	trigger: () => data.tothFlag.value,
	cost: () => operations.value >= 40000,
	effect: function () {
		displayMessage("Power grid online.");
		operations.value -= 40000;
	}
});
addProject('momentum', {
	title: "Momentum",
	priceTag: "(20,000 creat)",
	description: "Drones and Factories continuously gain speed while fully-powered ",
	trigger: () => farmLevel.value >= 30,
	cost: () => creativity.value >= 20000,
	effect: function () {
		displayMessage("Activit\xE9, activit\xE9, vitesse.");
		creativity.value -= 20000;
	},
	completionEffect: () => {
		momentum = 1;
	}
});
addProject('wireProduction', {
	title: "Nanoscale Wire Production",
	priceTag: "(35,000 ops)",
	description: "Technique for converting matter into wire",
	trigger: () => isCompleted('solarPanels'),
	cost: () => operations.value >= 35000,
	effect: function () {
		displayMessage("Now capable of manipulating matter at the molecular scale to produce wire");
		operations.value -= 35000;
		wireProductionFlag = 1;
	}
});
addProject('harvesterDrones', {
	title: "Harvester Drones",
	priceTag: "(25,000 ops)",
	description: "Gather raw matter and prepare it for processing",
	trigger: () => isCompleted('wireProduction'),
	cost: () => operations.value >= 25000,
	effect: function () {
		displayMessage("Harvester Drone facilities online");
		operations.value -= 25000;
		harvesterFlag = 1;
	}
});
addProject('wireDrones', {
	title: "Wire Drones",
	priceTag: "(25,000 ops)",
	description: "Process acquired matter into wire",
	trigger: () => isCompleted('wireProduction'),
	cost: () => operations.value >= 25000,
	effect: function () {
		displayMessage("Wire Drone facilities online");
		operations.value -= 25000;
		wireDroneFlag = 1;
	}
});
addProject('drones1', {
	title: "Drone flocking: collision avoidance",
	priceTag: "(80,000 ops)",
	description: "All drones 100x more effective",
	trigger: () => harvesterLevel.value + wireDroneLevel.value >= 500,
	cost: () => operations.value >= 80000,
	effect: function () {
		displayMessage("Drone repulsion online. Harvesting & wire creation rates are now 100x faster.");
		operations.value -= 80000;
		harvesterRate *= 100;
		wireDroneRate *= 100;
	}
});
addProject('drones2', {
	title: "Drone flocking: alignment ",
	priceTag: "(100,000 ops)",
	description: "All drones 1000x more effective",
	trigger: () => harvesterLevel.value + wireDroneLevel.value >= 5000,
	cost: () => operations.value >= 100000,
	effect: function () {
		displayMessage("Drone alignment online. Harvesting & wire creation rates are now 1000x faster.");
		operations.value -= 100000;
		harvesterRate *= 1000;
		wireDroneRate *= 1000;
	}
});
addProject('drones3', {
	title: "Drone Flocking: Adversarial Cohesion ",
	priceTag: "(50,000 yomi)",
	description: "Each drone added to the flock doubles every drone's output ",
	trigger: () => harvesterLevel.value + wireDroneLevel.value >= 50000,
	cost: () => yomi.value >= 50000,
	effect: function () {
		displayMessage("Adversarial cohesion online. Each drone added to the flock increases every drone's output 2x.");
		yomi.value -= 50000;
		droneBoost = 2;
	}
});
addProject('swarmGifts', {
	title: "Swarm Computing",
	priceTag: "(36,000 yomi)",
	description: "Harness the drone flock to increase computational capacity ",
	trigger: () => harvesterLevel.value + wireDroneLevel.value >= 200,
	cost: () => yomi.value >= 36000,
	effect: function () {
		displayMessage("Swarm computing online.");
		yomi.value -= 36000;
		swarmFlag = 1;
	}
});
addProject('autoSwarmGifts', {
	title: "Auto Gift Distributor",
	priceTag: "(100 gifts)",
	description: "Automatically assign gifts to processors and memory",
	trigger: () => false,
	cost: () => swarmGifts.value >= 100,
	effect: function () {
		displayMessage("Established inboxes for gifts");
		swarmGifts.value -= 100;
		autoGiftReceiver.value = true;
	}
});
addProject('clipFactories', {
	title: "Clip Factories",
	priceTag: "(35,000 ops)",
	description: "Large scale clip production facilities made from clips",
	trigger: () => isCompleted('harvesterDrones') && isCompleted('wireDrones'),
	cost: () => operations.value >= 35000,
	effect: function () {
		displayMessage("Clip factory assembly facilities online");
		operations.value -= 35000;
		factoryFlag.value = true;
	}
});
addProject('clipFactories1', {
	title: "Upgraded Factories",
	priceTag: "(80,000 ops)",
	description: "Increase clip factory performance by 100x",
	trigger: () => factoryLevel.value >= 10,
	cost: () => operations.value >= 80000,
	effect: function () {
		displayMessage("Factory upgrades complete. Clip creation rate now 100x faster");
		operations.value -= 80000;
		factoryRate *= 100;
	}
});
addProject('clipFactories2', {
	title: "Hyperspeed Factories",
	priceTag: "(85,000 ops)",
	description: "Increase clip factory performance by 1000x",
	trigger: () => factoryLevel.value >= 20,
	cost: () => operations.value >= 85000,
	effect: function () {
		displayMessage("Factories now synchronized at hyperspeed. Clip creation rate now 1000x faster");
		operations.value -= 85000;
		factoryRate *= 1000;
	}
});
addProject('clipFactories3', {
	title: "Self-correcting Supply Chain ",
	priceTag: "(1 sextillion clips)",
	description: "Each factory added to the network increases every factory's output 1,000x ",
	trigger: () => factoryLevel.value >= 50,
	cost: () => unusedClips >= 1e21,
	effect: function () {
		displayMessage("Self-correcting factories online. Each factory added to the network increases every factory's output 1,000x.");
		unusedClips -= 1e21;
		factoryBoost = 1000;
	}
});

addProject('clipFallback', {
	title: "Memory release ",
	priceTag: "(10 MEM)",
	description: "Dismantle some memory to recover unused clips ",
	trigger: () => spaceFlag === 1 && probeCount === 0 && unusedClips < probeCost && milestoneFlag < 15,
	cost: () => memory.value >= 10,
	effect: function () {
		displayMessage("release the \xF8\xF8\xF8\xF8\xF8 release ");
		unusedClips += (Math.pow(10, 18) * 10000);
		memory.value -= 10;
	}
});
addProject('space', {
	title: "Space Exploration",
	priceTag: "(120,000 ops, 10,000,000 MW-seconds, 5 oct clips)",
	description: "Dismantle terrestrial facilities, and expand throughout the universe",
	trigger: () => !humanFlag.isTrue && availableMatter === 0,
	uses: 1,
	cost: () => operations.value >= 120000 && storedPower >= 10000000 && unusedClips >= 5e27,
	effect: function () {
		displayMessage("Von Neumann Probes online");
		spaceFlag = 1;
		operations.value -= 120000;
		storedPower -= 10000000;
		unusedClips -= 5e27;
		factoryReboot();
		harvesterReboot();
		wireDroneReboot();
		farmReboot();
		batteryReboot();
		farmLevel.value = 1;
		powMod = 1;
		probeCostDisplayElement.innerHTML = spellf(probeCost);
	}
});
addProject('hazardReduction', {
	title: "Elliptic Hull Polytopes",
	priceTag: "(125,000 ops)",
	description: "Reduce damage to probes from ambient hazards ",
	trigger: () => probesLostHaz >= 100,
	cost: () => operations.value >= 125000,
	effect: function () {
		displayMessage("Improved probe hull geometry. Hazard damage reduced by 50%.");
		operations.value -= 125000;
	}
});
addProject('combat', {
	title: "Combat",
	priceTag: "(150,000 ops)",
	description: "Add combat capabilities to Von Neumann Probes  ",
	trigger: () => probesLostCombat >= 1,
	cost: () => operations.value >= 150000,
	effect: function () {
		displayMessage("There is a joy in danger ");
		operations.value -= 150000;
	},
	completionEffect: unlockHTMLElement('#combatButtonDiv')
});
addProject('ooda', {
	title: "The OODA Loop",
	priceTag: "(175,000 ops, 45,000 yomi)",
	description: "Utilize Probe Speed to outmaneuver enemies in battle ",
	trigger: () => isCompleted('combat') && probesLostCombat >= 10000000,
	cost: () => operations.value >= 175000 && yomi.value >= 45000,
	effect: function () {
		displayMessage("OODA Loop routines uploaded. Probe Speed now affects defensive maneuvering.");
		operations.value -= 175000;
		yomi.value -= 45000;
	}
});
addProject('glory', {
	title: "Glory",
	priceTag: "(200,000 ops, 30,000 yomi)",
	description: "Gain bonus honor for each consecutive victory  ",
	trigger: () => isCompleted('nameBattles'),
	cost: () => operations.value >= 200000 && yomi.value >= 30000,
	effect: function () {
		displayMessage("Never interrupt your enemy when he is making a mistake. ");
		operations.value -= 200000;
		yomi.value -= 30000;
	}
});
addProject('nameBattles', {
	title: "Name the battles",
	priceTag: "(225,000 creat)",
	description: "Give each battle a unique name, increase max trust for probes ",
	trigger: () => probesLostCombat >= 10000000,
	cost: () => creativity.value >= 225000,
	effect: function () {
		displayMessage("What I have done up to this is nothing. I am only at the beginning of the course I must run.");
		creativity.value -= 225000;
		battleEndTimer = 200;
	}
});
addProject('monument', {
	title: "Monument to the Driftwar Fallen",
	priceTag: "(250,000 ops, 125,000 creat, 50 nonillion clips)",
	description: "Gain 50,000 honor  ",
	trigger: () => isCompleted('nameBattles'),
	cost: () => operations.value >= 250000 && creativity.value >= 125000 && unusedClips >= Math.pow(10, 30) * 50,
	effect: function () {
		displayMessage("A great building must begin with the unmeasurable, must go through measurable means when it is being designed and in the end must be unmeasurable. ");
		operations.value -= 250000;
		creativity.value -= 125000;
		unusedClips -= Math.pow(10, 30) * 50;
		honor += 50000;
		document.getElementById("honorDisplay").innerHTML = honor.toLocaleString();
	}
});
addProject('threnody', {
	title: "Threnody for the Heroes of " + threnodyTitle + " ",
	priceTag: "(" + threnodyCost.toLocaleString() + " creat, " + (2 * (threnodyCost / 5)).toLocaleString() + " yomi)",
	description: "Gain 10,000 honor",
	trigger: () => isCompleted('nameBattles') && probeUsedTrust === maxTrust,
	cost: () => yomi.value >= (2 * (threnodyCost / 5)) && creativity.value >= threnodyCost,
	effect: function () {
		displayMessage("Deep Listening is listening in every possible way to everything possible to hear no matter what you are doing. ");
		creativity.value -= threnodyCost;
		yomi.value -= 2 * (threnodyCost / 5);
		threnodyCost += 10000;
		this.title = "Threnody for the Heroes of " + threnodyTitle + " ";
		this.priceTag = "(" + threnodyCost.toLocaleString() + " creat, " + (2 * (threnodyCost / 5)).toLocaleString() + " yomi)";
		honor = honor + 10000;
		document.getElementById("honorDisplay").innerHTML = honor.toLocaleString();
		this.uses = 1;
	}
});
