var fs = require('fs');
var processIntraday = require('./Processing');
var mapreduce = require('./MapReduce');

// Filename, could also be read in the stdin
var filename = 'Euronext 2013-08-Intraday.txt';
var exportname = 'MapReduce';

Config = {
	unusedFields : ['Diff', 'Count'],
	statusKey: 'Status',
	valueKey: 'Value',
	timeKey: 'Time',
	status: {
		opening: 'Official opening index',
		closing: 'Closing Reference index',
		during: ['Real-time index'/*,'Options liquidation index'*/]
	}
};

function parseIntradayLines (lines) {
	var i = lines.length;
	while(i--) {
		lines[i] = lines[i].split('\t');
	}
	return lines;
}

function removeEmptyLines (lines) {
	return lines.filter(function (line) {
		return !!line.length;
	});
}

function parseIntraday (text) {
	var lines = text.split(/\r?\n/);
	lines = removeEmptyLines(lines);
	return parseIntradayLines(lines);
}

function parseCSVtoJSON (csv, header) {
	var json = [];
	var i = csv.length;
	var k;
	var line;
	var object;
	var column;
	while(i--) {
		object = {};
		line = csv[i];
		k = line.length;
		while(k--) {
			object[header[k]] = line[k];
		}
		json.push(object);
	}
	return json;
}

function writeFile (exportfile, data) {
	fs.writeFile(exportfile, data, 'utf8', function (error) {
		if(error) {
			console.log('Couldn\'t read file : ' + filename);
			throw error;
		}
	});
}

function generateLineFromKeys (object, keys) {
	var i = keys.length;
	var line = '';
	while(i--) {
		line += object[keys[i]] + (i ? ',' : '');
	}
	return line + '\n';
}

function generateHeaderFromKeys (firstline) {
	return Object.keys(firstline);
}

function exportJSONtoCSV (json) {
	var header = generateHeaderFromKeys(json[0]);
	var i = json.length;
	var csv = '';
	var object;
	var line;
	while(i--) {
		object = json[i];
		line = generateLineFromKeys(object, header);
		csv += line + '\n';
	}
	writeFile(exportname + '_' + Date.now(), csv);
}

function mergeDays (days) {
	return days.reduce(function (dayA, dayB) {
		return dayB && dayB.length ? dayA.concat(dayB) : dayA;
	}, []);
}

fs.readFile(filename, 'utf8', function (error, rawdata) {
	if(error) {
		console.log('Couldn\'t read file : ' + filename);
		throw error;
	}
	else {
		var csv = parseIntraday(rawdata);
		var header = csv[0];
		csv = csv.splice(1, csv.length - 1);
		var json = parseCSVtoJSON(csv, header);
		var intradays = processIntraday(json);

		/**
		* Map / Reduce example
		*/
		var reducedDays = [];
		var reducedDay;
		var day;
		for(var i = 0, len = intradays.length; i < len; i++) {
			day = intradays[i];
			reducedDay = mapreduce.getStatsInPeriod(day, 5, Config.valueKey);
			reducedDays.push(reducedDay);
		}
		var mergedIntraday = mergeDays(reducedDays);
		console.log(mergedIntraday.length);
		exportJSONtoCSV(mergedIntraday);
	}
});
