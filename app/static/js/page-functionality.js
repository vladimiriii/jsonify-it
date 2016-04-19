// Universal Values
var buttonsForRefresh = ["indexCol", "groupBy", "sumField", "avgField"];
var fieldLabels = ["csv_sep", "index_col", "base_structure", "group_by", "root_node", "child_field", "sum_field", "sum_field_name", "avg_field", "avg_field_name", "preview", "file_or_input"];

$(document).ready(function(){
	// Process Data Button
    $('#process-data').click(function(){
		var CSVData = processData();
	
		// Populate dropdown lists
		for(var i = 0; i < buttonsForRefresh.length; i++)
		populateDropdowns(CSVData, buttonsForRefresh[i]);
		
   		// Scroll Page Down	  
		$('html, body').animate({scrollTop: $("#outputOptions").offset().top}, 1000);
	}); 
	
	// Update Preview Button
    $('#updatePreview').click(function(){
		processData();
	});
	
	// Get Final Output Button
    $('#convertData').click(function(){
		getFinalOutput();
	});
  });

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
Process CSV data
-------------------------------------*/
function processData() {
	$("#preview").empty();
	
	// Get CSV data from window
	var CSVData = document.getElementById('CSVinput').value;
	
	// Get parameters
	var csvSep = document.getElementById('csvSep').value;
	var indexCol = getRadioVal('indexCol');
	var baseStructure = getRadioVal('baseStr');
	var groupBy = getRadioVal('groupBy');
	var rootNode = document.getElementById('root-node').value;
	var ChildField = document.getElementById('nest-key').value;
	var sumField = getRadioVal('sumField');
	var sumFieldName = document.getElementById('sumFieldName').value;
	var avgField = getRadioVal('avgField');
	var avgFieldName = document.getElementById('avgFieldName').value;
	var preview = true;
	var file_or_input = "input";
	
	var allFields = [csvSep, indexCol, baseStructure, groupBy, rootNode, ChildField, sumField, sumFieldName, avgField, avgFieldName, preview, file_or_input];
	
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
	url = url + "output?" + urlParams
	console.log(url)
	// Post data to API
	CSVDataJson = {data: CSVData}; 
	
	$.ajax({
	  	type: "POST",
	  	url: url,
	  	data: CSVDataJson,
		dataType: "text",
		success: function(result) {
			// Parse json string
			var json = JSON.parse(result);
			$("#preview").append(JSON.stringify(json, null, 2));
        }
	});	
	
	return CSVData
};

/*-------------------------------------
Populate Dropdown Boxes
-------------------------------------*/
function populateDropdowns(data, button) {
	
	// Get values
	var rows = data.split(/\n|\r/);
	var options = rows[0].split(",");
	options.unshift("None");
	var nameText = button.concat("1");
	
	// Get ID and empty old values
	var select = document.getElementById(button);
	while (select.firstChild) {
	    select.removeChild(select.firstChild);
	}
	
	// Loop through options
	for(var i = 0; i < options.length; i++) {
		//Get info
	    var opt = options[i];
		var labelText = nameText.concat("_", String(i));
		
		// Create elements
	    var li = document.createElement("li");
		var input = document.createElement("input");
		var label = document.createElement("label");
		
		// Add information
		input.type = "radio";
		input.id = labelText; 
		input.name = nameText;
		if (opt == "None") {
			input.value = "";
			input.checked = true;
		} else {
			input.value = opt;
			}
		label.htmlFor = labelText;
		$(label).append(opt);
		
		// Append nested objects
		li.appendChild(input);
		li.appendChild(label);
	    select.appendChild(li);	
	}
}


/*-------------------------------------
Get Final Output
-------------------------------------*/
function getFinalOutput() {
	$("#finalOutput").empty();
	
	// Get CSV data from window
	var CSVData = document.getElementById('CSVinput').value;
	
	// Get parameters
	var csvSep = document.getElementById('csvSep').value;
	var indexCol = getRadioVal('indexCol');
	var baseStructure = getRadioVal('baseStr');
	var groupBy = getRadioVal('groupBy');
	var rootNode = document.getElementById('root-node').value;
	var ChildField = document.getElementById('nest-key').value;
	var sumField = getRadioVal('sumField');
	var sumFieldName = document.getElementById('sumFieldName').value;
	var avgField = getRadioVal('avgField');
	var avgFieldName = document.getElementById('avgFieldName').value;
	var preview = false;
	var file_or_input = "input";
	
	var allFields = [csvSep, indexCol, baseStructure, groupBy, rootNode, ChildField, sumField, sumFieldName, avgField, avgFieldName, preview, file_or_input];
	
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
	url = url + "output?" + urlParams
	console.log(url)
	
	// Post data to API
	CSVDataJson = {data: CSVData}; 
	
	$.ajax({
	  	type: "POST",
	  	url: url,
	  	data: CSVDataJson,
		dataType: "text",
		success: function(result) {
			// Parse json string
			var json = JSON.parse(result);
			$("#finalOutput").append(JSON.stringify(json, null, 2));
        }
	});
};