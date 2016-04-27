// Universal Values
var buttonsForRefresh = ["indexCol", "sumField", "avgField", "nestCol"];

/*-------------------------------------
On page ready
-------------------------------------*/
$(document).ready(function(){
	
	var byId = function (id) { return document.getElementById(id); }
	
	// Process Data Button
	$('#process-data').click(function(){
		// Load the data
		var CSVData = getData();
		
		// Detect separator char
		detectSep(CSVData);
		
		// Get the parameters
		var url = getParams(preview=true, stage="process");
		
		// Process the data
		var postTo = "#preview"
		processData(CSVData, url, postTo);
	
		// Populate dropdown lists
		for(var i = 0; i < buttonsForRefresh.length; i++)
			populateDropdowns(CSVData, buttonsForRefresh[i]);
		
		// Scroll Page Down	  
		$('html, body').animate({scrollTop: $("#outputOptions").offset().top}, 1000);
	}); 
	
	// Reprocess Data Button
	$('#reprocessData').click(function(){
		// Load the data
		var CSVData = getData();
		
		// Get the parameters
		var url = getParams(preview=true, stage="process");
		
		// Process the data
		var postTo = "#preview"
		processData(CSVData, url, postTo);
	
		// Populate dropdown lists
		for(var i = 0; i < buttonsForRefresh.length; i++)
			populateDropdowns(CSVData, buttonsForRefresh[i]);
	});
	
	// Adjustable List for Nesting
	var editableList = Sortable.create(byId('editable'), {
		animation: 150,
		filter: '.js-remove',
		onFilter: function (evt) {
			evt.item.parentNode.removeChild(evt.item);
		}
	});
	
	// Add level button
	$('#addLevel').click(function(){
		var nestCol = getRadioVal('nestCol');
		var el = document.createElement('li');
		el.className = "el-item";
		el.setAttribute('data-value', nestCol);
		el.innerHTML = nestCol + '<i class="js-remove">✖</i>';
		editableList.el.appendChild(el);
	});
	
	
	// Update Preview Button
	$('#updatePreview').click(function(){
		// Load the data
		var CSVData = getData();
		
		// Get the parameters
		var url = getParams(preview=true, stage="output");
		
		// Update Preview Window
		var postTo = "#preview"
		processData(CSVData, url, postTo);

	});
	
	// Get Final Output Button
	$('#convertData').click(function(){
		// Load the data
		var CSVData = getData();
		
		// Get the parameters
		var url = getParams(preview=false, stage="output");
		
		// Output Data to Final window
		var postTo = "#finalOutput"
		processData(CSVData, url, postTo);
		
	});

});

/*-------------------------------------
Get CSV data
-------------------------------------*/
function getData() {
	// Get CSV data from window
	var CSVData = document.getElementById('CSVinput').value;
	
	return CSVData;
}
  
/*-------------------------------------
Autodetect Separator
-------------------------------------*/
function detectSep(data) {
	// Extract first row of data
	var rows = data.split(/\n|\r/);
	var firstRow = rows[0];
	// Remove all normal chars
	firstRow = firstRow.replace(/([A-Z]|[0-9]|\"|\'|\.|_)/ig, "");

	// Find most common char left
	var charCounts = {};
	var maxChar = '';
	for(var i = 0; i < firstRow.length; i++){
    
		var char = firstRow[i];
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
	
    var val;
	
    // get list of radio buttons with specified name
    var listItems = document.getElementById(form);
	var radios = listItems.getElementsByTagName('input');
  
    // loop through list of radio buttons
    for (var i=0, len=radios.length; i<len; i++) {
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
	
	var file_or_input = "input";
	var csvSep = document.getElementById('csvSep').value;
	var headerSel = getRadioVal('headerSel');
	
	// Handle tab separated data
	if(csvSep =="\t"){
		csvSep = "tab";
	}
	
	// Set base variables
	var allFields = [csvSep, headerSel, preview, file_or_input];
	var fieldLabels = ["csv_sep", "header_sel", "preview", "file_or_input"];
	
	// Only get output parameters when doing update or final output
	if(stage == 'output'){
		var rootNode = document.getElementById('root-node').value;
		var ChildField = document.getElementById('nest-key').value;
		var avgFieldName = document.getElementById('avgFieldName').value;
		var sumFieldName = document.getElementById('sumFieldName').value;
		
		// Radio buttons
		var indexCol = getRadioVal('indexCol');
		var baseStructure = getRadioVal('baseStr');
		var wrapperSel = getRadioVal('wrapperSel');
		var sumField = getRadioVal('sumField');
		var avgField = getRadioVal('avgField');
		
		// Nesting Columns
		var colNames = ""
		var listItems = document.getElementById("editable");
		var levels = listItems.getElementsByTagName('li');
	    for (var i=0, len=levels.length; i<len; i++) {
	        colNames = colNames + String(levels[i].getAttribute('data-value')) + ",";
	    }		
		colNames = colNames.substring(0, colNames.length - 1);
		
		// List of all parameters
		var allFields = [csvSep, indexCol, headerSel, baseStructure, wrapperSel, colNames, rootNode, ChildField, sumField, sumFieldName, avgField, avgFieldName, preview, file_or_input];
		var fieldLabels = ["csv_sep", "index_col", "header_sel", "base_structure", "wrapper", "col_names", "root_node", "child_field", "sum_field", "sum_field_name", "avg_field", "avg_field_name", "preview", "file_or_input"];
	}
	
	// Generate URL
	urlParams = "";
	joinChar = "";
	for (var i in allFields) {
		if (allFields[i]) {
			urlParams = urlParams + fieldLabels[i] + "=" + allFields[i] + "&";
		}
	} 
	
	// Remove final '&'
	urlParams = urlParams.substring(0, urlParams.length - 1);
	
	// Generate URL based on specified parameters
	var url = window.location.href;
	url = url + "output?" + urlParams;
	console.log(url);
	return url;
}

/*-------------------------------------
Populate Dropdown Boxes
-------------------------------------*/
function populateDropdowns(data, button) {
	
	// Get values
	var headerSel = getRadioVal('headerSel');
	var csvSep = document.getElementById('csvSep').value;
	var rows = data.split(/\n|\r/);
	var options = rows[0].split(csvSep);
	
	options.unshift("None");
	
	var nameText = button.concat("1");
	// Get ID and empty old values
	var select = document.getElementById(button);
	while (select.firstChild) {
	    select.removeChild(select.firstChild);
	}

	// Loop through options
	for(var i = 0; i < options.length; i++) {

		// If no header, replace with generic values
		if(headerSel == 'true'){
	    	var opt = options[i];
		} else{
			var opt = String(i-1);
		}
		var labelText = nameText.concat("_", String(i));
		
		// Create elements
	    var li = document.createElement("li");
		var input = document.createElement("input");
		var label = document.createElement("label");
		
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
			var json = JSON.parse(result);
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
	var data = "text/json;charset=utf-8," + encodeURIComponent(JSONData);
	var button = document.getElementById('downloadButton');
	button.href = 'data:' + data;
	button.download = 'data.json';
}