async function convertCSV(stage, readParams, updateDropdowns) {
	$("#spinner").show();

	$("#" + stage).empty();
	const CSVData = $('#CSVinput').val();
	updateSeparator(CSVData);

	const url = generateParameterizedUrl(readParams, stage=="preview");
	const response = await processData(CSVData, url);
	try {
		const json = JSON.stringify(JSON.parse(response), null, 2)
		$("#" + stage).append(json);
		if (stage == "finalOutput") {
			generateDownload(json);  // Data always gets appended to window, then we dynamically generate download button
		}
		if (updateDropdowns) {
			for (let i = 0; i < buttonsForRefresh.length; i++) {
				populateDropdowns(CSVData, buttonsForRefresh[i]);
			};
		}
	} catch {
		$("#" + stage).append("Oops! Something went wrong. Please check input and try again.");
	}

	$("#spinner").hide();
}


function processData(data, url) {
	return new Promise((resolve, reject) => {
		$.ajax({
		  	type: "POST",
		  	url: url,
		  	data: {data: data},
			dataType: "text",
			success: (response) => {
                resolve(response);
	        },
			error: (response) => {
				reject(response);
			}
		})
	})
}


function generateDownload(JSONData){
	const data = "text/json;charset=utf-8," + encodeURIComponent(JSONData);
	const button = document.getElementById('downloadButton');
	button.href = 'data:' + data;
	button.download = 'data.json';
}


function updateSeparator(CSVData) {
	const separatorProvided = $("#csvSep").val() != "";
	if (!separatorProvided) {
		const separatorChar = detectSeparator(CSVData);
		$("#csvSep").val(separatorChar);
	}
}


function detectSeparator(data) {
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
	return maxChar;
}


function getRadioVal(form) {
    let val;
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


function generateParameterizedUrl(readParams, preview) {
	let file_or_input = "input";
	let csvSep = $('#csvSep').val();
	let headerSel = getRadioVal('headerSel');
	if(csvSep =="\t"){
		csvSep = "tab";
	}

	// Set base variables
	let allFields = [csvSep, headerSel, preview, file_or_input];
	let fieldLabels = ["csv_sep", "header_sel", "preview", "file_or_input"];

	if (readParams) {
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
	urlParams = urlParams.substring(0, urlParams.length - 1);

	// Generate URL based on specified parameters
	let url = window.location.href;
	url = url + "output?" + urlParams;
	return url;
}


function populateDropdowns(data, button) {
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


function resetFields() {
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
