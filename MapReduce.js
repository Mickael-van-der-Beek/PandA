function getStatsOfBatch (elements, key) {
	var i = elements.length;
	var element;
	var value;
	var max;
	var min;
	while(i--) {
		element = elements[i];
		value = element[key] || null;
		if(value !== null) {
			min = (min === undefined) || (value < min) ? value : min;
			max = (max === undefined) || (value > max) ? value : max;
		}
	}
	var firstElement = elements[0];
	var lastElement = elements[elements.length - 1];
	return {
		max: max,
		min: min,
		open: firstElement[key] || 'no value',
		close: lastElement[key] || 'no value',
		endTime: lastElement[Config.timeKey],
		startTime: firstElement[Config.timeKey]
	};
}

exports.getStatsInPeriod = function getStatsInPeriod (day, period, key) {
	var results = [];
	var datapoint;
	var result;
	var batch;
	for(var i = 0, len = day.length; i < len; i++) {
		datapoint = day[i];
		if(!(i % period)) {
			if(batch && (batch.length === period)) {
				result = getStatsOfBatch(batch, key);
				results.push(result);
			}
			batch = [];
		}
		batch.push(datapoint);
	}
	return results;
};