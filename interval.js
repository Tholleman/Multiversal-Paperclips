"use strict";
/**
 * Simple lambda
 *
 * @callback body
 */

class TimerHandler {
	/**
	 * @type {{[key: string]: number[]}}
	 */
	#timers = {};

	/**
	 * Starts calling a function every interval.
	 *
	 * @param {number} interval milliseconds
	 * @param {body} body What to run every interval
	 */
	addTimer(interval, body) {
		window.setInterval(body, interval);
	}

	/**
	 * Starts calling a function every interval.
	 * The calling can be stopped with {@link removeNamedTimers}
	 *
	 * @param {string} category The identifier used to disable the interval
	 * @param {number} interval milliseconds
	 * @param {body} body What to run every interval
	 */
	addNamedTimer(category, interval, body) {
		if (this.#timers[category] === undefined) {
			this.#timers[category] = [];
		}

		const id = window.setInterval(body, interval);
		this.#timers[category].push(id);
	}

	/**
	 * Stops calling a function that was added with {@link addNamedTimer}
	 *
	 * @param {string} category The identifier
	 */
	removeNamedTimers(category) {
		const ids = this.#timers[category];
		if (ids === undefined) {
			return 0;
		}
		for (const id of ids) {
			window.clearInterval(id);
		}
		return ids.length;
	}
}
