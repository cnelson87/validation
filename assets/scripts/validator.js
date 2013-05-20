
var FormValidator = function(elForm, objOptions) {

	this.elForm = elForm;
	this.options = $.extend({
		validationSummaryId: 'validationSummary',
		selectorFormFields: 'input, select, textarea',
		invalidClass: 'invalid',
		validClass: 'valid'
    }, objOptions || {});

    this.elValidationSummary = document.getElementById(this.options.validationSummaryId);

	this.elFormFields = this.elForm.querySelectorAll(this.options.selectorFormFields);

	// these are the validity properties, in order, that we want to check on an element
	// because there are other properties on the validity object that we don't want / need.
	// ex: Chrome includes non-w3c-compliant 'badInput'.
	this.arrValidityProps = ['valueMissing','tooLong','typeMismatch','rangeOverflow','rangeUnderflow','stepMismatch','patternMismatch'];
	this.arrInvalids = [];
	this.arrMessages = [];

	this.bindEvents();

};

FormValidator.prototype = {
	bindEvents: function () {
		var self = this;

		$(this.elForm).submit(function(e) {
			var elForm = this;
			if (self.isValid(elForm)) {
				e.preventDefault();	// block form post for testing
				//console.log('valid');
				$.event.trigger('FormValidator:valid');
				self.emptyValidationSummary();
			} else {
				e.preventDefault();
				//console.log('invalid');
				self.invalidFormSubmit();
			}
		});

		$(this.elFormFields).blur(function(e) {
			var elInput = this;
			if (elInput.willValidate) {
				self.isValid(elInput, true);
			}
		});

	},

	invalidFormSubmit: function () {
		var elInput;

		this.arrInvalids.length = 0;
		this.arrMessages.length = 0;

		for (var i=0, len=this.elFormFields.length; i<len; i++) {
			elInput = this.elFormFields[i];

			if (elInput.willValidate && !this.isValid(elInput, true)) {
				this.arrInvalids.push(this.validateField(elInput));
			}

		}

		this.buildValidationSummary(this.arrMessages);

		$.event.trigger('FormValidator:invalid', [this.arrInvalids]);

		// old way
		// this.validateFields();
	},

	validateField: function (elInput) {
		var name = elInput.name || 'Name';
		var label = elInput.dataset.label || 'Field';
		var data = {'label': label};
		var error;
		var message;

		for (var i=0, len=this.arrValidityProps.length; i<len; i++) {

			if (elInput.validity[this.arrValidityProps[i]]) {
				error = this.arrValidityProps[i];
				if (error === 'typeMismatch') {
					if (elInput.type === 'email') {
						error = 'emailMismatch';
					} else if (elInput.type === 'url') {
						error = 'urlMismatch';
					}
				}
				if (error === 'rangeOverflow') {
					data['max'] = elInput.max;
				}
				if (error === 'rangeUnderflow') {
					data['min'] = elInput.min;
				}
				message = Mustache.render(this.Messages[error], data);
				break;
			}

		}

		//console.log(message);
		this.arrMessages.push(message);

		return {'el': elInput, 'name': name, 'message': message};

	},

	// old way
	// validateFields: function () {
	// 	var elInput = null;
	// 	var label = null;
	// 	var name = null;
	// 	var template = null;
	// 	var message = null;
	// 	var data = {};
	// 	var arrInvalids = [];
	// 	var arrMessages = [];

	// 	for (var i=0, len = this.elFormFields.length; i<len; i++) {
	// 		elInput = this.elFormFields[i];
	// 		name = elInput.name || 'Name';
	// 		label = elInput.dataset.label || 'Field';
	// 		data['label'] = label;

	// 		if (elInput.willValidate) {
	// 			if (!this.isValid(elInput, true)) {

	// 				switch (true) {
	// 					case this.isValueMissing(elInput):
	// 						// any required field
	// 						template = this.Messages.valueMissing;
	// 						break;
	// 					case this.isTooLong(elInput):
	// 						// mostly unsupported, only textarea if content is preset and then modified by user
	// 						template = this.Messages.tooLong;
	// 						break;
	// 					case this.isTypeMismatch(elInput):
	// 						// only types 'email' and 'url' throw typeMismatch
	// 						if (elInput.type === 'email') {
	// 							template = this.Messages.emailMismatch;
	// 						} else if (elInput.type === 'url') {
	// 							template = this.Messages.urlMismatch;
	// 						} else {
	// 							// catch-all
	// 							template = this.Messages.typeMismatch;
	// 						}
	// 						break;
	// 					case this.isRangeOverflow(elInput):
	// 						// type 'number'
	// 						data['max'] = elInput.max;
	// 						template = this.Messages.rangeOverflow;
	// 						break;
	// 					case this.isRangeUnderflow(elInput):
	// 						// type 'number'
	// 						data['min'] = elInput.min;
	// 						template = this.Messages.rangeUnderflow;
	// 						break;
	// 					case this.isStepMismatch(elInput):
	// 						// type 'number'
	// 						template = this.Messages.stepMismatch;
	// 						break;
	// 					case this.isPatternMismatch(elInput):
	// 						// custom pattern data attribute
	// 						template = this.Messages.patternMismatch;
	// 						break;
	// 				}

	// 				message = Mustache.render(template, data);

	// 				arrInvalids.push({"el": elInput, "property": name, "message": message});
	// 				arrMessages.push(message);

	// 			}
	// 		}

	// 	}

	// 	this.buildValidationSummary(arrMessages);

	// 	return arrInvalids;

	// },

	buildValidationSummary: function (arrMessages) {
		var innerHTML = Mustache.render(this.Messages.validationSummary, arrMessages);
		this.elValidationSummary.classList.remove(this.options.validClass);
		this.elValidationSummary.classList.add(this.options.invalidClass);
		this.elValidationSummary.innerHTML = innerHTML;
	},
	emptyValidationSummary: function () {
		var innerHTML = '<h3>Validation Summary:</h3><p>Form is valid.</p>';
		this.elValidationSummary.classList.remove(this.options.invalidClass);
		this.elValidationSummary.classList.add(this.options.validClass);
		this.elValidationSummary.innerHTML = innerHTML;
	},


/**
*	Public Methods
**/

	isValid: function (el, triggerHighlighting) {
		var validity = el.checkValidity();
		if (triggerHighlighting) {
			if (validity) {
				this.unhighlight(el);
			} else {
				this.highlight(el);
			}
		}
		return validity;
	},

	// validation methods map to constraint validation API
	isValueMissing: function (el) {
		return el.validity.valueMissing;
	},
	isTooLong: function (el) {
		return el.validity.tooLong;
	},
	isTypeMismatch: function (el) {
		return el.validity.typeMismatch;
	},
	isRangeOverflow: function (el) {
		return el.validity.rangeOverflow;
	},
	isRangeUnderflow: function (el) {
		return el.validity.rangeUnderflow;
	},
	isStepMismatch: function (el) {
		return el.validity.stepMismatch;
	},
	isPatternMismatch: function (el) {
		return el.validity.patternMismatch;
	},

	// 'invalidates' fields by highlighting provided fields as 'invalid'
	highlight: function (el) {
		el.classList.add(this.options.invalidClass);
	},
	unhighlight: function (el) {
		el.classList.remove(this.options.invalidClass);
	},
	highlightByName: function (name) {
		var el = document.querySelector('[name=' + name + ']');
		this.highlight(el);
	},
	unhighlightByName: function (name) {
		var el = document.querySelector('[name=' + name + ']');
		this.unhighlight(el);
	},


/**
*	Message Templates
**/

	Messages: {
		valueMissing: "{{label}} is a required field.",
		tooLong: "{{label}} is too long.",
		typeMismatch: "{{label}} must match requested format.",
		emailMismatch: "{{label}} must be formatted as an email.",
		urlMismatch: "{{label}} must be formatted as a url.",
		rangeOverflow: "{{label}} must be less than or equal to {{max}}.",
		rangeUnderflow: "{{label}} must be greater than or equal to {{min}}.",
		stepMismatch: "{{label}} must match requested format.",
		patternMismatch: "{{label}} must match requested format.",
		validationSummary: "<h3>Validation Summary:</h3><ul>{{#.}}<li>{{.}}</li>{{/.}}</ul>"
	}

};
