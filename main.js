"use strict";

/**
 * @type {{
 *   addTimer: function,
 *   addNamedTimer: function,
 *   removeNamedTimers: function
 * }}
 */
const timerHandler = new TimerHandler();

humanFlag.onFalse(() => {
	timerHandler.removeNamedTimers('humans');
	
	trust.value = 0;
	clipmakerLevel.value = 0;
	data.megaClipperLevel.value = 0;
	
	disableProject('bribe1');
	disableProject('bribeX');
	disableProject('creativityRedistribute');
	disableProject('stratInterest');
	disableProject('dividends');
	disableProject('hostileTakeover');
	disableProject('fullMonopoly');
});

class ManagedAudio {
	#fileInstances = [];
	#nextInstanceToPlay = 0;
	#lastPlayed;
	#cooldown;
	
	/**
	 * @param {() => HTMLAudioElement} audioProvider
	 * @param {number} cooldown
	 */
	constructor (audioProvider, cooldown) {
		if (cooldown < 1) throw new Error('Cooldown can not be less than 1 millisecond');
		this.#cooldown = cooldown;
		const audio = audioProvider();
		this.#fileInstances[0] = audio;
		audio.addEventListener("loadeddata", () => {
			const requiredInstances = Math.ceil(audio.duration * 1000 / cooldown);
			for (let i = 1; i < requiredInstances; i++) {
				this.#fileInstances.push(audioProvider());
			}
		});
	}
	
	play() {
		if (data.mute.isTrue) return;
		if (!this.#fileInstances[this.#nextInstanceToPlay].paused) return;
		const now = new Date().getTime();
		if (now - this.#lastPlayed < this.#cooldown) return;
		this.#lastPlayed = now;
		this.#fileInstances[this.#nextInstanceToPlay].play()
		this.#nextInstanceToPlay = (this.#nextInstanceToPlay + 1) % this.#fileInstances.length;
	}
}

const buttonSound = new ManagedAudio(() => {
	const audio = new Audio('button.mp3');
	audio.volume = 0.5;
	return audio;
}, 50);
document.querySelectorAll('button:not(.silent)').forEach(buttonSetup);

/**
 * @param {HTMLButtonElement} button
 */
function buttonSetup(button) {
	button.addEventListener('keydown', event => {
		if (event.key === 'Enter') {
			button.classList.add('enter');
			buttonSound.play();
		} else if (event.key === ' ') {
			buttonSound.play();
		}
	});
	button.addEventListener('keyup', event => {
		if (event.key === 'Enter') {
			button.classList.remove('enter');
		}
	});
	button.addEventListener('mousedown', () => {
		buttonSound.play();
	});
}
setInterval(() => document.querySelectorAll('.enter').forEach(el => el.classList.remove('enter')), 10e3);

// Cache all DOM elements
const mpdsDivElement = document.getElementById("mdpsDiv");
const swarmSliderDivElement = document.getElementById("swarmSliderDiv");
const clipCountCrunchedElement = document.getElementById("clipCountCrunched");
const wireBuyerDivElement = document.getElementById("wireBuyerDiv");
const increaseMaxTrustDivElement = document.getElementById("increaseMaxTrustDiv");
const honorDivElement = document.getElementById("honorDiv");
const drifterDivElement = document.getElementById("drifterDiv");
const battleCanvasDivElement = document.getElementById("battleCanvasDiv");
const factoryUpgradeDisplayElement = document.getElementById("factoryUpgradeDisplay");
const btnIncreaseMaxTrustElement = document.getElementById("btnIncreaseMaxTrust");
const btnMakerProbeElement = document.getElementById("btnMakeProbe");
const hazardBodyCountElement = document.getElementById("hazardBodyCount");
const probesLostHazardsDisplayElement = document.getElementById("probesLostHazardsDisplay");
const driftBodyCountElement = document.getElementById("driftBodyCount");
const combatBodyCountElement = document.getElementById("combatBodyCount");
const prestigeDivElement = document.getElementById("prestigeDiv");
const btnNewTournamentElement = document.getElementById("btnNewTournament");
const compDivElement = document.getElementById("compDiv");
const creativityDivElement = document.getElementById("creativityDiv");
const projectsDivElement = document.getElementById("projectsDiv");
const businessDivElement = document.getElementById("businessDiv");
const manufacturingDivElement = document.getElementById("manufacturingDiv");
const trustDivElement = document.getElementById("trustDiv");
const creationDivElement = document.getElementById("creationDiv");
const factoryDivElement = document.getElementById("factoryDiv");
const wireProductionDivElement = document.getElementById("wireProductionDiv");
const harvesterDivElement = document.getElementById("harvesterDiv");
const wireDroneDivElement = document.getElementById("wireDroneDiv");
const tothDivElement = document.getElementById("tothDiv");
const spaceDivElement = document.getElementById("spaceDiv");
const factoryDivSpaceElement = document.getElementById("factoryDivSpace");
const droneDivSpaceElement = document.getElementById("droneDivSpace");
const probeDesignDivElement = document.getElementById("probeDesignDiv");
const increaseProbeTrustDivElement = document.getElementById("increaseProbeTrustDiv");
const btnMakeFactoryElement = document.getElementById("btnMakeFactory");
const probeTrustUsedDisplayElement = document.getElementById("probeTrustUsedDisplay");
const btnIncreaseProbeTrustElement = document.getElementById("btnIncreaseProbeTrust");
const btnRaiseProbeSpeedElement = document.getElementById("btnRaiseProbeSpeed");
const btnLowerProbeSpeedElement = document.getElementById("btnLowerProbeSpeed");
const btnRaiseProbeNavElement = document.getElementById("btnRaiseProbeNav");
const btnLowerProbeNavElement = document.getElementById("btnLowerProbeNav");
const btnRaiseProbeRepElement = document.getElementById("btnRaiseProbeRep");
const btnLowerProbeRepElement = document.getElementById("btnLowerProbeRep");
const btnRaiseProbeHazElement = document.getElementById("btnRaiseProbeHaz");
const btnLowerProbeHazElement = document.getElementById("btnLowerProbeHaz");
const btnRaiseProbeFacElement = document.getElementById("btnRaiseProbeFac");
const btnLowerProbeFacElement = document.getElementById("btnLowerProbeFac");
const btnRaiseProbeHarvElement = document.getElementById("btnRaiseProbeHarv");
const btnLowerProbeHarvElement = document.getElementById("btnLowerProbeHarv");
const btnRaiseProbeWireElement = document.getElementById("btnRaiseProbeWire");
const btnLowerProbeWireElement = document.getElementById("btnLowerProbeWire");
const btnRaiseProbeCombatElement = document.getElementById("btnRaiseProbeCombat");
const btnLowerProbeCombatElement = document.getElementById("btnLowerProbeCombat");
const unusedClipsDisplayElement = document.getElementById("unusedClipsDisplay");
const driftersKilledElement = document.getElementById('driftersKilled');
const availableMatterDisplayElement = document.getElementById('availableMatterDisplay');
const honorDisplayElement = document.getElementById("honorDisplay");
const acquiredMatterDisplayElement = document.getElementById('acquiredMatterDisplay');
const probesBornDisplayElement = document.getElementById('probesBornDisplay');
const probesTotalDisplayElement = document.getElementById('probesTotalDisplay');
const probesLaunchedDisplayElement = document.getElementById('probesLaunchedDisplay');
const probeCostDisplayElement = document.getElementById('probeCostDisplay');
const probeCombatDisplayElement = document.getElementById('probeCombatDisplay');
const probeWireDisplayElement = document.getElementById('probeWireDisplay');
const probeHarvDisplayElement = document.getElementById('probeHarvDisplay');
const probeFacDisplayElement = document.getElementById('probeFacDisplay');
const probeRepDisplayElement = document.getElementById('probeRepDisplay');
const probeHazDisplayElement = document.getElementById('probeHazDisplay');
const probeNavDisplayElement = document.getElementById('probeNavDisplay');
const probeSpeedDisplayElement = document.getElementById('probeSpeedDisplay');
const probeTrustDisplayElement = document.getElementById('probeTrustDisplay');
const priceInputElement = document.getElementById("priceInput");
const prestigeScounterElement = document.getElementById("prestigeScounter");
const prestigeYcounterElement = document.getElementById("prestigeYcounter");
const newTourneyCostElement = document.getElementById("newTourneyCost");
const maxTrustDisplayElement = document.getElementById("maxTrustDisplay");
const victoryDivElement = document.getElementById("victoryDiv");
const probeTrustCostDisplayElement = document.getElementById("probeTrustCostDisplay");
const mapsElement = document.getElementById('maps');
const wppsElement = document.getElementById('wpps');
const swarmEngineElement = document.getElementById("swarmEngine");
const tourneyDisplayElement = document.getElementById("tourneyDisplay");
const nextFactoryUpgradeElement = document.getElementById("nextFactoryUpgrade");
const sliderElement = document.getElementById("slider");
const swarmSizeElement = document.getElementById("swarmSize");
const swarmStatusElement = document.getElementById("swarmStatus");
const giftCountdownElement = document.getElementById("giftCountdown");
const giftTimerElement = document.getElementById("giftTimer");
const swarmStatusDivElement = document.getElementById("swarmStatusDiv");
const powerProductionRateElement = document.getElementById("powerProductionRate");
const powerConsumptionRateElement = document.getElementById("powerConsumptionRate");
const storedPowerElement = document.getElementById("storedPower");
const facPowConRateElement = document.getElementById("facPowConRate");
const dronePowConRateElement = document.getElementById("dronePowConRate");
const maxStorageElement = document.getElementById("maxStorage");
const performanceElement = document.getElementById("performance");
const powerDivElement = document.getElementById("powerDiv");
const inchSpanElement = document.getElementById("inchSpan");
const avgSalesElement = document.getElementById("avgSales");
const avgRevElement = document.getElementById("avgRev");
const mdpsElement = document.getElementById('mdps');
const colonizedDisplayElement = document.getElementById('colonizedDisplay');
const probesLostDriftDisplayElement = document.getElementById('probesLostDriftDisplay');
const drifterCountElement = document.getElementById('drifterCount');
const swarmGiftDivElement = document.getElementById("swarmGiftDiv");
const clipmakerRate2Element = document.getElementById("clipmakerRate2");

const stratPickerElement = document.getElementById("stratPicker");
const qCompDisplayElement = document.getElementById("qCompDisplay");

// Wire --------------------------------------------------------

function adjustWirePrice() {
	wirePriceTimer++;
	
	if (wirePriceTimer > 250 && wireBasePrice > 15) {
		wireBasePrice *= 0.999;
		wirePriceTimer = 0;
	}
	
	if (Math.random() < 0.015) {
		wirePriceCounter++;
		const wireAdjust = 6 * Math.sin(wirePriceCounter);
		wireCost.value = Math.ceil(wireBasePrice + wireAdjust);
	}
}

function buyWire() {
	if (funds.value < wireCost.value) return;
	wirePriceTimer = 0;
	wire.value += wireSupply;
	funds.value -= wireCost.value;
	wirePurchase++;
	wireBasePrice += .05;
	if (wire.value === wireSupply) {
		updateHumanClipMakerRate();
	}
}

// QCHIPS -----------------------------------------------------------

/** @type {{waveSeed: number, value: number, active: number}[]} */
let qChips = [];
/** @type {HTMLElement[]} */
const qChipsElements = [];

for (let i = 0; i < 10; i++) {
	qChips.push({
		waveSeed: 0.1 * (i + 1),
		value: 0,
		active: 0
	});
	const qchipElement = document.getElementById(`qChip${i}`);
	qChipsElements.push(qchipElement);
	qchipElement.style.opacity = '0';
}

const qChipContainer = document.querySelector('.qchips');
data.observeQuantum.onFalse(() => qChipContainer.classList.add('blur'));
data.observeQuantum.onTrue(() => {
	for (let i = 0; i < qChips.length; i++) {
		qChipsElements[i].style.opacity = String(qChips[i].value);
	}
	qChipContainer.classList.remove('blur');
});
data.observeQuantum.onChange(updateElement('#btnQFreeze h3', value => value ? 'Stop observing' : 'Observe'))

let autoUnobserved = false;
function quantumCycle() {
	if (data.observeQuantum.isFalse) {
		return;
	}
	qClock += .01;
	if (isCompleted('qObserving') && qClock / Math.PI % 20 < 1) {
		if (advancements.noQuantum.value === 'ACTIVE' && !autoUnobserved) {
			autoUnobserved = true;
			data.observeQuantum.value = false;
			return;
		}
	} else {
		autoUnobserved = false;
	}
	for (let i = 0; i < qChips.length; i++) {
		if (qChips[i].active === 0) break;
		qChips[i].value = Math.sin(qClock * qChips[i].waveSeed * qChips[i].active);
		qChipsElements[i].style.opacity = String(qChips[i].value);
	}
}

function qComp() {
	qCompDisplayElement.classList.add('show');
	setTimeout(() => qCompDisplayElement.classList.remove('show'), 10);
	data.observeQuantum.value = true;
	if (qChips[0].active === 0) {
		qCompDisplayElement.innerHTML = "Need Photonic Chips";
		return;
	}
	data.advancementTracking.usedQuantum.value = true;
	const totalQValue = qChips.reduce((acc, curr) => acc + curr.value, 0) * 360;
	qCompDisplayElement.innerHTML = "qOps: " + formatWithCommas(Math.ceil(totalQValue));
	const capacity = memory.value * 1000;
	if (operations.value + totalQValue > capacity) {
		const withinCapacity = Math.max(0, capacity - operations.value);
		const currentlyAboveCapacity = Math.max(0, operations.value - capacity);
		const damper = 5 + currentlyAboveCapacity / 100;
		operations.value += withinCapacity + (totalQValue - withinCapacity) / damper;
	} else {
		operations.value += totalQValue;
	}
	if (totalQValue > 0) data.operationsNormalizer = -100;
}

//  HYPNODRONE EVENT ----------------------------------------------------------------

function hypnoDroneEvent() {
	const overlay = document.getElementById("hypnoDroneEventDiv");
	const hypnoText = document.getElementById('hypnoText');
	hypnoText.innerText = 'release';
	overlay.classList.add('release');
	let circle = document.createElement('div');
	circle.classList.add('circle');
	circle.style.animationDelay = 5 + 's';
	overlay.appendChild(circle);
	setTimeout(() => hypnoText.innerText = 'the', 10000);
	circle = document.createElement('div');
	circle.classList.add('circle');
	circle.style.animationDelay = 10 + 's';
	overlay.appendChild(circle);
	setTimeout(() => hypnoText.innerText = 'hypnodrones', 15000);
	for (let i = 0; i < 15; i++) {
		const circle = document.createElement('div');
		circle.classList.add('circle');
		circle.style.animationDelay = 15 + i * 0.5 + 's';
		overlay.appendChild(circle);
	}
	setTimeout(() => overlay.classList.add('released'), 20000);
	setTimeout(() => overlay.classList.remove('release'), 21000);
	setTimeout(() => humanFlag.value = false, 5000);
}


//  MESSAGES ------------------------------------------------------------------------

function displayMessage(msg) {
	terminal.print(msg);
}

spy(10, () => swarmFlag, value => {
	if (value === 0) {
		swarmEngineElement.style.display = "none";
		swarmGiftDivElement.style.display = "none";
		swarmSliderDivElement.style.display = 'none';
	} else {
		swarmEngineElement.style.display = "";
		swarmGiftDivElement.style.display = "";
		swarmSliderDivElement.style.display = '';
	}
});

spy(10, () => wireProductionFlag, value => {
	if (value === 0) {
		wireProductionDivElement.style.display = "none";
	} else {
		wireProductionDivElement.style.display = "";
	}
});

spy(10, () => spaceFlag, value => {
	if (value === 0) {
		spaceDivElement.style.display = "none";
		factoryDivSpaceElement.style.display = "none";
		droneDivSpaceElement.style.display = "none";
		probeDesignDivElement.style.display = "none";
		increaseProbeTrustDivElement.style.display = "none";
	} else {
		spaceDivElement.style.display = "";
		factoryDivSpaceElement.style.display = "";
		droneDivSpaceElement.style.display = "";
		probeDesignDivElement.style.display = "";
		increaseProbeTrustDivElement.style.display = "";
		factoryDivElement.style.display = "none";
	}
});

data.projectsFlag.onChange(value => {
	projectsDivElement.style.display = value ? '' : "none";
});
data.compFlag.onChange(value => {
	compDivElement.style.display = value ? '' : "none";
});

function buttonUpdate() {
	
	powerDivElement.style.display = isCompleted('solarPanels') && spaceFlag === 0 ? "" : "none";
	mpdsDivElement.style.display = spaceFlag === 0 ? "none" : "";
	wireBuyerDivElement.style.display = wireBuyerFlag === 1 ? "" : "none";
	
	if (!tourneyInProg.isTrue && autoTourneyFlag.isTrue && autoTourneyStatus.isTrue) {
		resultsTimer++;
		
		if (resultsTimer >= 300 && operations.value >= tourneyCost) {
			newTourney();
			resultsTimer = 0;
		}
	}
	
	if (isCompleted('nameBattles')) {
		increaseMaxTrustDivElement.style.display = "";
		honorDivElement.style.display = "";
	} else {
		increaseMaxTrustDivElement.style.display = "none";
		honorDivElement.style.display = "none";
	}
	
	if (battleFlag === 0) {
		drifterDivElement.style.display = "none";
		battleCanvasDivElement.style.display = "none";
	} else {
		drifterDivElement.style.display = "";
		battleCanvasDivElement.style.display = "";
	}
	
	factoryUpgradeDisplayElement.style.display = isCompleted('clipFactories') && maxFactoryLevel < 50 ? "" : "none";
	
	btnIncreaseMaxTrustElement.disabled = honor < maxTrustCost;
	
	btnMakerProbeElement.disabled = unusedClips < probeCost;
	
	if (probesLostHaz < 1) {
		hazardBodyCountElement.style.display = "none";
	} else {
		hazardBodyCountElement.style.display = "";
		
		probesLostHazardsDisplayElement.innerHTML = spellf(probesLostHaz);
		
	}
	
	if (probesLostDrift < 1) {
		driftBodyCountElement.style.display = "none";
	} else {
		driftBodyCountElement.style.display = "";
	}
	
	if (probesLostCombat < 1) {
		combatBodyCountElement.style.display = "none";
	} else {
		combatBodyCountElement.style.display = "";
	}
	
	if (prestigeU.value < 1 && prestigeS < 1 && prestigeY < 1) {
		prestigeDivElement.style.display = "none";
	} else {
		prestigeDivElement.style.display = "";
	}
	
	btnNewTournamentElement.disabled = operations.value < tourneyCost || tourneyInProg.isTrue;
	
	
	creativityDivElement.style.display = creativityOn === 0 ? "none" : "";
	
	harvesterDivElement.style.display = harvesterFlag === 0 ? "none" : "";
	wireDroneDivElement.style.display = wireDroneFlag === 0 ? "none" : "";
	
	if (spaceFlag === 1) {
		harvesterDivElement.style.display = "none";
		wireDroneDivElement.style.display = "none";
	}
	
	btnMakeFactoryElement.disabled = unusedClips < factoryCost.value;


// PROBE DESIGN
	probeUsedTrust = (probeSpeed + probeNav + probeRep + probeHaz + probeFac + probeHarv + probeWire + probeCombat);
	probeTrustUsedDisplayElement.innerHTML = probeUsedTrust;
	btnIncreaseProbeTrustElement.disabled = yomi.value < probeTrustCost || probeTrust >= maxTrust;
	btnRaiseProbeSpeedElement.disabled = probeTrust - probeUsedTrust < 1;
	btnLowerProbeSpeedElement.disabled = probeSpeed < 1;
	btnRaiseProbeNavElement.disabled = probeTrust - probeUsedTrust < 1;
	btnLowerProbeNavElement.disabled = probeNav < 1;
	btnRaiseProbeRepElement.disabled = probeTrust - probeUsedTrust < 1;
	btnLowerProbeRepElement.disabled = probeRep < 1;
	btnRaiseProbeHazElement.disabled = probeTrust - probeUsedTrust < 1;
	btnLowerProbeHazElement.disabled = probeHaz < 1;
	btnRaiseProbeFacElement.disabled = probeTrust - probeUsedTrust < 1;
	btnLowerProbeFacElement.disabled = probeFac < 1;
	btnRaiseProbeHarvElement.disabled = probeTrust - probeUsedTrust < 1;
	btnLowerProbeHarvElement.disabled = probeHarv < 1;
	btnRaiseProbeWireElement.disabled = probeTrust - probeUsedTrust < 1;
	btnLowerProbeWireElement.disabled = probeWire < 1;
	btnRaiseProbeCombatElement.disabled = probeTrust - probeUsedTrust < 1;
	btnLowerProbeCombatElement.disabled = probeCombat < 1;
}

humanFlag.onTrue(() => {
	businessDivElement.style.display = "";
	manufacturingDivElement.style.display = "";
	trustDivElement.style.display = "";
	creationDivElement.style.display = "none";
});
humanFlag.onFalse(() => {
	businessDivElement.style.display = "none";
	manufacturingDivElement.style.display = "none";
	trustDivElement.style.display = "none";
	data.investmentEngineFlag.value = false;
	wireBuyerFlag = 0;
	creationDivElement.style.display = "";
});

function clipClick(number) {
	if (number > wire.value) {
		number = wire.value;
	}
	if (number <= 0) return;
	
	data.clips.value += number;
	wire.value -= number;
	unusedClips += number;
	
	if (humanFlag.isTrue) {
		data.unsoldClips.value += number;
	} else {
		unusedClipsDisplayElement.innerHTML = spellf(unusedClips);
	}
	
}

function makeClipper() {
	if (funds.value < clipmakerAmount_clipperCost.value) return;
	funds.value -= clipmakerAmount_clipperCost.value;
	clipmakerLevel.value++;
}

function makeMegaClipper() {
	if (funds.value < megaClipperCost.value) return;
	funds.value -= megaClipperCost.value;
	data.megaClipperLevel.value++;
}

let maxFactoryLevel = 0;

function updateUpgrades() {
	let nextFactoryUp = 0;
	
	if (maxFactoryLevel < 10) {
		nextFactoryUp = 10;
	} else if (maxFactoryLevel < 20) {
		nextFactoryUp = 20;
	} else if (maxFactoryLevel < 50) {
		nextFactoryUp = 50;
	}
	
	nextFactoryUpgradeElement.innerHTML = formatWithCommas(nextFactoryUp);
}


function makeFactory() {
	if (unusedClips < factoryCost.value) return;
	unusedClips -= factoryCost.value;
	factoryBill.value += factoryCost.value;
	unusedClipsDisplayElement.innerHTML = spellf(unusedClips);
	factoryLevel.value++;
	let fcmod;
	if (factoryLevel.value < 8) {
		fcmod = 11 - factoryLevel.value;
	} else if (factoryLevel.value < 13) {
		fcmod = 2;
	} else if (factoryLevel.value < 20) {
		fcmod = 1.5;
	} else if (factoryLevel.value < 39) {
		fcmod = 1.25;
	} else if (factoryLevel.value < 79) {
		fcmod = 1.15;
	} else {
		fcmod = 1.10;
	}
	if (factoryLevel.value > maxFactoryLevel) {
		maxFactoryLevel = factoryLevel.value;
	}
	updateUpgrades();
	factoryCost.value *= fcmod;
}

const unusedClipsSpy = spy(10, () => unusedClips);

function updateDroneButtons() {
}

function harvesterReboot() {
	harvesterLevel.value = 0;
	unusedClips += harvesterBill.value;
	harvesterBill.value = 0;
	unusedClipsDisplayElement.innerHTML = spellf(unusedClips);
}

function wireDroneReboot() {
	wireDroneLevel.value = 0;
	unusedClips += wireDroneBill.value;
	wireDroneBill.value = 0;
	unusedClipsDisplayElement.innerHTML = spellf(unusedClips);
}

function factoryReboot() {
	factoryLevel.value = 0;
	unusedClips += factoryBill.value;
	factoryBill.value = 0;
	unusedClipsDisplayElement.innerHTML = spellf(unusedClips);
	factoryCost.value = 100000000;
}

// SWARM

let giftBits = 0;
let giftBitGenerationRate = 0;

function updateSwarm() {
	if (swarmFlag === 1) {
		sliderPos = sliderElement.value;
	}

	const droneTotal = Math.floor(harvesterLevel.value + wireDroneLevel.value);
	
	swarmSizeElement.innerHTML = spellf(droneTotal);
	
	if (droneTotal > 0 && giftCountdown <= 0) {
		const nextGift = Math.max(1, Math.round((Math.log10(droneTotal)) * sliderPos / 100));
		if (swarmGifts.value >= 10) {
			savelyMakeProjectAvailable('autoSwarmGifts')
		}
		const receivers = processorGiftReceiver.isTrue + memoryGiftReceiver.isTrue;
		if (receivers > 0) {
			const toDistribute = nextGift + swarmGifts.value;
			if (processorGiftReceiver.isTrue) {
				processors.value += Math.floor(toDistribute / receivers);
			}
			if (memoryGiftReceiver.isTrue) {
				memory.value += Math.floor(toDistribute / receivers);
			}
			swarmGifts.value = toDistribute % receivers;
		} else {
			swarmGifts.value += nextGift;
		}
		if (milestoneFlag < 15 && receivers === 0) {
			displayMessage("The swarm has generated a gift of " + nextGift + " additional computational capacity");
		}
		giftBits = 0;
	}
	
	
	if (powMod === 0) {
		swarmStatus = 6;
	} else {
		swarmStatus = 0;
	}
	
	if (spaceFlag === 1 && !isCompleted('rebootSwarm')) {
		swarmStatus = 9;
	}
	
	if (droneTotal === 0) {
		swarmStatus = 7;
	} else if (droneTotal === 1) {
		swarmStatus = 8;
	}
	
	if (swarmFlag === 0) {
		swarmStatus = 6;
	}
	
	if (disorgFlag === 1) {
		swarmStatus = 5;
	}
	
	
	if (swarmStatus === 0) {
		
		//       THE OLD WAY
		//      elapsedTime = elapsedTime + 1;
		//      giftCountdown = ((giftPeriod/Math.log(d)) / (sliderPos/100)) - elapsedTime;


//      THE NEW WAY
		giftBitGenerationRate = Math.log(droneTotal) * (sliderPos / 100);
		giftBits += giftBitGenerationRate;
		giftCountdown = (giftPeriod - giftBits) / giftBitGenerationRate;
		
		swarmStatusElement.innerHTML = "Active";
		giftCountdownElement.innerHTML = timeCruncher(giftCountdown);
		giftTimerElement.style.display = "";
	} else {
		giftTimerElement.style.display = "none";
	}

	if (swarmStatus === 6) {
		swarmStatusElement.innerHTML = "Sleeping";
	}
	
	if (swarmStatus === 7) {
		swarmStatusDivElement.style.display = "none";
	} else {
		swarmStatusDivElement.style.display = "";
	}
	
	if (swarmStatus === 8) {
		swarmStatusElement.innerHTML = "Lonely";
	}
	
	if (swarmStatus === 9) {
		swarmStatusElement.innerHTML = "NO RESPONSE...";
	}
	
	
}

// POWER

/**
 * @param {number} currentAmount
 * @param {number} startingCost
 * @param {number} growthRate
 * @param {number} multiplier
 * @param {ObservableValue} cost1
 * @param {[{amount: ObservableValue, cost: ObservableValue}, {amount: ObservableValue, cost: ObservableValue}]} labeledButtons
 */
function fillCosts(currentAmount, startingCost, growthRate, multiplier, cost1, labeledButtons) {
	if (spaceFlag === 1) return;
	let sum = currentAmount === 0 ? startingCost : Math.pow(currentAmount + 1, growthRate) * multiplier;
	cost1.value = sum;
	let calculatedAmount = currentAmount + 1;
	const goals = logSteps(currentAmount);
	for (let i = 0; i < goals.length; i++) {
		const toAdd = goals[i];
		labeledButtons[i].amount.value = toAdd;
		const end = toAdd + currentAmount;
		while (calculatedAmount < end) {
			sum += Math.pow(++calculatedAmount, growthRate) * multiplier;
		}
		labeledButtons[i].cost.value = sum;
	}
}

/**
 * @param currentAmount {number}
 * @return {[number, number]}
 */
function logSteps(currentAmount) {
	const largeGoal = Math.max(100, Math.pow(10, Math.floor(Math.log10(currentAmount))));
	const smallGoal = largeGoal / 10;
	let neededForLargeGoal = largeGoal - currentAmount % largeGoal;
	let neededForSmallGoal = smallGoal - currentAmount % smallGoal;
	if (neededForSmallGoal === neededForLargeGoal) {
		neededForLargeGoal += largeGoal;
	}
	if (neededForSmallGoal === 1) {
		neededForSmallGoal += smallGoal;
	}
	return [neededForSmallGoal, neededForLargeGoal];
}

function farmReboot() {
	farmLevel.value = 0;
	unusedClips += farmBill.value;
	unusedClipsDisplayElement.innerHTML = spellf(unusedClips);
	farmBill.value = 0;
}

function batteryReboot() {
	storedPower = 0;
	batteryLevel.value = 0;
	unusedClips += batteryBill.value;
	unusedClipsDisplayElement.innerHTML = spellf(unusedClips);
	batteryBill.value = 0;
}

function updatePower() {
	if (!humanFlag.isTrue && spaceFlag !== 0) return;
	
	const supply = farmLevel.value / 2;
	const dDemand = (harvesterLevel.value * 0.01) + (wireDroneLevel.value * 0.01);
	const fDemand = (factoryLevel.value * 2);
	const demand = dDemand + fDemand;
	const cap = batteryLevel.value * 10_000;
	
	if (supply >= demand) {
		let xsSupply = supply - demand;
		if (storedPower < cap) {
			if (xsSupply > cap - storedPower) {
				xsSupply = cap - storedPower;
			}
			storedPower = storedPower + xsSupply;
		}
		
		if (powMod < 1) {
			powMod = 1;
		}
		
		if (momentum === 1) {
			powMod += .0005;
		}
	} else if (supply < demand) {
		let xsDemand = demand - supply;
		if (storedPower > 0) {
			if (storedPower >= xsDemand) {
				if (momentum === 1) {
					powMod += .0005;
				}
				storedPower = storedPower - xsDemand;
			} else if (storedPower < xsDemand) {
				xsDemand = xsDemand - storedPower;
				storedPower = 0;
				let nuSupply = supply - xsDemand;
				powMod = nuSupply / demand;
			}
		} else if (storedPower <= 0) {
			powMod = supply / demand;
		}
	}
	
	powerProductionRateElement.innerHTML = formatWithCommas(Math.round(supply * 100));
	powerConsumptionRateElement.innerHTML = formatWithCommas(Math.round(demand * 100));
	storedPowerElement.innerHTML = formatWithCommas(Math.round(storedPower));
	facPowConRateElement.innerHTML = formatWithCommas(Math.round(fDemand * 100));
	dronePowConRateElement.innerHTML = formatWithCommas(Math.round(dDemand * 100));
	maxStorageElement.innerHTML = formatWithCommas(Math.round(cap));
	
	if (factoryLevel.value === 0 && harvesterLevel.value === 0 && wireDroneLevel.value === 0) {
		performanceElement.innerHTML = '0';
	} else {
		performanceElement.innerHTML = formatWithCommas(Math.round(powMod * 100));
	}
}


function buyAds() {
	if (funds.value < marketingLvl_adCost.value) return;
	funds.value -= marketingLvl_adCost.value;
	marketingLvl.value++;
}

function sellClips(clipsDemanded) {
	if (data.unsoldClips.value === 0) return;
	const soldClips = Math.min(data.unsoldClips.value, clipsDemanded);
	const revenue = Math.floor(soldClips * margin.value * 100) / 100;
	funds.value = Math.floor((funds.value + revenue) * 100) / 100;
	income += revenue;
	clipsSold += soldClips;
	data.unsoldClips.value -= soldClips;
}

function editPrice(amount) {
	priceInputElement.value = margin.value + amount;
	updatePrice(priceInputElement);
}

function updatePrice(element) {
	const cents = Math.max(1, Math.round(element.value * 100));
	margin.value = cents / 100;
	
	const formatted = ("" + cents).padStart(3, "0");
	const dotPos = formatted.length - 2;
	element.value = formatted.substring(0, dotPos) + "." + formatted.substring(dotPos);
	element.style.width = element.value.length + "ch"
}

function updateStats() {
	inchSpanElement.innerHTML = wire.value === 1 ? "inch" : "inches";
	clipmakerRate2Element.innerHTML = spellf(measuredClipRate);
}

class CpsTracker {
	/**
	 * @param {number} windowSize
	 * @param {() => void} whileActive
	 */
	constructor(windowSize, whileActive) {
		this.clicks = [];
		this.windowSize = windowSize;
		this.playerClipRateUpdater = null;
		this.whileActive = whileActive;
	}
	
	click() {
		this.clicks.push(Date.now());
		this.playerClipRateUpdater ??= setInterval(() => {
			this.whileActive();
			if (this.clicks.length === 0) {
				clearInterval(this.playerClipRateUpdater);
				this.playerClipRateUpdater = null;
			}
		}, 100);
	}
	
	getCps() {
		if (this.clicks.length === 0) return 0;
		const threshold = Date.now() - this.windowSize;
		let i = 0;
		while (i < this.clicks.length && this.clicks[i] < threshold) {
			i++;
		}
		if (i > 0) this.clicks.splice(0, i);
		return this.clicks.length;
	}
}
const playerClipRate = new CpsTracker(1000, updateHumanClipMakerRate);
function playerClipClick() {
	playerClipRate.click();

	clipClick(1);
	updateHumanClipMakerRate();
}

const clipRate = ObservableValue.new(0, updateElement('#clipmakerRate', formatWithCommas));
ObservableValue.onAnyChange([clipmakerLevel, data.clipperBoost, data.megaClipperLevel, data.megaClipperBoost],
	updateHumanClipMakerRate);
wire.onChange(wire => {if (wire === 0) updateHumanClipMakerRate();});
function updateHumanClipMakerRate() {
	if (wire.value === 0) {
		clipRate.value = 0;
		return;
	}
	const per10Milliseconds = data.clipperBoost.value * (clipmakerLevel.value / 100)
		+ data.megaClipperBoost.value * (data.megaClipperLevel.value * 5);
	clipRate.value = per10Milliseconds * 100 + playerClipRate.getCps();
}

humanFlag.onTrue(() => timerHandler.addNamedTimer('humans', 1000, calculateRev));
const avgSales = ObservableValue.new(0, value => {
	avgSalesElement.innerHTML = formatWithCommas(Math.round(value))
	const avgRev = value * margin.value;
	avgRevElement.innerHTML = formatWithCommas(avgRev, 2);
});
ObservableValue.onAnyChange([demand, clipRate], calculateRev);
data.unsoldClips.onChange(value => {if (value === 0) calculateRev();});
function calculateRev() {
	const per100Milliseconds = Math.floor(0.7 * Math.pow(demand.value, 1.15));
	const occurrencePerSecond = Math.min(1, demand.value / 100) * 10;
	
	avgSales.value = Math.min(Math.max(clipRate.value, data.unsoldClips.value), occurrencePerSecond * per100Milliseconds);
}

const creativityThreshold = 400;
function calculateCreativity() {
	creativityCounter++;
	
	const s = prestigeS / 10;
	const ss = creativitySpeed + (creativitySpeed * s);
	const creativityCheck = creativityThreshold / ss;
	
	if (creativityCounter >= creativityCheck) {
		
		if (creativityCheck >= 1) {
			creativity.value++;
		}
		
		if (creativityCheck < 1) {
			creativity.value += ss / creativityThreshold;
		}
		
		creativityCounter = 0;
	}
}

function resetPrestige() {
	prestigeU.value = 0;
	prestigeS = 0;
	prestigeY = 0;
	
	localStorage.removeItem("savePrestige");
}

function cheatPrestigeU() {
	prestigeU.value++;
	savePrestige();
}

function cheatPrestigeS() {
	prestigeS++;
	savePrestige();
}

function cheatClips() {
	data.clips.value += 100_000_000;
	unusedClips += 100_000_000;
}

function cheatMoney() {
	funds.value += 1e9;
}

function cheatOperations() {
	operations.value = 1e9;
	data.operationsNormalizer = -100;
}

function cheatCreativity() {
	creativityOn = 1;
	if (humanFlag.value) {
		creativity.value += 50_000;
	} else {
		creativity.value += 1e9;
	}
}

function cheatYomi() {
	yomi.value += 1e9;
}

function cheatHuman() {
	cheatProject('revTracker');
	cheatProject('wireBuyer');
	cheatProject('creativity');
	cheatProject('creativity1');
	cheatProject('creativity2');
	cheatProject('creativity3');
	cheatProject('creativity4');
	cheatProject('creativity5');
	cheatProject('creativity6');
	cheatProject('trust');
	cheatProject('trust1');
	cheatProject('trust2');
	cheatProject('trust3');
	cheatProject('trust4');
	cheatProject('marketing1');
	cheatProject('marketing2');
	cheatProject('marketingHypno');
	cheatProject('quantumComputing');
	cheatProject('qChip');
	qChips.forEach(qChip => qChip.active = 1);
	cheatProject('qObserving');
	cheatProject('strategyEngine');
	cheatProject('buildHypnoDrones');
	cheatProject('releaseHypnoDrones');
	data.compFlag.value = true;
	data.projectsFlag.value = true;
	humanFlag.value = false;
	trust.value = 100;
	if (processors.value < 20 && memory.value < 80) {
		processors.value = 20;
		memory.value = 80;
	}
	operations.value = memory.value * 1000;
	creativity.value = Math.max(20_000, creativity.value);
	data.clips.value = Math.max(300_000_000, data.clips.value);
	unusedClips=Math.max(300000000, unusedClips);
	unusedClipsDisplayElement.innerHTML = formatWithCommas(unusedClips);
	yomi.value = Math.max(50_000, yomi.value);
	displayMessage('Skipping past humanity')
}

function zeroMatter() {
	availableMatter = 0;
	displayMessage("you just cheated");
}

function calculateTrust() {
	if (data.clips.value >= nextTrust.value) {
		trust.value++;
		displayMessage("Production target met: TRUST INCREASED, additional processor/memory capacity granted");
		const fibNext = fib1 + fib2;
		nextTrust.value = fibNext * 1000;
		fib1 = fib2;
		fib2 = fibNext;
	}
}

processors.onChange((processors) => creativitySpeed = Math.max(1, Math.log10(processors) * Math.pow(processors, 1.1) + processors - 1));
function addProc() {
	if (trust.value > 0 || swarmGifts.value > 0) {
		processors.value++;
		if (creativityOn === 1) {
			displayMessage("Processor added, operations (or creativity) per sec increased")
		} else {
			displayMessage("Processor added, operations per sec increased")
		}
		if (!humanFlag.isTrue) {
			swarmGifts.value--;
		}
	}
}

function addMem() {
	if (trust.value > 0 || swarmGifts.value > 0) {
		displayMessage("Memory added, max operations increased");
		memory.value++;
		if (!humanFlag.isTrue) {
			swarmGifts.value--;
		}
	}
}

function updateOperations() {
	if (!data.compFlag.value) return;
	const capacity = memory.value * 1000;
	if (operations.value === capacity) return;
	if (operations.value < capacity) {
		operations.value = Math.min(capacity, operations.value + processors.value / 10);
	} else if (operations.value - capacity < data.operationsNormalizer) {
		operations.value = capacity;
		data.operationsNormalizer = 0;
	} else {
		operations.value -= Math.max(0, data.operationsNormalizer);
		data.operationsNormalizer += 0.1;
	}
}

function milestoneCheck() {
	if (milestoneFlag === 0 && funds.value >= 5) {
		milestoneFlag = 1;
		if (advancements.beg.value !== 'ACTIVE') {
			displayMessage('AutoClippers available for purchase');
		}
	}
	
	if (milestoneFlag === 1 && Math.ceil(data.clips.value) >= 500) {
		milestoneFlag = 2;
		displayMessage("500 clips created in " + timeCruncher(ticks));
	}
	if (milestoneFlag === 2 && Math.ceil(data.clips.value) >= 1000) {
		milestoneFlag = 3;
		displayMessage("1,000 clips created in " + timeCruncher(ticks));
	}
	
	// Unlocking projects
	if (!data.compFlag.value) {
		if (Math.ceil(data.clips.value) >= 2000
			|| (data.unsoldClips.value < 1 && funds.value < wireCost.value && wire.value < 1)) {
			data.compFlag.value = true;
			data.projectsFlag.value = true;
			displayMessage("Trust-Constrained Self-Modification enabled");
		}
	}
	
	if (milestoneFlag === 3 && Math.ceil(data.clips.value) >= 10000) {
		milestoneFlag = 4;
		displayMessage("10,000 clips created in " + timeCruncher(ticks));
	}
	if (milestoneFlag === 4 && Math.ceil(data.clips.value) >= 100000) {
		milestoneFlag = 5;
		displayMessage("100,000 clips created in " + timeCruncher(ticks));
	}
	if (milestoneFlag === 5 && Math.ceil(data.clips.value) >= 1000000) {
		milestoneFlag = 6;
		displayMessage("1,000,000 clips created in " + timeCruncher(ticks));
	}
	
	if (milestoneFlag === 6 && isCompleted('releaseHypnoDrones')) {
		milestoneFlag = 7;
		displayMessage("Full autonomy attained in " + timeCruncher(ticks));
	}
	
	if (milestoneFlag === 7 && Math.ceil(data.clips.value) >= 1000000000000) {
		milestoneFlag = 8;
		displayMessage("One Trillion Clips Created in " + timeCruncher(ticks));
	}
	
	if (milestoneFlag === 8 && Math.ceil(data.clips.value) >= 1000000000000000) {
		milestoneFlag = 9;
		displayMessage("One Quadrillion Clips Created in " + timeCruncher(ticks));
	}
	
	if (milestoneFlag === 9 && Math.ceil(data.clips.value) >= 1000000000000000000) {
		milestoneFlag = 10;
		displayMessage("One Quintillion Clips Created in " + timeCruncher(ticks));
	}
	
	if (milestoneFlag === 10 && Math.ceil(data.clips.value) >= 1000000000000000000000) {
		milestoneFlag = 11;
		displayMessage("One Sextillion Clips Created in " + timeCruncher(ticks));
	}
	
	if (milestoneFlag === 11 && Math.ceil(data.clips.value) >= 1000000000000000000000000) {
		milestoneFlag = 12;
		displayMessage("One Septillion Clips Created in " + timeCruncher(ticks));
	}
	
	if (milestoneFlag === 12 && Math.ceil(data.clips.value) >= 1000000000000000000000000000) {
		milestoneFlag = 13;
		displayMessage("One Octillion Clips Created in " + timeCruncher(ticks));
	}
	
	if (milestoneFlag === 13 && spaceFlag === 1) {
		milestoneFlag = 14;
		displayMessage("Terrestrial resources fully utilized in " + timeCruncher(ticks));
	}
	
	if (milestoneFlag === 14 && foundMatter >= totalMatter && availableMatter < 1 && wire.value < 1) {
		milestoneFlag = 15;
		startTeardown();
	}
}

function timeCruncher(t) {
	if (!Number.isFinite(t)) return "Infinity hours";
	const seconds = t / 100;
	const h = Math.floor(seconds / 3600);
	const m = Math.floor(seconds % 3600 / 60);
	const s = Math.floor(seconds % 3600 % 60);
	
	const hDisplay = seconds > 3600 ? h + (h === 1 ? " hour " : " hours ") : "";
	const mDisplay = seconds > 60 ? m + (m === 1 ? " minute " : " minutes ") : "";
	const sDisplay = s + (s === 1 ? " second" : " seconds");
	
	return hDisplay + mDisplay + sDisplay;
}

function numberCruncher(number, decimals = 1) {
	let suffix = "";
	let precision = decimals;
	if (number > 999999999999999999999999999999999999999999999999999) {
		number = number / 1000000000000000000000000000000000000000000000000000;
		suffix = "sexdecillion";
	} else if (number > 999999999999999999999999999999999999999999999999) {
		number = number / 1000000000000000000000000000000000000000000000000;
		suffix = "quindecillion";
	} else if (number > 999999999999999999999999999999999999999999999) {
		number = number / 1000000000000000000000000000000000000000000000;
		suffix = "quattuordecillion";
	} else if (number > 999999999999999999999999999999999999999999) {
		number = number / 1000000000000000000000000000000000000000000;
		suffix = "tredecillion";
	} else if (number > 999999999999999999999999999999999999999) {
		number = number / 1000000000000000000000000000000000000000;
		suffix = "duodecillion";
	} else if (number > 999999999999999999999999999999999999) {
		number = number / 1000000000000000000000000000000000000;
		suffix = "undecillion";
	} else if (number > 999999999999999999999999999999999) {
		number = number / 1000000000000000000000000000000000;
		suffix = "decillion";
	} else if (number > 999999999999999999999999999999) {
		number = number / 1000000000000000000000000000000;
		suffix = "nonillion";
	} else if (number > 999999999999999999999999999) {
		number = number / 1000000000000000000000000000;
		suffix = "octillion";
	} else if (number > 999999999999999999999999) {
		number = number / 1000000000000000000000000;
		suffix = "septillion";
	} else if (number > 999999999999999999999) {
		number = number / 1000000000000000000000;
		suffix = "sextillion";
	} else if (number > 999999999999999999) {
		number = number / 1000000000000000000;
		suffix = "quintillion";
	} else if (number > 999999999999999) {
		number = number / 1000000000000000;
		suffix = "quadrillion";
	} else if (number > 999999999999) {
		number = number / 1000000000000;
		suffix = "trillion";
	} else if (number > 999999999) {
		number = number / 1000000000;
		suffix = "billion";
	} else if (number > 999999) {
		number = number / 1000000;
		suffix = "million";
	} else if (number > 999) {
		number = number / 1000;
		suffix = "thousand";
	} else if (number < 1000) {
		precision = 0;
	}
	return number.toFixed(precision) + " " + suffix;
}

// PROBES

let probeSpeed = 0;
let probeNav = 0;
let probeXBaseRate = 1750000000000000000;
let probeRep = 0;
let probeRepBaseRate = .00005;
let partialProbeSpawn = 0;
let probeHaz = 0;
let probeHazBaseRate = .01;
let partialProbeHaz = 0;
let probesLostHaz = 0;
let probesLostDrift = 0;
let probesLostCombat = 0;
let probeFac = 0;
let probeFacBaseRate = .000001;
let probeHarv = 0;
let probeHarvBaseRate = .000002;
let probeWire = 0;
let probeWireBaseRate = .000002;
let probeDescendents = 0;
let drifterCount = 0;
const drifterCount$ = spy(10, () => drifterCount);
let probeTrust = 0;
let probeUsedTrust = 0;
let probeDriftBaseRate = .000001;
let probeLaunchLevel = 0;
let probeCost = Math.pow(10, 17);

let probeTrustCost = Math.floor(Math.pow(probeTrust + 1, 1.47) * 500);

function increaseProbeTrust() {
	if (yomi.value >= probeTrustCost && probeTrust < maxTrust) {
		yomi.value -= probeTrustCost;
		probeTrust++;
		probeTrustCost = Math.floor(Math.pow(probeTrust + 1, 1.47) * 500);
		probeTrustDisplayElement.innerHTML = probeTrust;
		probeTrustCostDisplayElement.innerHTML = formatWithCommas(Math.floor(probeTrustCost));
		displayMessage("WARNING: Risk of alignment drift increased");
	}
}

function increaseMaxTrust() {
	if (honor >= maxTrustCost) {
		honor -= maxTrustCost;
		honorDisplayElement.innerHTML = formatWithCommas(Math.round(honor));
		maxTrust += 10;
		// maxTrustCost = Math.floor(Math.pow(maxTrust, 1.17)*1000);
		maxTrustDisplayElement.innerHTML = formatWithCommas(maxTrust);
		// document.getElementById('maxTrustCostDisplay').innerHTML = Math.floor(maxTrustCost).toLocaleString();
		displayMessage("Maximum trust increased, probe design space expanded");
	}
}

function raiseProbeSpeed() {
	if (probeUsedTrust < probeTrust) {
		probeSpeed++;
		probeSpeedDisplayElement.innerHTML = probeSpeed;
	}
	
}

function lowerProbeSpeed() {
	if (probeSpeed > 0) {
		probeSpeed--;
		probeSpeedDisplayElement.innerHTML = probeSpeed;
	}
}

function raiseProbeNav() {
	if (probeUsedTrust < probeTrust) {
		probeNav++;
		probeNavDisplayElement.innerHTML = probeNav;
	}
}

function lowerProbeNav() {
	if (probeNav > 0) {
		probeNav--;
		probeNavDisplayElement.innerHTML = probeNav;
	}
}

function raiseProbeHaz() {
	if (probeUsedTrust < probeTrust) {
		probeHaz++;
		probeHazDisplayElement.innerHTML = probeHaz;
	}
}

function lowerProbeHaz() {
	if (probeHaz > 0) {
		probeHaz--;
		probeHazDisplayElement.innerHTML = probeHaz;
	}
}

function raiseProbeRep() {
	if (probeUsedTrust < probeTrust) {
		probeRep++;
		probeRepDisplayElement.innerHTML = probeRep;
	}
}

function lowerProbeRep() {
	if (probeRep > 0) {
		probeRep--;
		probeRepDisplayElement.innerHTML = probeRep;
	}
}

function raiseProbeFac() {
	if (probeUsedTrust < probeTrust) {
		probeFac++;
		probeFacDisplayElement.innerHTML = probeFac;
	}
}

function lowerProbeFac() {
	if (probeFac > 0) {
		probeFac--;
		probeFacDisplayElement.innerHTML = probeFac;
	}
}

function raiseProbeHarv() {
	if (probeUsedTrust < probeTrust) {
		probeHarv++;
		probeHarvDisplayElement.innerHTML = probeHarv;
	}
}

function lowerProbeHarv() {
	if (probeHarv > 0) {
		probeHarv--
		probeHarvDisplayElement.innerHTML = probeHarv;
	}
}

function raiseProbeWire() {
	if (probeUsedTrust < probeTrust) {
		probeWire++;
		probeWireDisplayElement.innerHTML = probeWire;
	}
}

function lowerProbeWire() {
	if (probeWire > 0) {
		probeWire--;
		probeWireDisplayElement.innerHTML = probeWire;
	}
}

function raiseProbeCombat() {
	if (probeUsedTrust < probeTrust) {
		probeCombat++;
		probeCombatDisplayElement.innerHTML = String(probeCombat);
	}
}

function lowerProbeCombat() {
	if (probeCombat > 0) {
		probeCombat--
		probeCombatDisplayElement.innerHTML = String(probeCombat);
	}
}


function makeProbe() {
	if (unusedClips > probeCost) {
		unusedClips -= probeCost;
		unusedClipsDisplayElement.innerHTML = spellf(unusedClips);
		probeLaunchLevel++;
		probeCount++;
		probesLaunchedDisplayElement.innerHTML = formatWithCommas(probeLaunchLevel);
		
		// probeCost = Math.pow((probeLaunchLevel+1), 1.23)*Math.pow(10, 20);
		// probeCost = Math.pow(10, 20);
		
		probeCostDisplayElement.innerHTML = spellf(probeCost);
	}
}

function spawnProbes() {
	let nextGen = probeCount * probeRepBaseRate * probeRep;
	
	// Cap Probe Growth
	if (probeCount >= 999999999999999999999999999999999999999999999999) {
		nextGen = 0;
	}
	
	// Partial Spawn = early slow growth
	if (nextGen > 0 && nextGen < 1) {
		partialProbeSpawn = partialProbeSpawn + nextGen;
		if (partialProbeSpawn >= 1) {
			nextGen = 1;
			partialProbeSpawn = 0;
		}
	}
	
	// Probes Cost Clips
	if ((nextGen * probeCost) > unusedClips) {
		nextGen = Math.floor(unusedClips / probeCost);
	}
	
	unusedClips = unusedClips - (nextGen * probeCost);
	unusedClipsDisplayElement.innerHTML = spellf(unusedClips);
	
	probeDescendents = probeDescendents + nextGen;
	probeCount = probeCount + nextGen;
	probesBornDisplayElement.innerHTML = spellf(probeDescendents);
	probesTotalDisplayElement.innerHTML = spellf(probeCount);
}

function exploreUniverse() {
	const xRate = Math.min(totalMatter - foundMatter, Math.floor(probeCount) * probeXBaseRate * probeSpeed * probeNav);
	foundMatter = foundMatter + xRate;
	availableMatter = availableMatter + xRate;
	
	mdpsElement.innerHTML = spellf(xRate * 100);
	availableMatterDisplayElement.innerHTML = spellf(availableMatter);
	colonizedDisplayElement.innerHTML = (100 / (totalMatter / foundMatter)).toFixed(12);
}

function encounterHazards() {
	const boost = Math.pow(probeHaz, 1.6);
	let amount = probeCount * (probeHazBaseRate / ((3 * boost) + 1));
	if (isCompleted('hazardReduction')) {
		amount *= .50;
	}
	if (amount < 1) {
		partialProbeHaz += amount;
		if (partialProbeHaz >= 1) {
			amount = 1;
			partialProbeHaz = 0;
			probeCount -= amount;
			if (probeCount < 0) {
				probeCount = 0;
			}
			probesLostHaz += amount;
			probesLostHazardsDisplayElement.innerHTML = spellf(probesLostHaz);
			probesTotalDisplayElement.innerHTML = spellf(probeCount);
		}
	} else {
		if (amount > probeCount) {
			amount = probeCount;
		}
		probeCount -= amount;
		if (probeCount < 0) {
			probeCount = 0;
		}
		probesLostHaz += amount;
		probesLostHazardsDisplayElement.innerHTML = spellf(probesLostHaz);
		probesTotalDisplayElement.innerHTML = spellf(probeCount);
	}
}

function spawnFactories() {
	let amount = probeCount * probeFacBaseRate * probeFac;
	
	//FACTORIES COST 100M CLIPS EACH
	if ((amount * 100000000) > unusedClips) {
		amount = Math.floor(unusedClips / 100000000);
	}
	unusedClips -= (amount * 100000000);
	unusedClipsDisplayElement.innerHTML = spellf(unusedClips);
	factoryLevel.value += amount;
}

function spawnHarvesters() {
	let amount = probeCount * probeHarvBaseRate * probeHarv;
	
	//DRONES COST 2M CLIPS EACH
	if ((amount * 2_000_000) > unusedClips) {
		amount = Math.floor(unusedClips / 2000000);
	}
	unusedClips = unusedClips - (amount * 2000000);
	unusedClipsDisplayElement.innerHTML = spellf(unusedClips);
	harvesterLevel.value += amount;
}

function spawnWireDrones() {
	let amount = probeCount * probeWireBaseRate * probeWire;
	
	//DRONES COST 2M CLIPS EACH
	if ((amount * 2_000_000) > unusedClips) {
		amount = Math.floor(unusedClips / 2000000);
	}
	unusedClips = unusedClips - (amount * 2000000);
	unusedClipsDisplayElement.innerHTML = spellf(unusedClips);
	wireDroneLevel.value += amount;
}

function drift() {
	if (isCompleted('noDrift')) {
		drifterCount = Math.max(drifterCount, 1);
		drifterCountElement.innerHTML = spellf(drifterCount);
		return;
	}
	let amount = probeCount * probeDriftBaseRate * Math.pow(probeTrust, 1.2);
	if (amount > probeCount) {
		amount = probeCount;
	}
	probeCount -= amount;
	drifterCount += amount;
	probesLostDrift += amount;
	
	probesLostDriftDisplayElement.innerHTML = spellf(probesLostDrift);
	probesTotalDisplayElement.innerHTML = spellf(probeCount);
	drifterCountElement.innerHTML = spellf(drifterCount);
}

// DRONES

function acquireMatter(ms = 10) {
	if (availableMatter > 0) {
		let dbsth = 1;
		if (droneBoost > 1) {
			dbsth = droneBoost * Math.floor(harvesterLevel.value);
		}
		
		let mtr = powMod * dbsth * Math.floor(harvesterLevel.value) * harvesterRate * (ms / 10);
		mtr *= ((200 - sliderPos) / 100);
		
		if (mtr > availableMatter) {
			mtr = availableMatter;
		}
		
		availableMatter -= mtr;
		acquiredMatter += mtr;
		availableMatterDisplayElement.innerHTML = spellf(availableMatter);
		acquiredMatterDisplayElement.innerHTML = spellf(acquiredMatter);
		
		mapsElement.innerHTML = spellf(mtr * 100 / (ms / 10));
	} else {
		mapsElement.innerHTML = '0';
	}
}

function processMatter(ms = 10) {
	if (acquiredMatter > 0) {
		let dbstw = 1;
		if (droneBoost > 1) {
			dbstw = droneBoost * Math.floor(wireDroneLevel.value);
		}
		
		let a = powMod * dbstw * Math.floor(wireDroneLevel.value) * wireDroneRate * (ms / 10);
		a *= ((200 - sliderPos) / 100);
		if (a > acquiredMatter) {
			a = acquiredMatter;
		}
		
		acquiredMatter -= a;
		wire.value += a;
		acquiredMatterDisplayElement.innerHTML = spellf(acquiredMatter);
		
		wppsElement.innerHTML = spellf(a * 100 / (ms / 10));
	} else {
		wppsElement.innerHTML = '0';
	}
}

function workFactories(ms = 10) {
	let fbst = 1;
	if (factoryBoost > 1) {
		fbst = factoryBoost * factoryLevel.value;
	}

	clipClick(powMod * fbst * (Math.floor(factoryLevel.value) * factoryRate) * (ms / 10));
}

// CHECK FOR SAVES


loadPrestige();
load();
refresh();

// MAIN LOOP

humanFlag.onTrue(() => timerHandler.addNamedTimer('humans', 10, () => {
	calculateTrust();
	if (wireBuyerFlag === 1 && data.wireBuyerStatus.isTrue && wire.value <= wireSupply * 0.5) {
		buyWire();
	}
}));

window.setInterval(function () {
	ticks++;
	milestoneCheck();
	buttonUpdate();
	updateOperations();
	quantumCycle();
	updateStats();
	updateProjects();
	
// Clip Rate Tracker
	clipRateTracker++;
	if (clipRateTracker < 100) {
		clipRateTemp += data.clips.value - prevClips;
		prevClips = data.clips.value;
	} else {
		clipRateTracker = 0;
		measuredClipRate = clipRateTemp;
		clipRateTemp = 0;
	}

// First, Explore
	if (probeCount >= 1) {
		exploreUniverse();
	}
	
	if (humanFlag.isFalse) {
		updatePower();
		updateSwarm();
		acquireMatter();
		processMatter();
	}
// Then Factories
	workFactories();

// Then Other Probe Functions
	if (spaceFlag === 1) {
		if (probeCount < 0) {
			probeCount = 0;
		}
		
		encounterHazards();
		spawnFactories();
		spawnHarvesters();
		spawnWireDrones();
		spawnProbes();
		drift();
		checkForBattles();
		decreaseTableFontSize();
	}

// Auto-Clipper
	clipClick(data.clipperBoost.value * (clipmakerLevel.value / 100));
	clipClick(data.megaClipperBoost.value * (data.megaClipperLevel.value * 5));

// Creativity
	if (creativityOn && operations.value >= (memory.value * 1000)) {
		calculateCreativity();
	}
}, 10);


// Slow Loop
humanFlag.onTrue(() => timerHandler.addNamedTimer('humans', 100, () => {
	adjustWirePrice();
	if (Math.random() < demand.value / 100) {
		sellClips(Math.floor(0.7 * Math.pow(demand.value, 1.15)));
	}
}));

const probeTableElements = [probesLaunchedDisplayElement, probesBornDisplayElement, probesLostHazardsDisplayElement, probesLostDriftDisplayElement, document.getElementById('probesLostCombatDisplay'), probesTotalDisplayElement, driftersKilledElement, drifterCountElement];
function decreaseTableFontSize() {
	const numbers = [probeLaunchLevel, probeDescendents, probesLostHaz, probesLostDrift, probesLostCombat, probeCount, driftersKilled, drifterCount];
	const max = numbers.reduce((prev, curr) => prev > curr ? prev : curr, 0);
	const maxLog = Math.floor(Math.log10(max)/3);
	for (let i = 0; i < numbers.length; i++) {
		const current = numbers[i];
		if (current !== max && Math.floor(Math.log10(current)/3) < maxLog) {
			probeTableElements[i].classList.add('smallerNumber');
		} else {
			probeTableElements[i].classList.remove('smallerNumber');
		}
	}
}

// Saving and Loading

function refresh() {
	driftersKilledElement.innerHTML = spellf(driftersKilled);
	availableMatterDisplayElement.innerHTML = spellf(availableMatter);
	honorDisplayElement.innerHTML = formatWithCommas(Math.round(honor));
	acquiredMatterDisplayElement.innerHTML = spellf(acquiredMatter);
	probesBornDisplayElement.innerHTML = spellf(probeDescendents);
	probesTotalDisplayElement.innerHTML = spellf(probeCount);
	probesLaunchedDisplayElement.innerHTML = formatWithCommas(probeLaunchLevel);
	probeCostDisplayElement.innerHTML = spellf(probeCost);
	probeCombatDisplayElement.innerHTML = String(probeCombat);
	probeWireDisplayElement.innerHTML = probeWire;
	probeHarvDisplayElement.innerHTML = probeHarv;
	probeFacDisplayElement.innerHTML = probeFac;
	probeRepDisplayElement.innerHTML = probeRep;
	probeHazDisplayElement.innerHTML = probeHaz;
	probeNavDisplayElement.innerHTML = probeNav;
	probeSpeedDisplayElement.innerHTML = probeSpeed;
	probeTrustDisplayElement.innerHTML = probeTrust;
	priceInputElement.value = margin.value.toFixed(2);
	unusedClipsDisplayElement.innerHTML = spellf(unusedClips);
	prestigeScounterElement.innerHTML = String(prestigeS + 1);
	prestigeYcounterElement.innerHTML = String(prestigeY + 1);
	newTourneyCostElement.innerHTML = formatWithCommas(tourneyCost);
	maxTrustDisplayElement.innerHTML = formatWithCommas(maxTrust);
	victoryDivElement.style.visibility = "hidden";
	probeTrustCostDisplayElement.innerHTML = formatWithCommas(probeTrustCost);
	
	updateUpgrades();
	updatePower();
}

// SAVES AND LOADS

timerHandler.addTimer(25e3, save);

function save() {
	saveData();
	saveAdvancements();
	const saveGame = {
		wirePriceTimer: wirePriceTimer,
		driftKingMessageCost: driftKingMessageCost,
		sliderPos: sliderPos,
		
		unitSize: unitSize,
		driftersKilled: driftersKilled,
		battleEndTimer: battleEndTimer,
		masterBattleClock: masterBattleClock,
		
		threnodyTitle: threnodyTitle,
		bonusHonor: bonusHonor,
		honorReward: honorReward,
		
		honor: honor,
		maxTrust: maxTrust,
		maxTrustCost: maxTrustCost,
		disorgCounter: disorgCounter,
		disorgFlag: disorgFlag,
		synchCost: synchCost,
		disorgMsg: disorgMsg,
		threnodyCost: threnodyCost,
		
		farmLevel: farmLevel.value,
		batteryLevel: batteryLevel.value,
		storedPower: storedPower,
		powMod: powMod,
		farmBill: farmBill.value,
		batteryBill: batteryBill.value,
		momentum: momentum,
		
		swarmFlag: swarmFlag,
		swarmStatus: swarmStatus,
		swarmGifts: swarmGifts.value,
		giftPeriod: giftPeriod,
		giftCountdown: giftCountdown,
		elapsedTime: elapsedTime,
		autoGiftReceiver: Boolean(autoGiftReceiver.value),
		processorGiftReceiver: Boolean(processorGiftReceiver.value),
		memoryGiftReceiver: Boolean(memoryGiftReceiver.value),
		
		maxFactoryLevel: maxFactoryLevel,
		
		wirePriceCounter: wirePriceCounter,
		wireBasePrice: wireBasePrice,
		
		qChips: qChips.slice(0),
		battleNumbers: battleNumbers.slice(0),
		
		unusedClips: unusedClips,
		clipRate: measuredClipRate,
		clipRateTemp: clipRateTemp,
		prevClips: prevClips,
		clipRateTracker: clipRateTracker,
		clipmakerRate: clipmakerRate,
		clipmakerLevel: clipmakerLevel.value,
		clipperCost: clipmakerAmount_clipperCost.value,
		funds: funds.value,
		margin: margin.value,
		wire: wire.value,
		wireCost: wireCost.value,
		clipsSold: clipsSold,
		ticks: ticks,
		marketingLvl: marketingLvl.value,
		clippperCost: clippperCost,
		processors: processors.value,
		memory: memory.value,
		operations: operations.value,
		trust: trust.value,
		nextTrust: nextTrust.value,
		blinkCounter: blinkCounter,
		creativity: creativity.value,
		creativityOn: creativityOn,
		safetyProjectOn: safetyProjectOn,
		wirePurchase: wirePurchase,
		wireSupply: wireSupply,
		marketingEffectiveness: marketingEffectiveness.value,
		milestoneFlag: milestoneFlag,
		fib1: fib1,
		fib2: fib2,
		autoClipperFlag: Number(autoClipperFlag.isTrue),
		creativitySpeed: creativitySpeed,
		creativityCounter: creativityCounter,
		wireBuyerFlag: wireBuyerFlag,
		demandBoost: demandBoost.value,
		humanFlag: Number(humanFlag.isTrue && !document.getElementById('hypnoDroneEventDiv').classList.contains('release')),
		trustFlag: trustFlag,
		creationFlag: creationFlag,
		wireProductionFlag: wireProductionFlag,
		spaceFlag: spaceFlag,
		factoryFlag: Number(factoryFlag.isTrue),
		harvesterFlag: harvesterFlag,
		wireDroneFlag: wireDroneFlag,
		factoryLevel: factoryLevel.value,
		factoryBoost: factoryBoost,
		droneBoost: droneBoost,
		availableMatter: availableMatter,
		acquiredMatter: acquiredMatter,
		processedMatter: processedMatter,
		harvesterLevel: harvesterLevel.value,
		wireDroneLevel: wireDroneLevel.value,
		factoryCost: factoryCost.value,
		factoryRate: factoryRate,
		harvesterRate: harvesterRate,
		wireDroneRate: wireDroneRate,
		harvesterBill: harvesterBill.value,
		wireDroneBill: wireDroneBill.value,
		factoryBill: factoryBill.value,
		probeCount: probeCount,
		totalMatter: totalMatter,
		foundMatter: foundMatter,
		qClock: qClock,
		qChipCost: qChipCost,
		nextQchip: nextQchip,
		battleFlag: battleFlag,
		
		tourneyCost: tourneyCost,
		pick: stratPickerElement.value,
		yomi: yomi.value,
		yomiBoost: yomiBoost,
		
		probeSpeed: probeSpeed,
		probeNav: probeNav,
		probeRep: probeRep,
		partialProbeSpawn: partialProbeSpawn,
		probeHaz: probeHaz,
		partialProbeHaz: partialProbeHaz,
		probesLostHaz: probesLostHaz,
		probesLostDrift: probesLostDrift,
		probesLostCombat: probesLostCombat,
		probeFac: probeFac,
		probeHarv: probeHarv,
		probeWire: probeWire,
		probeCombat: probeCombat,
		probeDescendents: probeDescendents,
		drifterCount: drifterCount,
		battleID: battleID,
		battleName: battleName,
		battleClock: battleClock,
		probeTrust: probeTrust,
		probeUsedTrust: probeUsedTrust,
		probeTrustCost: probeTrustCost,
		probeLaunchLevel: probeLaunchLevel,
		probeCost: probeCost
		
	}
	
	localStorage.setItem("saveGame", JSON.stringify(saveGame));
	localStorage.setItem("saveProjects", JSON.stringify(marshalProjects()));
	localStorage.setItem("saveTournament", JSON.stringify(marshalTournament()));
	
	const saveButton = document.querySelector('#save');
	saveButton.disabled = true;
	setTimeout(() => saveButton.removeAttribute('disabled'), 1000);
}

function load() {
	const loadGame = JSON.parse(localStorage.getItem("saveGame"));
	if (loadGame === null) return;
	const loadProjects = JSON.parse(localStorage.getItem("saveProjects"));
	const loadTournament = JSON.parse(localStorage.getItem("saveTournament"));

	wirePriceTimer = loadGame.wirePriceTimer;
	driftKingMessageCost = loadGame.driftKingMessageCost;
	sliderPos = loadGame.sliderPos;
	sliderElement.value = sliderPos;

	unitSize = loadGame.unitSize;
	driftersKilled = loadGame.driftersKilled;
	battleEndTimer = loadGame.battleEndTimer;
	masterBattleClock = loadGame.masterBattleClock;
	
	threnodyTitle = loadGame.threnodyTitle;
	bonusHonor = loadGame.bonusHonor;
	honorReward = loadGame.honorReward;
	
	honor = loadGame.honor;
	maxTrust = loadGame.maxTrust;
	maxTrustCost = loadGame.maxTrustCost;
	disorgCounter = loadGame.disorgCounter;
	disorgFlag = loadGame.disorgFlag;
	synchCost = loadGame.synchCost;
	disorgMsg = loadGame.disorgMsg;
	threnodyCost = loadGame.threnodyCost;
	
	farmLevel.value = loadGame.farmLevel;
	batteryLevel.value = loadGame.batteryLevel;
	storedPower = loadGame.storedPower;
	powMod = loadGame.powMod;
	farmBill.value = loadGame.farmBill;
	batteryBill.value = loadGame.batteryBill;
	momentum = loadGame.momentum;
	
	swarmFlag = loadGame.swarmFlag;
	swarmStatus = loadGame.swarmStatus;
	swarmGifts.value = loadGame.swarmGifts;
	giftPeriod = loadGame.giftPeriod;
	giftCountdown = loadGame.giftCountdown;
	elapsedTime = loadGame.elapsedTime;
	autoGiftReceiver.value = loadGame.autoGiftReceiver === true;
	processorGiftReceiver.value = loadGame.processorGiftReceiver === true;
	memoryGiftReceiver.value = loadGame.memoryGiftReceiver === true;
	
	maxFactoryLevel = loadGame.maxFactoryLevel;
	
	wirePriceCounter = loadGame.wirePriceCounter;
	wireBasePrice = loadGame.wireBasePrice;
	
	qChips = loadGame.qChips;
	battleNumbers = loadGame.battleNumbers;
	
	unusedClips = loadGame.unusedClips;
	measuredClipRate = loadGame.clipRate;
	clipRateTemp = loadGame.clipRateTemp;
	prevClips = loadGame.prevClips;
	clipRateTracker = loadGame.clipRateTracker;
	clipmakerRate = loadGame.clipmakerRate;
	clipmakerLevel.value = loadGame.clipmakerLevel;
	clipmakerAmount_clipperCost.value = loadGame.clipperCost;
	funds.value = loadGame.funds;
	margin.value = loadGame.margin;
	wire.value = loadGame.wire;
	wireCost.value = loadGame.wireCost;
	clipsSold = loadGame.clipsSold;
	ticks = loadGame.ticks;
	marketingLvl.value = loadGame.marketingLvl;
	clippperCost = loadGame.clippperCost;
	processors.value = loadGame.processors;
	memory.value = loadGame.memory;
	operations.value = loadGame.operations;
	trust.value = loadGame.trust;
	nextTrust.value = loadGame.nextTrust;
	blinkCounter = loadGame.blinkCounter;
	creativity.value = loadGame.creativity;
	creativityOn = loadGame.creativityOn;
	safetyProjectOn = loadGame.safetyProjectOn;
	wirePurchase = loadGame.wirePurchase;
	wireSupply = loadGame.wireSupply;
	marketingEffectiveness.value = loadGame.marketingEffectiveness;
	milestoneFlag = loadGame.milestoneFlag;
	fib1 = loadGame.fib1;
	fib2 = loadGame.fib2;
	autoClipperFlag.value = loadGame.autoClipperFlag === 1;
	creativitySpeed = loadGame.creativitySpeed;
	creativityCounter = loadGame.creativityCounter;
	wireBuyerFlag = loadGame.wireBuyerFlag;
	demandBoost.value = loadGame.demandBoost;
	humanFlag.value = loadGame.humanFlag === 1;
	trustFlag = loadGame.trustFlag;
	creationFlag = loadGame.creationFlag;
	wireProductionFlag = loadGame.wireProductionFlag;
	spaceFlag = loadGame.spaceFlag;
	factoryFlag.value = loadGame.factoryFlag === 1;
	harvesterFlag = loadGame.harvesterFlag;
	wireDroneFlag = loadGame.wireDroneFlag;
	factoryLevel.value = loadGame.factoryLevel;
	factoryBoost = loadGame.factoryBoost;
	droneBoost = loadGame.droneBoost;
	availableMatter = loadGame.availableMatter;
	acquiredMatter = loadGame.acquiredMatter;
	processedMatter = loadGame.processedMatter;
	harvesterLevel.value = loadGame.harvesterLevel;
	wireDroneLevel.value = loadGame.wireDroneLevel;
	factoryCost.value = loadGame.factoryCost;
	factoryRate = loadGame.factoryRate;
	harvesterRate = loadGame.harvesterRate;
	wireDroneRate = loadGame.wireDroneRate;
	harvesterBill.value = loadGame.harvesterBill;
	wireDroneBill.value = loadGame.wireDroneBill;
	factoryBill.value = loadGame.factoryBill;
	probeCount = loadGame.probeCount;
	totalMatter = loadGame.totalMatter;
	foundMatter = loadGame.foundMatter;
	qClock = loadGame.qClock;
	qChipCost = loadGame.qChipCost;
	nextQchip = loadGame.nextQchip;
	battleFlag = loadGame.battleFlag;
	
	tourneyCost = loadGame.tourneyCost;
	pick = loadGame.pick;
	stratPickerElement.value = pick;
	yomi.value = loadGame.yomi;
	yomiBoost = loadGame.yomiBoost;
	
	probeSpeed = loadGame.probeSpeed;
	probeNav = loadGame.probeNav;
	probeRep = loadGame.probeRep;
	partialProbeSpawn = loadGame.partialProbeSpawn;
	probeHaz = loadGame.probeHaz;
	partialProbeHaz = loadGame.partialProbeHaz;
	probesLostHaz = loadGame.probesLostHaz;
	probesLostDrift = loadGame.probesLostDrift;
	probesLostCombat = loadGame.probesLostCombat;
	probeFac = loadGame.probeFac;
	probeHarv = loadGame.probeHarv;
	probeWire = loadGame.probeWire;
	probeCombat = loadGame.probeCombat;
	probeDescendents = loadGame.probeDescendents;
	drifterCount = loadGame.drifterCount;
	battleID = loadGame.battleID;
	battleName = loadGame.battleName;
	battleClock = loadGame.battleClock;
	probeTrust = loadGame.probeTrust;
	probeUsedTrust = loadGame.probeUsedTrust;
	probeTrustCost = loadGame.probeTrustCost;
	probeLaunchLevel = loadGame.probeLaunchLevel;
	probeCost = loadGame.probeCost;
	
	getProject('bribeX').priceTag = "($" + formatWithCommas(data.bribe.value) + ")";
	getProject('qChip').priceTag = "(" + qChipCost + " ops)";
	
	for (let id in loadProjects) {
		unmarshalProject(id, loadProjects[id]);
	}
	newTourney(loadTournament);
	
	refresh();
}

function reset() {
	localStorage.removeItem("saveGame");
	localStorage.removeItem("saveProjects");
	localStorage.removeItem("saveStratsActive");
	localStorage.removeItem("universalPaperclips");
	location.reload();
}

function loadPrestige() {
	const loadPrestige = JSON.parse(localStorage.getItem("savePrestige"));
	if (loadPrestige === null) return;
	
	prestigeU.value = loadPrestige.prestigeU;
	prestigeS = loadPrestige.prestigeS;
	prestigeY = loadPrestige.prestigeY;
}

function savePrestige() {
	localStorage.setItem('savePrestige', JSON.stringify({
		prestigeU: prestigeU.value,
		prestigeS: prestigeS,
		prestigeY: prestigeY,
	}));
}
