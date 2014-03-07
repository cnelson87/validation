
var FormValidator = function (el, objOptions) {

	this.el = el;
	this.$el = $(el);
	this.options = $.extend({
		validationSummaryId: 'validationSummary',
		selectorFormFields: 'input, select, textarea',
		invalidClass: 'invalid',
		validClass: 'valid'
	}, objOptions || {});

	this._init();

};

FormValidator.prototype = {
	_init: function () {
		var self = this;

		this.el.setAttribute('novalidate', 'novalidate');

		this.elValidationSummary = document.getElementById(this.options.validationSummaryId);

		this.elFormFields = this.el.querySelectorAll(this.options.selectorFormFields);
		this.$elFormFields = $(this.elFormFields);

		this.arrInvalids = [];
		this.arrMessages = [];

		this._bindEvents();

	},

	_bindEvents: function () {
		var self = this;

		this.$elFormFields.on('change', function (e) {
			var elInput = this;
			self.__onInputChange(elInput);
		});

		this.$el.on('submit', function (e) {
			self.__onFormSubmit(e);
		});

	},

	__onInputChange: function (elInput) {
		if (elInput.willValidate) {
			if (this.isValid(elInput)) {
				this.unhighlight(elInput);
			} else {
				this.highlight(elInput);
			}
		}
	},

	__onFormSubmit: function (e) {
		if (this.isValid(this.el)) {
			e.preventDefault();	// block form post for testing
			//console.log('valid');
			this._validFormSubmit();
		} else {
			e.preventDefault();
			//console.log('invalid');
			this._invalidFormSubmit();
		}
	},

	_validFormSubmit: function () {
		this.emptyValidationSummary();
		$.event.trigger('FormValidator:Valid');
	},

	_invalidFormSubmit: function () {
		var elInput;

		this.arrInvalids.length = 0;
		this.arrMessages.length = 0;

		for (var i=0, len=this.elFormFields.length; i<len; i++) {
			elInput = this.elFormFields[i];

			if (elInput.willValidate) {
				if (this.isValid(elInput)) {
					this.unhighlight(elInput);
				} else {
					this.highlight(elInput);
					this.arrInvalids.push(this.validateField(elInput));
				}
			}

		}

		this.buildValidationSummary(this.arrMessages);

		$.event.trigger('FormValidator:Invalid', [this.arrInvalids]);

	},


/**
*	Public Methods
**/

	validateField: function (elInput) {
		var name = elInput.name || 'Name';
		//IE doesn't support native dataset...
		//var label = elInput.dataset.label || 'Field';
		//...so either use jQuery data()...
		//var label = elInput.data('label') || 'Field';
		//...or use native getAttribute().
		var label = elInput.getAttribute('data-label') || 'Field';
		var data = {'label': label};
		var error;
		var message;
		// console.log(elInput);

		for (var i=0, len=this.validityProps.length; i<len; i++) {
			if (elInput.validity[this.validityProps[i]]) {
				error = this.validityProps[i];
				break;
			}
		}

		// special cases
		if (error === 'typeMismatch' && elInput.type === 'email') {
			error = 'emailMismatch';
		}
		if (error === 'typeMismatch' && elInput.type === 'url') {
			error = 'urlMismatch';
		}
		if ((error === 'typeMismatch' || error === 'badInput') && elInput.type === 'number') {
			error = 'numberMismatch';
		}
		if (error === 'rangeOverflow') {
			data['max'] = elInput.max;
		}
		if (error === 'rangeUnderflow') {
			data['min'] = elInput.min;
		}

		message = Mustache.render(this.msgTemplates[error], data);

		this.arrMessages.push(message);

		return {'el': elInput, 'name': name, 'message': message};

	},

	buildValidationSummary: function (arrMessages) {
		var innerHTML = Mustache.render(this.msgTemplates.validationSummary, arrMessages);
		this.elValidationSummary.classList.remove(this.options.validClass);
		this.elValidationSummary.classList.add(this.options.invalidClass);
		this.elValidationSummary.innerHTML = innerHTML;
	},
	emptyValidationSummary: function () {
		var innerHTML = Mustache.render(this.msgTemplates.validForm);
		this.elValidationSummary.classList.remove(this.options.invalidClass);
		this.elValidationSummary.classList.add(this.options.validClass);
		this.elValidationSummary.innerHTML = innerHTML;
	},

	// takes a form or form element and returns true/false.
	isValid: function (el) {
		var validity = el.checkValidity();
		return validity;
	},

	// utility validation methods map to constraint validation API
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
	isBadInput: function (el) {
		return el.validity.badInput;
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

	// the validity properties, in order, that we want to check on an element
	// due to other properties of the validity object that we don't want / need.
	// ex: webkit (Chrome, Safari) includes non-w3c-compliant 'badInput'.
	validityProps: [
		'valueMissing',
		'tooLong',
		'typeMismatch',
		'rangeOverflow',
		'rangeUnderflow',
		'stepMismatch',
		'patternMismatch',
		'badInput'
	],

	// message templates
	msgTemplates: {
		valueMissing: "{{label}} is a required field.",
		tooLong: "{{label}} is too long.",
		typeMismatch: "{{label}} must match requested format.",
		emailMismatch: "{{label}} must be formatted as an email.",
		urlMismatch: "{{label}} must be formatted as a url.",
		numberMismatch: "{{label}} must be formatted as a number.",
		rangeOverflow: "{{label}} must be less than or equal to {{max}}.",
		rangeUnderflow: "{{label}} must be greater than or equal to {{min}}.",
		stepMismatch: "{{label}} must match requested format.",
		patternMismatch: "{{label}} must match requested format.",
		validationSummary: "<h3>Validation Summary:</h3><ul>{{#.}}<li>{{.}}</li>{{/.}}</ul>",
		validForm: "<h3>Validation Summary:</h3><p>Form is valid.</p>"
	}

};
