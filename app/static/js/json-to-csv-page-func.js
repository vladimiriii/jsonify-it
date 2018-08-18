// Universal Values
const buttonsForRefresh = ["indexCol", "sumField", "avgField", "nestCol"];

/*-------------------------------------
On page ready
-------------------------------------*/
$(document).ready(function(){

	let byId = function (id) { return document.getElementById(id); }

	// Process Data Button
	$('#process-data').click(function(){

		// Load the data
		let jsonData = $('#JSONinput').val();

		// Separator
		let CSVsep = $('#csvSep').val();

		// Wrap in quotes?
		let includeQuotes = getRadioVal("quote-select");

		// Transpose data
		let transpose = $('#transpose-checkbox').is(":checked");

		// Combine into object
		let info = {
			"json_data": jsonData,
			"sep": CSVsep,
			"quotes": includeQuotes,
			"transpose": transpose
		}

		// Process the data
		const postTo = "#csv-output";
		processData(info, postTo);

		// Scroll Page Down
		$('html, body').animate({scrollTop: $("#output").offset().top}, 1000);
	});

});

/*-------------------------------------
Get selected value from specified radio button
-------------------------------------*/
function getRadioVal(form) {

    let val;

    // get list of radio buttons with specified name
    let listItems = document.getElementById(form);
	let radios = listItems.getElementsByTagName('input');

    // loop through list of radio buttons
    for (let i=0, len=radios.length; i<len; i++) {
        if ( radios[i].checked ) { // radio checked?
            val = radios[i].value; // if so, hold its value in val
            break; // and break out of for loop
        }
    }

    return val; // return value of checked radio or undefined if none checked
}

/*-------------------------------------
Process CSV data
-------------------------------------*/
function processData(dataJson, postTo) {
	$(postTo).empty();

	// Post data to API
	$.ajax({
	  	type: "POST",
	  	url: '/process-json-to-csv',
	  	data: JSON.stringify(dataJson),
		contentType: 'application/json',
		success: function(result) {
			// clean up string
			formatted_result = result.substring(1, result.length - 1)
			formatted_result = escapeHtml(formatted_result)
			formatted_result = formatted_result.replace(/\\n/g, "&#013;&#010;")

			$(postTo).append(formatted_result);
		},
		error: function(msg) {
			$(postTo).append(msg);
		}
	});
};

/*-------------------------------------
Dynamically generate JSON file for download
-------------------------------------*/
function generateDownload(JSONData){
	let data = "text/json;charset=utf-8," + encodeURIComponent(JSONData);
	let button = document.getElementById('downloadButton');
	button.href = 'data:' + data;
	button.download = 'data.csv';
}

function escapeHtml(text) {
  return text
      .replace(/\\&/g, "&amp;")
      .replace(/\\</g, "&lt;")
      .replace(/\\>/g, "&gt;")
      .replace(/\\"/g, "&quot;")
      .replace(/\\'/g, "&#039;");
}
