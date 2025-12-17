import {advancements} from './Prestige.mjs';
import {bindDropdown, getElement, unlockElement, withElement} from './view.mjs';

const stockSymbolElements = [];
const stockAmountElements = [];
const stockPriceElements = [];
const stockTotalElements = [];
const stockProfitElements = [];

data.stocks.bankroll.onChange(withElement('#investmentBankroll', (el, bankroll) => {
	el.innerText = formatWithCommas(bankroll);
}));
data.stocks.secTotal.onChange(withElement('#secValue', (el, value) => {
	el.innerText = formatWithCommas(value);
}));
data.stocks.portfolioTotal.onChange(withElement('#portValue', (el, value) => {
	el.innerText = formatWithCommas(value);
}));
data.stocks.investUpgradeCost.onChange(withElement('#investUpgradeCost', (el, value) => {
	el.innerText = formatWithCommas(value);
}));
ObservableValue.onAnyChange([yomi, data.stocks.investUpgradeCost], withElement('#btnImproveInvestments', withElement('#investmentNotification', (notify, btn, yomi, investUpgradeCost) => {
	const available = yomi >= investUpgradeCost;
	btn.disabled = !available;
	notify.innerText = available ? '1' : '';
})));
ObservableValue.onAnyChange([data.stocks.ledger, data.stocks.portfolioTotal], withElement('#investmentRevenue', (el, ledger, portfolioTotal) => {
	el.innerText = formatWithCommas(ledger + portfolioTotal);
}));
bindDropdown('#investStrat', data.stocks.riskiness);

const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

export function investUpgrade() {
	yomi.value -= data.stocks.investUpgradeCost.value;
	data.stocks.maxPortfolio.value++;
	data.stocks.investLevel.value++;
	data.stocks.stockGainThreshold.value += .01;
	data.stocks.investUpgradeCost.value = Math.floor(Math.pow(data.stocks.investLevel.value, 3) * 100);
	displayMessage('Investment engine upgraded, expected profit/loss ratio now ' + formatWithCommas(data.stocks.stockGainThreshold.value, 2));
}

const investBtn = document.getElementById('btnInvest');
ObservableValue.onAnyChange([funds, data.loaned], (funds, loaned) => {
	investBtn.disabled = funds <= loaned;
});

export function investDeposit() {
	const toAdd = Math.floor(funds.value - data.loaned.value);
	if (toAdd <= 0) return;
	data.stocks.ledger.value -= toAdd;
	data.stocks.bankroll.value = Math.floor(data.stocks.bankroll.value + toAdd);
	funds.value -= toAdd;
}

export function investWithdraw() {
	data.stocks.ledger.value += data.stocks.bankroll.value;
	funds.value += data.stocks.bankroll.value;
	data.stocks.bankroll.value = 0;
}

function buyStock() {
	if (data.stocks.riskiness.value === 10) return;
	if (data.stocks.list.value.length >= data.stocks.maxPortfolio.value) return;
	if (data.stocks.bankroll.value < 5) return;
	
	const min = data.stocks.riskiness.value === 1
	            ? data.stocks.portfolioTotal.value / (2 * data.stocks.maxPortfolio.value)
	            : 1;
	const reserves = data.stocks.riskiness.value === 1
	                 ? 0
	                 : Math.ceil(data.stocks.portfolioTotal.value / (11 - data.stocks.riskiness.value));
	const max = Math.min(
		data.stocks.bankroll.value - reserves,
		Math.max(min, data.stocks.bankroll.value / (data.stocks.maxPortfolio.value - data.stocks.list.value.length)));
	const budget = Math.min(max, Math.ceil(data.stocks.portfolioTotal.value / data.stocks.riskiness.value));
	if (budget < min) return;
	if (Math.random() < 0.25) {
		createStock(budget);
	}
}

function createStock(dollars) {
	const sym = generateSymbol();
	const roll = Math.random();
	let pri;
	if (roll > .99) {
		pri = Math.ceil(Math.random() * 3000);
	} else if (roll > .85) {
		pri = Math.ceil(Math.random() * 500);
	} else if (roll > .60) {
		pri = Math.ceil(Math.random() * 150);
	} else if (roll > .20) {
		pri = Math.ceil(Math.random() * 50);
	} else {
		pri = Math.ceil(Math.random() * 15);
	}
	
	if (pri > dollars) {
		pri = Math.ceil(dollars * roll);
	}
	
	
	const amt = Math.min(1_000_000, Math.floor(dollars / pri));
	
	const newStock = {
		symbol: sym,
		price: pri,
		amount: amt,
		total: pri * amt,
		profit: 0,
		riskiness: data.stocks.riskiness.value,
	};
	data.stocks.list.value.push(newStock);
	data.stocks.list.changedContents();
	data.stocks.bankroll.value -= (pri * amt);
}

function sellStock() {
	if (data.stocks.list.value.length === 0) return;
	if (++data.stocks.sellDelay.value < 5) return;
	if (data.stocks.riskiness.value !== 10) {
		let sellChance = 0.4;
		if (data.stocks.list.value[0].profit < 0) sellChance /= 2;
		if (data.stocks.list.value.length === 1) sellChance /= 2;
		if (Math.random() >= sellChance) {
			return;
		}
	}
	data.stocks.sellDelay.value = 0;
	
	data.stocks.bankroll.value += data.stocks.list.value[0].total;
	data.stocks.list.value.splice(0, 1);
	data.stocks.list.changedContents();
}


function generateSymbol() {
	let name;
	do {
		name = '';
		let ltrNum;
		const x = Math.random();
		if (x <= 0.01) {
			ltrNum = 1;
		} else if (x <= 0.1) {
			ltrNum = 2;
		} else if (x <= 0.4) {
			ltrNum = 3;
		} else {
			ltrNum = 4;
		}
		for (let i = 0; i < ltrNum; i++) {
			name = name.concat(alphabet[Math.floor(Math.random() * alphabet.length)]);
		}
	} while (data.stocks.list.value.some(stock => stock.symbol === name));
	return name;
}

function updateStocksValue() {
	for (const stock of data.stocks.list.value) {
		if (Math.random() < .6) {
			const gain = Math.random() <= data.stocks.stockGainThreshold.value;
			const currentPrice = stock.price;
			const delta = Math.ceil((Math.random() * currentPrice) / (4 * stock.riskiness)) * (gain ? 1 : -1);
			stock.price += delta;
			if (stock.price === 0 && Math.random() > 0.24) {
				stock.price = 1;
			}
			stock.total = stock.price * stock.amount;
			stock.profit += delta * stock.amount;
		}
	}
	data.stocks.list.changedContents();
}

const investInterestCountdownElement = document.getElementById('interestCountdown');
const loanInterestCountdownElement = document.getElementById('loanCountdown');
data.investmentInterestCountdown.onChange(seconds => {
	const unit = 'second' + (seconds === 1 ? '&nbsp;' : 's');
	investInterestCountdownElement.innerHTML = `${seconds} ${unit}`;
	loanInterestCountdownElement.innerHTML = `${seconds} ${unit}`;
});
investInterestCountdownElement.innerHTML = timeCruncher(data.investmentInterestCountdown * 100);

function investmentInterest() {
	data.investmentInterestCountdown.value--;
	if (data.investmentInterestCountdown.value > 0) {
		return;
	}
	data.investmentInterestCountdown.value = 60;
	data.stocks.bankroll.value *= 1.02;
	if (isCompleted('dividends')) {
		data.stocks.bankroll.value += data.stocks.secTotal.value * 0.02;
	}
	data.loaned.value *= 1.05;
}

// Stock List Display Routine

const stockListElement = document.querySelector('#stockList');
const stockDisplayTemplate = document.querySelector('#stockDisplay');

data.stocks.maxPortfolio.onChange(() => {addEmptyRows();});

function addEmptyRows() {
	while (stockListElement.childElementCount <= data.stocks.maxPortfolio.value) {
		const element = stockDisplayTemplate.content.cloneNode(true);
		stockSymbolElements.push(popId(element, 'stockSymbol'));
		stockAmountElements.push(popId(element, 'stockAmount'));
		stockPriceElements.push(popId(element, 'stockPrice'));
		stockTotalElements.push(popId(element, 'stockTotal'));
		stockProfitElements.push(popId(element, 'stockProfit'));
		stockListElement.appendChild(element);
	}
}

data.stocks.list.onChange(stocks => {
	data.stocks.secTotal.value = stocks.reduce((total, stock) => total + stock.total, 0);
	
	for (let i = 0; i < stocks.length; i++) {
		stockSymbolElements[i].innerText = stocks[i].symbol;
		stockAmountElements[i].innerText = formatWithCommas(stocks[i].amount);
		stockPriceElements[i].innerText = formatWithCommas(stocks[i].price);
		stockTotalElements[i].innerText = formatWithCommas(stocks[i].total);
		stockProfitElements[i].innerText = formatWithCommas(stocks[i].profit);
	}
	for (let i = data.stocks.list.value.length; i < data.stocks.maxPortfolio.value; i++) {
		stockSymbolElements[i].innerHTML = '&nbsp;';
		stockAmountElements[i].innerText = '';
		stockPriceElements[i].innerText = '';
		stockTotalElements[i].innerText = '';
		stockProfitElements[i].innerText = '';
	}
});

humanFlag.onTrue(() => timerHandler.addNamedTimer('humans', 1000, () => {
	investmentInterest();
	buyStock();
}));
humanFlag.onTrue(() => timerHandler.addNamedTimer('humans', 2500, () => {
	sellStock();
	updateStocksValue();
}));

export function leveragedLoan() {
	funds.value += data.stocks.portfolioTotal.value;
	data.loaned.value += data.stocks.portfolioTotal.value;
}

export function payLoan() {
	const toPay = Math.min(funds.value, data.loaned.value);
	funds.value -= toPay;
	data.loaned.value -= toPay;
}

data.investmentEngineFlag.onChange(value => {
	const investmentEngineElement = document.getElementById('investmentEngine');
	const investmentEngineUpgradeElement = document.getElementById('investmentEngineUpgrade');
	if (value) {
		investmentEngineElement.style.display = '';
		investmentEngineUpgradeElement.style.display = '';
		if (advancements.unlocks.trading.value === 'ACTIVE') {
			unlockElement('#leveragedLoanContainer');
			unlockElement('#btnPayLoan');
			unlockElement('#btnLeveragedLoan');
		}
	} else {
		investmentEngineElement.style.display = 'none';
		investmentEngineUpgradeElement.style.display = 'none';
	}
});

if (advancements.unlocks.trading.value === 'ACTIVE') {
	getElement('#depositLabel').innerText = 'Deposit (non-loaned)';
	getProject('bribe1').priceTag = '($500,000, no loan)';
	getProject('bribeX').priceTag = '($' + formatWithCommas(data.bribe.value) + ', no loan)';
}

data.loaned.onChange(withElement('#leveragedLoan', (el, loan) => {
	el.innerText = formatWithCommas(loan);
}));
