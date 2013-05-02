
var Validator = function(elForm, objOptions) {

	this.elForm = elForm;
	this.options = $.extend({
		validationSummaryId: 'validationSummary',
		selectorFormFields: 'input, select, textarea',
		invalidClass: 'invalid',
		validClass: 'valid'
    }, objOptions || {});

    this.elValidationSummary = document.getElementById(this.options.validationSummaryId);

	this.elFormFields = this.elForm.querySelectorAll(this.options.selectorFormFields);

	this.bindEvents();

};

Validator.prototype = {
	bindEvents: function () {
		var self = this;

		$(this.elForm).submit(function(e) {
			var elForm = this;
			if (self.isValid(elForm)) {
				e.preventDefault();	// block form from posting for testing
				//console.log('valid!');
				$.event.trigger('Validator:valid');
				self.emptyValidationSummary();
			} else {
				e.preventDefault();
				//console.log('invalid!');
				$.event.trigger('Validator:invalid');
				self.validate();
			}
		});

		$(this.elFormFields).blur(function(e) {
			var elInput = this;
			if (elInput.willValidate) {
				self.isValid(elInput, true);
			}
		});

	},

	validate: function () {
		var len = this.elFormFields.length;
		var elInput = null;
		var label = null;
		var name = null;
		var message = null;
		var arrInvalids = [];
		var arrMessages = [];

		for (var i=0; i<len; i++) {
			elInput = this.elFormFields[i];
			name = elInput.name || 'Name';
			label = elInput.dataset.label || 'Field';

			if (elInput.willValidate) {
				if (!this.isValid(elInput, true)) {

					if (this.isRequiredField(elInput)) {
						message = Mustache.render(this.Messages.requiredField, {"label":label});

					} else if (this.isTooLong(elInput)) {
						// currently no browser actually catches tooLong
						message = Mustache.render(this.Messages.tooLong, {"label":label});

					} else if (this.isTypeMismatch(elInput)) {
						// currently only types 'email' and 'url' throw typeMismatch
						if (elInput.type === 'email') {
							message = Mustache.render(this.Messages.emailMismatch, {"label":label});

						} else if (elInput.type === 'url') {
							message = Mustache.render(this.Messages.urlMismatch, {"label":label});

						} else {
							// catch-all
							message = Mustache.render(this.Messages.typeMismatch, {"label":label});

						}

					} else if (this.isRangeOverflow(elInput)) {
						// type 'number'
						message = Mustache.render(this.Messages.rangeOverflow, {"label":label, "max":elInput.max});

					} else if (this.isRangeUnderflow(elInput)) {
						// type 'number'
						message = Mustache.render(this.Messages.rangeUnderflow, {"label":label, "min":elInput.min});
					
					} else if (this.isStepMismatch(elInput)) {
						// type 'number'
						message = Mustache.render(this.Messages.stepMismatch, {"label":label});

					} else if (this.isPatternMismatch(elInput)) {
						message = Mustache.render(this.Messages.patternMismatch, {"label":label});

					}

					arrInvalids.push({"el": elInput, "property": name, "message": message});
					arrMessages.push(message);

				}
			}

		}

		this.buildValidationSummary(arrMessages);

		return arrInvalids;

	},
	buildValidationSummary: function (arrMessages) {
		var innerHTML = Mustache.render(this.Messages.validationSummary, arrMessages);
		this.elValidationSummary.classList.add(this.options.invalidClass);
		this.elValidationSummary.classList.remove(this.options.validClass);
		this.elValidationSummary.innerHTML = innerHTML;
	},
	emptyValidationSummary: function () {
		var innerHTML = '<h3>Validation Summary:</h3><p>Form is valid.</p>';
		this.elValidationSummary.classList.add(this.options.validClass);
		this.elValidationSummary.classList.remove(this.options.invalidClass);
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
	isRequiredField: function (el) {
		return el.validity.valueMissing;
	},
	isTypeMismatch: function (el) {
		return el.validity.typeMismatch;
	},
	isTooLong: function (el) {
		return el.validity.tooLong;
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
	highlight: function (el) {
		el.classList.add(this.options.invalidClass);
	},
	unhighlight: function (el) {
		el.classList.remove(this.options.invalidClass);
	},
	highlightProperty: function (property) {
		var el = document.querySelector('[name=' + property + ']');
		this.highlight(el);
	},
	unhighlightProperty: function (property) {
		var el = document.querySelector('[name=' + property + ']');
		this.unhighlight(el);
	},


/**
*	Message Templates
**/

	Messages: {
		requiredField: "{{label}} is a required field.",
		tooLong: "{{label}} is too long.",
		typeMismatch: "{{label}} is invalid.",
		emailMismatch: "{{label}} needs to be formatted as an email.",
		urlMismatch: "{{label}} needs to be formatted as a url.",
		rangeOverflow: "{{label}} must be less than or equal to {{max}}.",
		rangeUnderflow: "{{label}} must be greater than or equal to {{min}}.",
		stepMismatch: "{{label}} needs to be in the valid format.",
		patternMismatch: "{{label}} needs to be in the valid format.",
		validationSummary: "<h3>Validation Summary:</h3><ul>{{#.}}<li>{{.}}</li>{{/.}}</ul>"
	}

};

$(function () {
	var elForm = document.getElementById('Form');
	var testFormValidator = new Validator(elForm);
});
