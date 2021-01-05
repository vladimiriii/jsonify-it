$(document).ready(function(){
	const examples = $("#examples").children();

	for (let i = 1; i <= examples.length; i++) {
		$("#example-input-" + String(i)).text(inputData);
	}
})
