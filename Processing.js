function removeUnusedField (element) {
	var unusedFields = Config.unusedFields;
	var k = unusedFields.length;
	while(k--) {
		delete element[unusedFields[k]];
	}
}

function removeUnusedFields (json) {
	var i = json.length;
	var element;
	while(i--) {
		element = json[i];
		removeUnusedField(element);
	}
	return json;
}

function convertCESTTImetoUNIXEpoch (date, time) {
	var verboseMonth = [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'Mai',
		'Jun',
		'Jul',
		'Aug',
		'Sep',
		'Oct',
		'Nov',
		'Dec'
	];
	var day = date[0];
	var month = verboseMonth[date[1] - 1];
	var year = date[2];
	return new Date(day + ' ' + month + ' ' + year + ' ' + time);
}

function parseCESTTIme (timestring) {
	var elements = timestring.split(' ');
	if(elements.length === 3) {
		var date = elements[0].split('/');
		var time = elements[1];
		return convertCESTTImetoUNIXEpoch(date, time);
	}
	else {
		throw 'Invalid date string : ' + timestring;
	}
}

function numberifyCommaNotation (strnum) {
	return parseFloat(strnum.replace(/\./, '').split(',').join('.')).toFixed(2);
}

function convertStrtoNum (json) {
	json.map(function (element) {
		var time = element[Config.timeKey];
		var value =  element[Config.valueKey];
		element[Config.timeKey] = parseCESTTIme(time);
		element[Config.valueKey] = numberifyCommaNotation(value);
	});
	return json;
}

function applyFilters (json) {
	json = removeUnusedFields(json);
	json = convertStrtoNum(json);
	return json;
}

function descendingSortByKey(json, key) {
	return json.sort(function (pointA, pointB) {
		return pointB[key].getTime() - pointA[key].getTime();
	});
}

function splitIntraDay (json) {
	var statusKey = Config.statusKey;
	var opening = Config.status.opening;
	var closing = Config.status.closing;
	var during = Config.status.during;
	var i = json.length;
	var days = [];
	var day;
	var status;
	var element;
	while(i--) {
		element = json[i];
		status = element[statusKey];
		if((status === opening) || ~during.indexOf(status)) {
			day = (day === undefined) ? [] : day;
			day.push(element);
		}
		else if((status === closing) && day.length) {
			if(Config.includeClosing) {
				day.push(element);
			}
			days.push(day);
			day = [];
		}

	}
	return days;
}

module.exports = function processIntraday (json) {
	json = applyFilters(json);
	json = descendingSortByKey(json, Config.timeKey);
	var intradays = splitIntraDay(json);
	return intradays;
};