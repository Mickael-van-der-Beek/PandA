var express = require('express');
var main = require('./main');
var app = express();
var fs = require('fs');

app.configure(function () {
	// Don't show errors explicitly on screen
	app.set('showStackError', true);
	// Express's Request parser
	app.use(express.bodyParser());
	// Adds support for HTTP PUT and DELETE methods
	app.use(express.methodOverride());
	// Express's GZIP implementation
	app.use(express.compress());
	// Express's Cookie parser
	app.use(express.cookieParser());
	// Makes Express use the specified controllers instead of serving static files
	app.use(app.router);
	// Use static file if no controllers were able to respond to the request
	app.use(express.static(__dirname + '/public'));
});

app.get('/', function (req, res) {
	fs.createReadStream('./public/index.html').pipe(res);
});

app.post('/pandify', function (req, res) {
	var filename = req.files['inputFile'].path;
	var exportFilename = req.body.exportFilename;
	var includeClosing = req.body.includeClosing;
	var period = (parseFloat(req.body.seconds) >= 4) ? req.body.seconds : 4;
	main.pandify(filename, exportFilename, includeClosing, period, function (path) {
		res.send({
			sucess: true,
			filename: path
		});
	});
});

app.listen(8000);