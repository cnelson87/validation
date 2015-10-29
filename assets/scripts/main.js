$(function() {
	$(document).on('Validator:Valid', function(e) {
		console.log('Form is Valid');
	});
	$(document).on('Validator:Invalid', function(e,arrData) {
		console.log('Form is Invalid');
		console.log(arrData);
	});
	var el = document.getElementById('Form');
	var validator = new Validator(el);
});