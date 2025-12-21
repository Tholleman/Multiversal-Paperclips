"use strict";
const battleWIDTH = 310;
const battleHEIGHT = 150;
// Group ships into squares.
// Opposing ships that are in these squares are in combat.
// This is faster than calculating the distance between each ship at the cost of:
// - no accurate/consistent combat range
// - ships that are next to each other but in different cells don't interact
const battleGRID_WIDTH = 31;
const battleGRID_HEIGHT = 15;
const battleINV_GRID_WIDTH = 1 / (battleWIDTH / battleGRID_WIDTH);
const battleINV_GRID_HEIGHT = 1 / (battleHEIGHT / battleGRID_HEIGHT);

let battleLEFTSHIPS = 200;
let battleRIGHTSHIPS = 200;

const battleMAXSPEED = 2;
const battleLEFTCOLOR = "#fff";
const battleRIGHTCOLOR = "#000";
const battleEXPLODECOLOR = "#fff";

const probeCombatBaseRate = 0.15;
const drifterCombat = 1.75;
let warTrigger = 1_000_000;

/** @type {Ship[]} */
const aliveShips = [];
/** @type {Ship[]} */
const dyingShips = [];
/** @type {Ship[][][]} */
const grid = new Array(battleGRID_HEIGHT);
for (let i = 0; i < battleGRID_HEIGHT; i++) {
	grid[i] = new Array(battleGRID_WIDTH);
	for (let j = 0; j < battleGRID_WIDTH; j++) {
		grid[i][j] = [];
	}
}
let numLeftShips = 0;
let numRightShips = 0;

let probeCombat = 0;
let battleID = 0;
let battleName;
let battleClock = 0;

let unitSize = 0;
let driftersKilled = 0;
let battleEndDelay = 0;
let battleEndTimer = 100;
let masterBattleClock = 0;

let threnodyTitle = "Durenstein 1";
let bonusHonor = 0;
let honorReward = 0;
const finalAnimation = ObservableValue.new(false);

function checkForBattles() {
	if (drifterCount > warTrigger && probeCount > 0 && aliveShips.length === 0) {
		battleFlag = 1; // NOSONAR
		createBattle();
	}
}

function createBattle() {
	unitSize = Math.max(1, Math.min(drifterCount, probeCount) / 200);
	document.getElementById('battleScale').innerHTML = numberCruncher(unitSize, 0);

	const rr = Math.max(1, Math.random() * drifterCount);
	const ss = Math.max(1, Math.random() * probeCount);


	battleLEFTSHIPS = Math.min(200, Math.ceil(ss / 1000000));
	let nerfOdds = 0.001;
	// noinspection JSIncompatibleTypesComparison
	if (window.advancements?.unlocks?.winner?.value !== 'ACTIVE') {
		nerfOdds = 0.5;
	}
	if (battleLEFTSHIPS === 200 && Math.random() < nerfOdds) {
		battleLEFTSHIPS -= Math.min(199, Math.ceil(Math.random() * bonusHonor));
	}
	battleRIGHTSHIPS = Math.min(200, Math.ceil(rr / 1000000));
	
	Battle();
	
	battleName = isCompleted('nameBattles') ? generateBattleName() : `Drifter Attack ${++battleID}`;
	document.getElementById('battleName').innerHTML = battleName;
}

const battleNames = [
	"Aboukir", "Abensberg", "Acre", "Alba de Tormes", "la Albuera", "Algeciras Bay", "Amstetten", "Arcis-sur-Aube", "Aspern-Essling",
	"Jena-Auerstedt", "Arcole", "Austerlitz", "Badajoz", "Bailen", "la Barrosa", "Bassano", "Bautzen", "Berezina", "Bergisel",
	"Borodino", "Burgos", "Bucaco", "Cadiz", "Caldiero", "Castiglione", "Castlebar", "Champaubert", "Chateau-Thierry", "Copenhagen",
	"Corunna", "Craonne", "Dego", "Dennewitz", "Dresden", "Durenstein", "Eckmuhl", "Elchingen", "Espinosa de los Monteros", "Eylau",
	"Cape Finisterre", "Friedland", "Fuentes de Onoro", "Gevora River", "Gerona", "Hamburg", "Haslach-Jungingen", "Heilsberg",
	"Hohenlinden", "Jena-Auerstedt", "Kaihona", "Kolberg", "Landshut", "Leipzig", "Ligny", "Lodi", "Lubeck", "Lutzen", "Marengo",
	"Maria", "Medellin", "Medina de Rioseco", "Millesimo", "Mincio River", "Mondovi", "Montebello", "Montenotte", "Montmirail",
	"Mount Tabor", "The Nile", "Novi", "Ocana", "Cape Ortegal", "Orthez", "Pancorbo", "Piave River", "The Pyramids", "Quatre Bras",
	"Raab", "Raszyn", "Rivoli", "Rolica", "La Rothiere", "Rovereto", "Saalfeld", "Schongrabern", "Salamanca", "Smolensk",
	"Somosierra", "Talavera", "Tamames", "Trafalgar", "Trebbia", "Tudela", "Ulm", "Valls", "Valmaseda", "Valutino", "Vauchamps",
	"Vimeiro", "Vitoria", "Wagram", "Waterloo", "Wavre", "Wertingen", "Zaragoza"
];

let battleNumbers = battleNames.map(() => 1);
function generateBattleName() {
	const x = Math.floor(Math.random() * battleNames.length);
	return battleNames[x] + " " + battleNumbers[x]++
}

//CANVAS BATTLE DISPLAY

let intervalId;
function Battle() {
	const canvas= document.getElementById("canvas");
	const context = canvas.getContext('2d');
	canvas.width = battleWIDTH;
	canvas.height = battleHEIGHT;

	intervalId ??= setInterval(update, 16);

	battleSetup();

	function update() {
		context.clearRect(0, 0, canvas.width, canvas.height);
		if (isCompleted('noDrift') && aliveShips.length === 0 && drifterCount <= 1) {
			lastDrifter();
			return;
		}
		updateGrid();
		moveShips();
		doCombat();
		animateDyingShips();
		checkForBattleEnd();
	}

	function battleSetup() {
		//reset the grid
		for (let row = 0; row < battleGRID_HEIGHT; row++) {
			for (let col = 0; col < battleGRID_WIDTH; col++) {
				grid[row][col].length = 0;
			}
		}

		aliveShips.length = 0;
		dyingShips.length = 0;
		numLeftShips = battleLEFTSHIPS;
		numRightShips = battleRIGHTSHIPS;

		for (let i = 0; i < numLeftShips; i++) {
			aliveShips.push(new Ship(0));
		}
		for (let i = 0; i < numRightShips; i++) {
			aliveShips.push(new Ship(1));
		}
	}

	function updateGrid() {
		//First clear grid out
		for (let row = 0; row < battleGRID_HEIGHT; row++) {
			for (let col = 0; col < battleGRID_WIDTH; col++) {
				grid[row][col].length = 0;
			}
		}

		//Update Grid cells with ships in each cell
		for (const ship of aliveShips) {
			//figure out which grid cell the ship is in
			const gx = clamp(Math.floor(ship.x * battleINV_GRID_WIDTH), 0, battleGRID_WIDTH - 1);
			const gy = clamp(Math.floor(ship.y * battleINV_GRID_HEIGHT), 0, battleGRID_HEIGHT - 1);
			grid[gy][gx].push(ship); //add ship to this grid cell
		}
	}

	function moveShips() {
		const centroid = findCentroid();
		const teamCentroids = findTeamCentroids();

		for (let i = 0; i < grid.length; i++) {
			for (let j = 0; j < grid[i].length; j++) {
				if (grid[i][j].length === 0) continue;
				const nearbyShips = getNearbyShips(i, j);
				for (const ship of grid[i][j]) {
					moveSingleShip(ship, centroid, teamCentroids[!ship.team + 0], nearbyShips);
					context.fillStyle = ship.color;
					context.fillRect(ship.x - 1, ship.y - 1, 2, 2);
				}
			}
		}
	}

	function findCentroid() {

		//find the statistical center of all the ships

		const centroid = {x: 0, y: 0};

		for (const ship of aliveShips) {
			centroid.x += ship.x;
			centroid.y += ship.y;
		}

		centroid.x /= aliveShips.length;
		centroid.y /= aliveShips.length;

		//give some tendency to center, so they bunch in the middle
		centroid.x = (centroid.x * 0.75) + (battleWIDTH / 2 * 0.25);
		centroid.y = (centroid.y * 0.75) + (battleHEIGHT / 2 * 0.25);
		return centroid;
	}

	function findTeamCentroids() {
		const result = [{x: 0, y: 0}, {x: 0, y: 0}];
		const counts = [0, 0];
		for (let ship of aliveShips) {
			result[ship.team].x += ship.x;
			result[ship.team].y += ship.y;
			counts[ship.team]++;
		}
		result[0].x /= counts[0];
		result[0].y /= counts[0];
		result[1].x /= counts[1];
		result[1].y /= counts[1];
		return result;
	}

	function getNearbyShips(gx, gy) {
		const nearbyShips = [...grid[gx][gy]];
		if (gx > 0) nearbyShips.push(...grid[gx - 1][gy]);
		if (gx < grid.length - 1) nearbyShips.push(...grid[gx + 1][gy]);
		if (gy > 0) nearbyShips.push(...grid[gx][gy - 1]);
		if (gy < grid[gx].length - 1) nearbyShips.push(...grid[gx][gy + 1]);
		return nearbyShips;
	}

	/**
	 * @param {Ship} ship
	 * @param {{x: number, y: number}} centroid
	 * @param {{x: number, y: number}} opTeamCentroids
	 * @param {Ship[]} nearbyShips
	 */
	function moveSingleShip(ship, centroid, opTeamCentroids, nearbyShips) {
		//accelerate to group centroid
		ship.vx += (centroid.x - ship.x) * 0.001;
		ship.vy += (centroid.y - ship.y) * 0.001;

		chaseOrRun(ship, opTeamCentroids);

		//accelerate to enemy ships in adjacent grid cells
		let teammatesConsidered = 0;
		for (const otherShip of nearbyShips) {
			if (ship === otherShip) continue;
			if (otherShip.team === ship.team) {
				teammatesConsidered++;
				// if (teammatesConsidered > 3) continue;//don't fixate on teammates

				//mild acceleration to match teammates
				ship.vx += otherShip.vx * 0.01;
				ship.vy += otherShip.vy * 0.01;

				//mild acceleration to get space from teammates
				const spreadVelocity = 0.01 * Math.random() + 0.02;
				ship.vx -= (otherShip.x - ship.x) * spreadVelocity;
				ship.vy -= (otherShip.y - ship.y) * spreadVelocity;
			} else {
				ship.vx += otherShip.vx * 0.2;
				ship.vy += otherShip.vy * 0.2;
				ship.vx += (otherShip.x - ship.x) * 0.2; // acceleration toward enemies
				ship.vy += (otherShip.y - ship.y) * 0.2;
			}
		}

		//limit speed to max
		ship.vx = clamp(ship.vx, -battleMAXSPEED, battleMAXSPEED);
		ship.vy = clamp(ship.vy, -battleMAXSPEED, battleMAXSPEED);

		//move the ship
		ship.x += ship.vx;
		ship.y += ship.vy;

		edgeBounce(ship);
	}

	function chaseOrRun(ship, opTeamCentroids) {
		if (!isCompleted('ooda') || !Number.isFinite(opTeamCentroids.x)) return;
		const winning = (numLeftShips >= numRightShips) === (ship.team === 0);
		let factor;
		if (winning) {
			const ratio = ship.team === 0 ? numLeftShips / numRightShips : numRightShips / numLeftShips;
			factor = Math.min(0.001, ratio * 0.0001);
		} else {
			const ratio = ship.team === 0 ? numRightShips / numLeftShips : numLeftShips / numRightShips;
			factor = Math.max(-0.0007, ratio * -0.0001);
		}
		ship.vx += (opTeamCentroids.x - ship.x) * factor;
		ship.vy += (opTeamCentroids.y - ship.y) * factor;
	}

	function edgeBounce(ship) {
		if (ship.x > battleWIDTH) {
			ship.x = battleWIDTH;
			ship.vx *= -0.5;
		} else if (ship.x < 0) {
			ship.x = 0;
			ship.vx *= -0.5;
		}
		if (ship.y > battleHEIGHT) {
			ship.y = battleHEIGHT;
			ship.vy *= -0.5;
		} else if (ship.y < 0) {
			ship.y = 0;
			ship.vy *= -0.5;
		}
	}

	function doCombat() {
		const pX = probeCombat * probeCombatBaseRate;
		const dX = drifterCombat;

		const ooda = isCompleted('ooda') ? probeSpeed * 0.2 : 0;

		for (const ships of nextCell()) {
			//First Check if there are enough ships in this cell to do combat
			if (ships.length < 2) continue;

			let [numLeftTeam, numRightTeam] = getTeamCounts(ships)

			if (numLeftTeam === 0 || numRightTeam === 0) continue;

			//now we have at least one ship of each team in this cell.
			//roll a weighted die to see if each ship gets killed

			for (const ship of ships) {
				if (dieChance(ship, dX, numRightTeam, numLeftTeam, ooda, pX)) {
					killShip(ship);
				}
			}
		}
	}

	function* nextCell() {
		for (let row of grid) {
			for (let cell of row) {
				yield cell;
			}
		}
	}

	function getTeamCounts(ships) {
		return ships.reduce((arr, ship) => {
			arr[ship.team]++;
			return arr;
		}, [0, 0]);
	}

	function killShip(ship) {
		aliveShips.splice(aliveShips.indexOf(ship), 1);
		dyingShips.push(ship);
		if (ship.team === 0) {
			if (unitSize > probeCount) {
				unitSize = probeCount;
			}
			numLeftShips--;
			probeCount -= unitSize; // NOSONAR
			probesLostCombat += unitSize; // NOSONAR
			document.getElementById('probesLostCombatDisplay').innerHTML = numberCruncher(probesLostCombat);
		} else {
			if (unitSize > drifterCount) {
				unitSize = drifterCount;
			}
			numRightShips--;
			drifterCount -= unitSize; // NOSONAR
			driftersKilled += unitSize;
			document.getElementById('driftersKilled').innerHTML = numberCruncher(driftersKilled);
			document.getElementById('drifterCount').innerHTML = numberCruncher(drifterCount);
		}
	}

	function dieChance(ship, dX, numRightTeam, numLeftTeam, ooda, pX) {
		let battleDEATH_THRESHOLD = .5;
		let diceRoll;
		if (ship.team === 0) {
			diceRoll = Math.random() * dX * ((numRightTeam / numLeftTeam) * .5);
			battleDEATH_THRESHOLD = battleDEATH_THRESHOLD + ooda;
		} else {
			diceRoll = ((Math.random() * pX) + (probeCombat * .1)) * ((numLeftTeam / numRightTeam) * .5);
		}
		return diceRoll > battleDEATH_THRESHOLD;
	}

	function animateDyingShips() {
		for (let i = dyingShips.length - 1; i >= 0; i--) {
			const ship = dyingShips[i];
			if (ship.framesDead < 10) {
				//draw explosion
				context.fillStyle = battleEXPLODECOLOR;
				if (ship.framesDead < 1) {
					context.fillRect(ship.x - 3, ship.y - 3, 7, 7); //big square for one frame
				} else if (ship.framesDead < 2) {
					context.fillRect(ship.x - 1, ship.y - 1, 3, 3); //little square for 1 frame
				}
				//4 little pixel squares moving out from the point of explosion
				context.fillRect(ship.x + ship.framesDead, ship.y + ship.framesDead, 1, 1);
				context.fillRect(ship.x - ship.framesDead, ship.y + ship.framesDead, 1, 1);
				context.fillRect(ship.x + ship.framesDead, ship.y - ship.framesDead, 1, 1);
				context.fillRect(ship.x - ship.framesDead, ship.y - ship.framesDead, 1, 1);
				ship.framesDead++;
			} else {
				dyingShips.splice(i, 1);
			}
		}
	}

	function checkForBattleEnd() {
		if (numLeftShips === 0 || numRightShips === 0) {
			showWinLoss();
			return;
		}
		if (numLeftShips <= 4 || numRightShips <= 4) {
			battleClock++;
			if (battleClock >= 2000) {
				endBattle();
			}
			return;
		}
		masterBattleClock++;
		if (masterBattleClock >= 8000) {
			endBattle();
		}
	}

	function showWinLoss() {
		if (battleEndDelay++ > 0) {
			if (battleEndDelay >= battleEndTimer) {
				battleEndDelay = 0;
				endBattle();
			}
			return;
		}
		if (!isCompleted('nameBattles')) return;
		document.getElementById("victoryDiv").style.visibility = "visible";

		if (numLeftShips === numRightShips) {
			document.getElementById("battleResult").innerHTML = "DRAW";
		} else if (numLeftShips === 0) {
			bonusHonor = 0;
			honor -= battleLEFTSHIPS; // NOSONAR
			document.getElementById("battleResult").innerHTML = "DEFEAT";
			document.getElementById("battleResultSign").innerHTML = "-";
			document.getElementById("honorAmount").innerHTML = battleLEFTSHIPS;
			document.getElementById("honorDisplay").innerHTML = Math.round(honor).toLocaleString();
			threnodyTitle = battleName;
		} else {
			honorReward = battleRIGHTSHIPS + bonusHonor;
			document.getElementById("honorAmount").innerHTML = honorReward;
			honor += honorReward;
			if (isCompleted('glory')) bonusHonor += 10;
			document.getElementById("battleResult").innerHTML = "VICTORY";
			document.getElementById("battleResultSign").innerHTML = "+";
			document.getElementById("honorDisplay").innerHTML = Math.round(honor).toLocaleString();
		}
	}

	function endBattle() {
		document.getElementById("victoryDiv").style.visibility = "hidden";
		battleClock = 0;
		masterBattleClock = 0;
		battleEndDelay = 0;
		aliveShips.splice(0, Infinity);
	}

	function lastDrifter() {
		clearInterval(intervalId);
		finalAnimation.value = true;
		/**
		 * @type {[number, number][]}
		 */
		const encirclers = [];
        const middleX = battleWIDTH / 2 - 1;
        const middleY = battleHEIGHT / 2 - 1;
        encirclers.push([middleX, middleY + 20]);
        encirclers.push([middleX, middleY - 20]);
        encirclers.push([middleX + 20, middleY]);
        encirclers.push([middleX - 20, middleY]);
        let angle = 0;
        function draw() {
            context.save();
            context.clearRect(0, 0, canvas.width, canvas.height);

            context.fillStyle = battleRIGHTCOLOR;
            context.fillRect(middleX, middleY, 2, 2);

            context.fillStyle = battleLEFTCOLOR;
            context.translate(middleX, middleY);
            context.rotate(angle++ * Math.PI / 180);
            context.translate(-middleX, -middleY);

            for (let encircler of encirclers) {
                context.fillRect(encircler[0], encircler[1], 2, 2);
            }
            context.restore();
        }
        setInterval(draw, 16);
	}
}

class Ship {
	team;
	framesDead = 0;
	x; y;
	vx; vy;
	color;

	/**
	 * @param {0 | 1} team
	 */
	constructor(team) {
		this.team = team;
		if (team === 0) {
			this.x = (Math.random() * 0.2) * battleWIDTH;
			this.y = Math.random() * battleHEIGHT;
			this.vx = Math.random() * battleMAXSPEED;
			this.vy = Math.random() - 0.5;
			this.color = battleLEFTCOLOR;
		} else {
			this.x = (Math.random() * 0.2 + 0.8) * battleWIDTH;
			this.y = Math.random() * battleHEIGHT;
			this.vx = Math.random() * -battleMAXSPEED;
			this.vy = Math.random() - 0.5;
			this.color = battleRIGHTCOLOR;
		}
	}
}

function clamp(value, min, max) {
	return Math.max(min, Math.min(max, value));
}
