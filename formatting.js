const oneToNineteen = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const multipleOfTen = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const placeValue = ["", " thousand", " million", " billion", " trillion", " quadrillion", " quintillion", " sextillion", " septillion", " octillion", " nonillion", " decillion", " undecillion", " duodecillion", " tredecillion", " quattuordecillion", " quindecillion", " sexdecillion", " septendecillion", " octodecillion", " novemdecillion", " vigintillion", " unvigintillion", " duovigintillion", " trevigintillion", " quattuorvigintillion", " quinvigintillion", " sexvigintillion", " septenvigintillion", " octovigintillion", " novemvigintillion", " trigintillion", " untrigintillion", " duotrigintillion", " tretrigintillion", " quattuortrigintillion", " quintrigintillion", " sextrigintillion", " septentrigintillion", " octotrigintillion", " novemtrigintillion", " quadragintillion", " unquadragintillion", " duoquadragintillion", " trequadragintillion", " quattuorquadragintillion", " quinquadragintillion", " sexquadragintillion", " septenquadragintillion", " octoquadragintillion", " novemquadragintillion", " quinquagintillion", " unquinquagintillion", " duoquinquagintillion", " trequinquagintillion", " quattuorquinquagintillion", " quinquinquagintillion", " sexquinquagintillion", " septenquinquagintillion", " octoquinquagintillion", " novemquinquagintillion", " sexagintillion", " unsexagintillion", " duosexagintillion", " tresexagintillion", " quattuorsexagintillion", " quinsexagintillion", " sexsexagintillion", " septsexagintillion", " octosexagintillion", " octosexagintillion", " septuagintillion", " unseptuagintillion", " duoseptuagintillion", " treseptuagintillion", " quinseptuagintillion", " sexseptuagintillion", " septseptuagintillion", " octoseptuagintillion", " novemseptuagintillion", " octogintillion", " unoctogintillion", " duooctogintillion", " treoctogintillion", " quattuoroctogintillion", " quinoctogintillion", " sexoctogintillion", " septoctogintillion", " octooctogintillion", " novemoctogintillion", " nonagintillion", " unnonagintillion", " duononagintillion", " trenonagintillion ", " quattuornonagintillion ", " quinnonagintillion ", " sexnonagintillion ", " septnonagintillion", " octononagintillion", " novemnonagintillion", " centillion"];

/**
 *
 * @param {number} userInput
 * @returns {string}
 */
function spellf(userInput) {
	if (userInput === 0) return '0';
	if (userInput > -1000 && userInput < 1000) {
		return String(Math.floor(userInput));
	}
	if (userInput < 0) {
		return '-' + spellf(-userInput);
	}
	let numToWorkOn = "" + userInput;
	
	if (numToWorkOn.indexOf("e+") !== -1) {
		const splittedExponentNum = numToWorkOn.split("e+");
		let exponent = splittedExponentNum[1],
			str = '';
		if (numToWorkOn.indexOf(".") !== -1) {
			const intAndFraction = splittedExponentNum[0].split(".");
			exponent -= intAndFraction[1].length;
			numToWorkOn = intAndFraction.join("");
		} else {
			numToWorkOn = splittedExponentNum[0];
		}
		while (exponent--) {
			str = str + '0';
		}
		numToWorkOn = numToWorkOn + str;
	} else if (numToWorkOn.indexOf(".") !== -1) {
		numToWorkOn = numToWorkOn.substring(0, numToWorkOn.indexOf("."));
	}
	
	//Put limit check on the program, placevalue map should be increased to increase capacity
	if (numToWorkOn.length >= 303) {
		throw new Error("Number out of bonds!");
	}
	return convertToString(numToWorkOn);
	
	//Recursie logic to break number into strings of length 3 each and recursively pronounce each
	function convertToString(stringEquivalent) {
		let result = '',
			unitLookup = 0,
			strLength = stringEquivalent.length;
		for (let k = strLength; k > 0; k = k - 3) {
			if (k - 3 <= 0) {
				const subStr = stringEquivalent.substring(k, k - 3);
				const pronounce = pronounceNum(subStr);
				if (pronounce.toLowerCase() !== 'zero') {
					const num = Number(subStr + "." + stringEquivalent.substring(subStr.length, subStr.length + 2));
					result = formatWithCommas(num, 1) + placeValue[unitLookup] + ' , ' + result;
				}
			}
			unitLookup++;
		}
		//to trim of the extra ", " from last
		return result.substring(0, result.length - 3)
	}
	
	//Determines the range of input and calls respective function
	function pronounceNum(val) {
		val = parseInt(val);
		if (val < 100) {
			return numLessThan99(val)
		} else
			return numLessThan1000(val);
	}
	
	//Pronounces any number less than 1000
	function numLessThan1000(val) {
		val = Number(val);
		let hundredPlace = Math.floor(val / 100);
		if (val % 100 === 0) {
			return oneToNineteen[hundredPlace] + " hundred ";
		}
		return oneToNineteen[hundredPlace] + " hundred " + numLessThan99(val % 100);
	}
	
	//Pronounces any number less than 99
	function numLessThan99(val) {
		val = Number(val);
		if (val <= 19) {
			return oneToNineteen[val];
		}
		const e2 = multipleOfTen[Math.floor(val / 10)];
		if (val % 10 === 0) {
			return e2;
		}
		return e2 + " " + oneToNineteen[val % 10];
	}
}

const withCommas = Intl.NumberFormat("US", {maximumFractionDigits: 0});

/**
 * @param {number} num
 * @param {number} decimal
 * @returns {string}
 */
function formatWithCommas(num, decimal = 0) {
	if (num === undefined) return '';
	if (decimal === 0) {
		let result = withCommas.format(num);
		if (result.length >= 14) {
			let random = '';
			const inaccurate = result.substring(14).split('');
			for (const char of inaccurate) {
				if (char !== ',') {
					random += Math.floor(Math.random() * 10);
				} else {
					random += char;
				}
			}
			result = result.substring(0, 14) + random;
		}
		return result;
	} else {
		return Intl.NumberFormat("US", {minimumFractionDigits: decimal, maximumFractionDigits: decimal}).format(num);
	}
	let base = num.toString();
	if (base.indexOf("e+") !== -1) {
		const splittedExponentNum = base.split("e+");
		let exponent = splittedExponentNum[1];
		if (base.indexOf(".") !== -1) {
			const intAndFraction = splittedExponentNum[0].split(".");
			exponent -= intAndFraction[1].length;
			base = intAndFraction.join("");
		}
		let str = '';
		while (exponent--) {
			str += Math.floor(Math.random() * 10);
		}
		base += str;
	}
	const hasDot = base.indexOf(".") !== -1;
	if (decimal === 0) {
		if (base.length <= 3 && !hasDot)
			return base;
	}
	const leftNum = hasDot ? base.substring(0, base.indexOf(".")) : base;
	if (decimal === 0) {
		return leftNum.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
	}
	let dec = hasDot ? base.substring(base.indexOf("."), base.indexOf(".") + decimal + 1) : ".";
	while (dec.length < decimal + 1) {
		dec += "0";
	}
	if (num <= 999) return leftNum + dec;
	return leftNum.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + dec;
}

function formatClips(clips) {
	if (clips >= 3e55) {
		document.getElementById('clipCountCrunched').innerHTML = '29.9 septendecillion';
		return '29,999,999,999,999,900,000,000,000,000,000,000,000,000,000,000,000,000,000';
	} else {
		return formatWithCommas(clips);
	}
}

function addBreaksAtComma(string) {
	return string.replaceAll(',', ',<wbr>');
}
