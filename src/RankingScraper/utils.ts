export const parseDuration = (durationString: string): Date => {
	const units: {[key: string]: number} = {
		second: 1,
		minute: 60,
		hour: 60 * 60,
		day: 60 * 60 * 24,
		week: 60 * 60 * 24 * 7,
		month: 60 * 60 * 24 * 30.44, // average number of seconds in a month
		year: 60 * 60 * 24 * 365 // average number of seconds in a year
	};
	
	let totalSeconds = 0;
	const durationParts = durationString.split('and');

	for (let i = 0; i < durationParts.length; i++) {
		const part = durationParts[i].trim().split(' ');
		const value = parseInt(part[0], 10);
		let unit = part[1].toLowerCase();
	
		if (value !== 1) {
			// Convert plural units to singular
			if (unit.endsWith('s')) {
			unit = unit.slice(0, -1);
			} else {
			throw new Error(`Invalid unit "${part[1]}" in duration string`);
			}
		}
	
		if (units.hasOwnProperty(unit)) {
			totalSeconds += value * units[unit];
		} else {
			throw new Error(`Invalid unit "${unit}" in duration string`);
		}
	}

	let date = new Date(0)
	date.setSeconds(totalSeconds)

	return date;
}