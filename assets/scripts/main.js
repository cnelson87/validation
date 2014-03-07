$(function () {
	$(document).on('FormValidator:Valid', function(e){
		console.log('Form is Valid');
	});
	$(document).on('FormValidator:Invalid', function(e,arrData){
		console.log('Form is Invalid');
		console.log(arrData);
	});
	var el = document.getElementById('Form');
	var testFormValidator = new FormValidator(el);
});