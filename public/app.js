// Define a little shorthand to make post requests with JSON content
$.postJSON = (url, data) => jQuery.ajax({
	type: 'POST',
	url: url,
	contentType: 'application/json',
	data: JSON.stringify(data),
	dataType: 'json'
});

// Define the API path
const apiPath = window.location.origin + "/api/";

$(() => {
	// Make a map where the keys are all the form's field's names and the values the corresponding DOM elements
	const formFields = new Map(['firstname', 'surname', 'address', 'city', 'postcode'].map(field => [field, $(`#form-${field}`)]));

	// If all the fields are filled in return an object containing the trimmed values, if not notify the user of it
	function getFormData() {
		let hasMissingField = false;
		const formData = {};

		for(const [field, fieldElement] of formFields){
			const value = fieldElement.val().trim();

			if(value == ""){
				hasMissingField = true;
				fieldElement.addClass("w3-border w3-border-red");
			}else{
				formData[field] = value;
				fieldElement.removeClass("w3-border w3-border-red");
			}
		}

		if(hasMissingField){
			$("#form-required").show()
			return;
		}else{
			$("#form-required").hide()
			return formData;
		}
	}

	$("#form-submit").on('click', () => {
		const formData = getFormData();

		if(!formData) return;

		$("#modal-form").hide();
		$("#modal-loading").show();

		$.postJSON(apiPath + 'forms', formData)
			.done(() => {
				$("#result-success").show();
				$("#result-error").hide();
			})
			.fail(() => {
				$("#result-success").hide();
				$("#result-error").show();
			})
			.always(() => {
				$("#modal-loading").hide();
		 		$("#modal-result").show();
				setTimeout(() => $("#modal-result").fadeOut(500), 4000);
			});
	});
});