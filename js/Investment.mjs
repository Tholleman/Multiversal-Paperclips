import {advancements} from './teardown.mjs';
import {getElement, unlockElement, withElement} from './view.mjs';

export function leveragedLoan() {
	funds.value += portTotal;
	data.loaned.value += portTotal;
}

export function payLoan() {
	const toPay = Math.min(funds.value, data.loaned.value);
	funds.value -= toPay;
	data.loaned.value -= toPay;
}

data.investmentEngineFlag.onChange(value => {
	if (value) {
		investmentEngineElement.style.display = "";
		investmentEngineUpgradeElement.style.display = "";
		if (advancements.trading.value === 'ACTIVE') {
			unlockElement('#leveragedLoanContainer');
			unlockElement('#btnPayLoan');
			unlockElement('#btnLeveragedLoan');
		}
	} else {
		investmentEngineElement.style.display = "none";
		investmentEngineUpgradeElement.style.display = "none";
	}
})

if (advancements.trading.value === 'ACTIVE') {
	getElement('#depositLabel').innerText = 'Deposit (non-loaned)'
	getProject('bribe1').priceTag = '($500,000, no loan)';
	getProject('bribeX').priceTag = '($' + formatWithCommas(bribe) + ', no loan)';
}

data.loaned.onChange(withElement('#leveragedLoan', (el, loan) => {
	el.innerText = formatWithCommas(loan);
}));
