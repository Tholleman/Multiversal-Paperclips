'use strict';

var unusedClips = 0;
var measuredClipRate = 0;
var clipRateTemp = 0;
var prevClips = 0;
var clipRateTracker = 0;
var clipmakerRate = 0;
const clipmakerLevel = ObservableValue.new(0, updateElement('#clipmakerLevel2'));
const clipmakerAmount_clipperCost = ObservableValue.new(5, updateElement('#clipperCost', value => formatWithCommas(value, 2)));
const funds = ObservableValue.new(0, updateElement('#funds', value => formatWithCommas(value, value < 1000 ? 2 : 0)));
const margin = ObservableValue.new(0.25, enableButton('#priceDecrease', margin => margin > 0.01));
margin.onChange(() => data.marginChanged.value = true);
const manufacturingNotification = document.getElementById('manufacturingNotification');
const wire = ObservableValue.new(1000, [
	updateElement('#wire', formatWithCommas),
	updateElement('#nanoWire', spellf),
	updateElement('#transWire', spellf),
	enableButton('#btnMakePaperclip', amount => Math.floor(amount) > 0),
	value => {
		manufacturingNotification.innerText = value === 0 ? '!' : '';
	}
]);
const wireCost = ObservableValue.new(20, updateElement('#wireCost'));
const demand = ObservableValue.new(5);
var clipsSold = 0;
var income = 0;
var ticks = 0;
const marketingLvl = ObservableValue.new(1, updateElement('#marketingLvl'));
const marketingLvl_adCost = ObservableValue.new(100, updateElement('#adCost', value => formatWithCommas(value, 2)));
var clippperCost = 5;
const processors = ObservableValue.new(1, [
	updateElement('#processors', formatWithCommas),
]);
const memory = ObservableValue.new(1, [
	updateElement('#memory', formatWithCommas),
	updateElement('#maxOps', value => formatWithCommas(value * 1000)),
]);
const operations = ObservableValue.new(0, updateElement('#operations', formatWithCommas));
const trust = ObservableValue.new(2, updateElement('#trust', formatWithCommas));
const nextTrust = ObservableValue.new(3000, updateElement('#nextTrust', value => formatWithCommas(Math.floor(value))));
var blinkCounter = 0;
const creativity = ObservableValue.new(0, updateElement('#creativity', formatWithCommas));
var creativityOn = 0;
var safetyProjectOn = false;
var wirePurchase = 0;
var wireSupply = 1000;
const marketingEffectiveness = ObservableValue.new(1);
var milestoneFlag = 0;
var fib1 = 2;
var fib2 = 3;
const autoClipperFlag = new ObservableBoolean(false);
autoClipperFlag.onChange(value => document.querySelector('#autoClipperDiv').style.display = value ? '' : 'none');
var creativitySpeed = 1;
var creativityCounter = 0;
var wireBuyerFlag = 0;
const demandBoost = ObservableValue.new(1);
const humanFlag = new ObservableBoolean(true);
let trustFlag = 1;
let creationFlag = 0;
let wireProductionFlag = 0;
let spaceFlag = 0;
let harvesterFlag = 0;
let wireDroneFlag = 0;
let droneBoost = 1;
let availableMatter = 6e27;
let acquiredMatter = 0;
let processedMatter = 0;
let probeCount = 0;
const probeCount$ = spy(10, () => probeCount);
let totalMatter = 3e55;
let foundMatter = availableMatter;
let qClock = 0;
let qChipCost = 10000;
let nextQchip = 0;
let battleFlag = 0;
const yomi = ObservableValue.new(0, updateElement('#yomiDisplay', formatWithCommas));

const prestigeU = ObservableValue.new(0, updateElement('#prestigeUcounter', prestigeU => prestigeU + 1));
const prestigeS = ObservableValue.new(0, updateElement('#prestigeScounter', prestigeU => prestigeU + 1));
const prestigeY = ObservableValue.new(0, updateElement('#prestigeYcounter', prestigeU => prestigeU + 1));
/** @type {ObservableValue<number>} */
const totalPrestigeBonuses = ObservableValue.computed([prestigeU, prestigeS, prestigeY], (u, s, y) => u + s + y);

var wirePriceCounter = 0;
var wireBasePrice = 20;

var storedPower = 0;
var powMod = 0;
var momentum = 0;

var factoryRate = 1000000000;
const factoryFlag = new ObservableBoolean(false);
factoryFlag.onChange(value => document.querySelector('#factoryDiv').style.display = value ? '' : 'none');
const factoryLevel = ObservableValue.new(0, [
	updateElement('#factoryLevelDisplay'),
	updateElement('#factoryLevelDisplaySpace', spellf),
]);
let factoryBoost = 1;
const factoryCost = ObservableValue.new(100_000_000, updateElement('#factoryCostDisplay', spellf));
const factoryBill = ObservableValue.new(0);

var harvesterRate = 26180337;
const harvesterLevel = ObservableValue.new(0, [
	updateElement('#harvesterLevelDisplay', formatWithCommas),
	updateElement('#harvesterLevelSpace', spellf),
]);
const harvesterBill = ObservableValue.new(0);

var wireDroneRate = 16180339;
const wireDroneLevel = ObservableValue.new(0, [
	updateElement('#wireDroneLevelDisplay', formatWithCommas),
	updateElement('#wireDroneLevelSpace', spellf),
]);
const wireDroneBill = ObservableValue.new(0);

const farmLevel = ObservableValue.new(0, [
	updateElement('#farmLevel', formatWithCommas),
]);
const farmBill = ObservableValue.new(0);

const batteryLevel = ObservableValue.new(0, [
	updateElement('#batteryLevel', formatWithCommas),
]);
const batteryBill = ObservableValue.new(0);

var swarmFlag = 0;
var swarmStatus = 7;
const swarmGifts = ObservableValue.new(0, updateElement('#swarmGifts', formatWithCommas));
var giftPeriod = 125000;
var giftCountdown = giftPeriod;
var elapsedTime = 0;
const autoGiftReceiver = new ObservableBoolean(false);
autoGiftReceiver.onChange(value => document.querySelectorAll('.autoGiftReceiver').forEach(element => element.style.display = value ? '' : 'none'));
const processorGiftReceiver = new ObservableBoolean(false);
processorGiftReceiver.onChange(value => document.querySelector('#btnProcessorGiftReceiverStatus').innerText = value ? 'ON' : 'OFF');
const memoryGiftReceiver = new ObservableBoolean(false);
memoryGiftReceiver.onChange(value => document.querySelector('#btnMemoryGiftReceiverStatus').innerText = value ? 'ON' : 'OFF');

var honor = 0;
var maxTrust = 20;
var maxTrustCost = 91117.99;
var disorgCounter = 0;
var disorgFlag = 0;
var synchCost = 5000;
var disorgMsg = 0;
var threnodyCost = 50000;

var wireBuyerStatus = 1;
var wirePriceTimer = 0;
var driftKingMessageCost = 1;
var sliderPos = 0;

// complex Bindings
funds.onTrigger(value => value >= 5, () => autoClipperFlag.value = true);
ObservableValue.onAnyChange([wireCost, funds], enableButton('#btnBuyWire', () => wireCost.value <= funds.value));
ObservableValue.onAnyChange([clipmakerAmount_clipperCost, funds], enableButton('#btnMakeClipper', () => clipmakerAmount_clipperCost.value <= funds.value));
ObservableValue.onAnyChange([megaClipperCost, funds], enableButton('#btnMakeMegaClipper', () => megaClipperCost.value <= funds.value));
ObservableValue.onAnyChange([marketingLvl_adCost, funds], enableButton('#btnExpandMarketing', () => marketingLvl_adCost.value <= funds.value));

clipmakerLevel.onChange(value => clipmakerAmount_clipperCost.value = Math.pow(1.1, value) + 5);
marketingLvl.onChange(level => marketingLvl_adCost.value = Math.floor(100 * Math.pow(2, level - 1)));

ObservableValue.onAnyChange([marketingLvl, margin, marketingEffectiveness, demandBoost, prestigeU], () => {
	const marketing = Math.pow(1.1, marketingLvl.value - 1);
	const withoutPrestige = ((0.8 / margin.value) * marketing * marketingEffectiveness.value) * demandBoost.value;
	demand.value = withoutPrestige + (withoutPrestige / 10) * prestigeU.value;
});
const addProcBtn = document.getElementById('btnAddProc');
const addMemoryBtn = document.getElementById('btnAddMem');
const compNotification = document.getElementById('compNotification');
ObservableValue.onAnyChange([trust, processors, memory, swarmGifts], (trust, processors, memory, swarmGifts) => {
	const actionsAvailable = Math.max(0, trust - (processors + memory)) + swarmGifts;
	compNotification.innerText = actionsAvailable > 0 ? actionsAvailable : '';
	addProcBtn.disabled = actionsAvailable <= 0;
	addMemoryBtn.disabled = actionsAvailable <= 0;
});
