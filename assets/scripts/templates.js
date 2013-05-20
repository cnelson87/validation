
var MessageTemplates = {
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
