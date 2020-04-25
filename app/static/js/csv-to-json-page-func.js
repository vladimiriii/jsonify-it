// Universal Values
const buttonsForRefresh = ["indexCol", "sumField", "avgField", "nestCol"];

/*-------------------------------------
On page ready
-------------------------------------*/
$(document).ready(function(){

	let byId = function (id) { return document.getElementById(id); }

	// Process Data Button
	$('#process-data').click(function(){

        // Reset drop downs and selected list
        resetFields()

		// Load the data
		let CSVData = $('#CSVinput').val();

		// Detect separator char
		detectSep(CSVData);

		// Get the parameters
		let url = getParams(preview=true, stage="process");

		// Process the data
		const postTo = "#preview";
		processData(CSVData, url, postTo);

		// Populate dropdown lists
		for (let i = 0; i < buttonsForRefresh.length; i++) {
			populateDropdowns(CSVData, buttonsForRefresh[i]);
        };

		// Scroll Page Down
		$('html, body').animate({scrollTop: $("#outputOptions").offset().top}, 1000);
	});

	// Reprocess Data Button
	$('#reprocessData').click(function(){
		// Load the data
		let CSVData = $('#CSVinput').val();

		// Get the parameters
		let url = getParams(preview=true, stage="process");

		// Process the data
		const postTo = "#preview";
		processData(CSVData, url, postTo);

		// Populate dropdown lists
		for(let i = 0; i < buttonsForRefresh.length; i++){
			populateDropdowns(CSVData, buttonsForRefresh[i]);
        };
	});

	// Adjustable List for Nesting
	let editableList = Sortable.create(byId('editable'), {
		animation: 150,
		filter: '.js-remove',
		onFilter: function (evt) {
			evt.item.parentNode.removeChild(evt.item);
		}
	});

	// Add level button
	$('#addLevel').click(function(){
		let nestCol = getRadioVal('nestCol');
		let el = document.createElement('li');
		el.className = "el-item";
		el.setAttribute('data-value', nestCol);
		el.innerHTML = nestCol + '<i class="js-remove">✖</i>';
		editableList.el.appendChild(el);
	});


	// Update Preview Button
	$('#updatePreview').click(function(){
		// Load the data
		let CSVData = $('#CSVinput').val();

		// Get the parameters
		let url = getParams(preview=true, stage="output");

		// Update Preview Window
		let postTo = "#preview"
		processData(CSVData, url, postTo);

	});

	// Get Final Output Button
	$('#convertData').click(function(){
		// Load the data
		let CSVData = $('#CSVinput').val();

		// Get the parameters
		let url = getParams(preview=false, stage="output");

		// Output Data to Final window
		let postTo = "#finalOutput"
		processData(CSVData, url, postTo);

	});

});

/*-------------------------------------
Autodetect Separator
-------------------------------------*/
function detectSep(data) {
	// Extract first row of data
	let rows = data.split(/\n|\r/);
	let firstRow = rows[0];
	// Remove all normal chars
	firstRow = firstRow.replace(/([A-Z]|[0-9]|\"|\'|\.|_| )/ig, "");

	// Find most common char left
	let charCounts = {};
	let maxChar = '';
	for(let i = 0; i < firstRow.length; i++){

		let char = firstRow[i];
	    if(!charCounts[char]){charCounts[char] = 0;};
	    charCounts[char]++;

		// Update max key
	    if(maxChar == '' || charCounts[char] > charCounts[maxChar]){
	        maxChar = char;
	    };
	};

	// Append value to field
	$("#csvSep").val(maxChar);
}

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
Get parameters from the HTML form
-------------------------------------*/
function getParams(preview, stage) {

	let file_or_input = "input";
	let csvSep = $('#csvSep').val();
	let headerSel = getRadioVal('headerSel');

	// Handle tab separated data
	if(csvSep =="\t"){
		csvSep = "tab";
	}

	// Set base variables
	let allFields = [csvSep, headerSel, preview, file_or_input];
	let fieldLabels = ["csv_sep", "header_sel", "preview", "file_or_input"];

	// Only get output parameters when doing update or final output
	if(stage == 'output'){
		let rootNode = $('#root-node').val();
        let nameKey = $('#name-key').val();
		let childKey = $('#child-key').val();
		let avgFieldName = $('#avgFieldName').val();
		let sumFieldName = $('#sumFieldName').val();

		// Radio buttons
		let indexCol = getRadioVal('indexCol');
		let baseStructure = getRadioVal('baseStr');
		let wrapperSel = getRadioVal('wrapperSel');
		let sumField = getRadioVal('sumField');
		let avgField = getRadioVal('avgField');

		// Nesting Columns
		let colNames = ""
		let listItems = document.getElementById("editable");
		let levels = listItems.getElementsByTagName('li');
	    for (let i=0, len=levels.length; i<len; i++) {
	        colNames = colNames + String(levels[i].getAttribute('data-value')) + ",";
	    }
		colNames = colNames.substring(0, colNames.length - 1);

		// List of all parameters
		allFields = [csvSep, indexCol, headerSel, baseStructure, wrapperSel, colNames, rootNode, nameKey, childKey, sumField, sumFieldName, avgField, avgFieldName, preview, file_or_input];
		fieldLabels = ["csv_sep", "index_col", "header_sel", "base_structure", "wrapper", "col_names", "root_node", "name_key", "child_key", "sum_field", "sum_field_name", "avg_field", "avg_field_name", "preview", "file_or_input"];
	}

	// Generate URL
	urlParams = "";
	joinChar = "";
	for (let i in allFields) {
		if (allFields[i]) {
			urlParams = urlParams + fieldLabels[i] + "=" + allFields[i] + "&";
		}
	}

	// Remove final '&'
	urlParams = urlParams.substring(0, urlParams.length - 1);

	// Generate URL based on specified parameters
	let url = window.location.href;
	url = url + "output?" + urlParams;
	return url;
}

/*-------------------------------------
Populate Dropdown Boxes
-------------------------------------*/
function populateDropdowns(data, button) {

	// Get values
	let headerSel = getRadioVal('headerSel');
	let csvSep = $('#csvSep').val();
	let rows = data.split(/\n|\r/);
	let options = rows[0].split(csvSep);
    let opt;

	options.unshift("None");

	let nameText = button.concat("1");
	// Get ID and empty old values
	let select = document.getElementById(button);
	while (select.firstChild) {
	    select.removeChild(select.firstChild);
	}

	// Loop through options
	for (let i = 0; i < options.length; i++) {

		// If no header, replace with generic values
		if (headerSel == 'true'){
	    	opt = options[i];
		} else{
			opt = String(i-1);
		}
		let labelText = nameText.concat("_", String(i));

		// Create elements
	    let li = document.createElement("li");
		let input = document.createElement("input");
		let label = document.createElement("label");

		// Add information
		input.type = "radio";
		input.id = labelText;
		input.name = nameText;
		if (i == 0) {
			input.value = "";
			input.checked = true;
			$(label).append("None");
		} else {
			input.value = opt;
			$(label).append(opt);
			}
		label.htmlFor = labelText;


		// Append nested objects
		li.appendChild(input);
		li.appendChild(label);
	    select.appendChild(li);
	}
}

function resetFields(){

    // Index dropdown
    $('#indexCol').empty();
    $('#indexBtn').text("None");

    // Nesting list
    $('.el-item').remove();
    $('#nestCol').empty();
    $('#levelModalBtn').text("None");

    // Sum and Average Fields
    $('#sumField').empty();
    $('#sumFieldBtn').text("None");
    $('#sumFieldName').val("");
    $('#avgField').empty();
    $('#avgFieldBtn').text("None");
    $('#avgFieldName').val("");
}

/*-------------------------------------
Process CSV data
-------------------------------------*/
function processData(data, url, postTo) {
	$(postTo).empty();

	// Post data to API
	dataJson = {data: data};
	$.ajax({
	  	type: "POST",
	  	url: url,
	  	data: dataJson,
		dataType: "text",
		success: function(result) {
			// Parse json string
			let json = JSON.parse(result);
			$(postTo).append(JSON.stringify(json, null, 2));
			if(postTo == "#finalOutput"){
				generateDownload(JSON.stringify(json, null, 2));
			}

        },
		error: function(msg){
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
	button.download = 'data.json';
}
