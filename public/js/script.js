$(document).ready(function () {
	var timeValue = $('.timeValue').val();
	timeValue = (timeValue === '') ? 0 : parseFloat(timeValue);
	var timeUnit = $('.timeUnit option:selected').val();
	var options = {
		url: '/pandify',
		dataType: 'json',
		beforeSubmit: function (arr, $form, options)  {
			arr.push({
				name: 'exportFilename',
				value: $('.exportFilename').val()
			});
			arr.push({
				name: 'includeClosing',
				value: $('.includeClosing').val() === 'on' ? true : false
			});
			arr.push({
				name: 'seconds',
				value: (timeUnit === 'minutes') ? 60 * timeValue : timeValue
			});
		},
		success: function (response) {
			if(response && response.sucess) {
				// display results
				var resultFile = $('.resultFile')
					.append('<a></a>')
					.attr({
						href: response.filename,
						innerHTML: response.filename
					})
				;
			}
			else {
				alert('The program encountered an error. Sorry ...');
			}
		}
	};
	$('#myForm').ajaxForm(options);
});








// $('.submitButton').click(function (e) {
// 	e.preventDefault();
// 	var timeValue = $('.timeValue').val();
// 	var timeUnit = $('.timeUnit option:selected').val();
// 	var fd = new FormData();
// 	fd.append('inputFile', $('.inputFile').get(0).files[0]);
// 	debugger;
// 	$.post('http://localhost:8000/pandify', {
// 		inputFile: fd, //$('.inputFile').get(0).files[0],
// 		exportFilename: $('.exportFilename').val(),
// 		includeClosing: $('.includeClosing').val() === 'on' ? true : false,
// 		seconds: (timeUnit === 'minutes') ? 60 * timeValue : timeValue
// 	}).done(function (response) {
// 		if(response && response.sucess) {
// 			// display results
// 			var resultFile = $('.resultFile')
// 				.append('<a></a>')
// 				.attr({
// 					href: response.filename,
// 					innerHTML: response.filename
// 				})
// 			;
// 		}
// 		else {
// 			alert('The program encountered an error. Sorry ...');
// 		}
// 	});
// });