$(document).ready(function(){

	// Populate the input fields
	const examples = $("#examples").children();
	for (let i = 1; i <= examples.length; i++) {
		$("#example-input-" + String(i)).text(inputData);
	}

	// Example 1
	addOutputData(1, inputData, {"base_structure": "records"});
	addOutputData(2, inputData, {"base_structure": "list"});
	addOutputData(3, inputData, {"base_structure": "dict", "index_col": "ID"});
	addOutputData(4, inputData, {"base_structure": "records", "col_names": "country,profession"});
	addOutputData(5, inputData, {
		"base_structure": "records",
		"col_names": "country,profession",
		"name_key": "groupedBy",
		"child_key": "records",
		"sum_field": "ID",
		"avg_field": "ID"
	});
})


async function addOutputData(i, inputData, params) {
	let url = generateURL(params);
	const exampleOutput = await getJSONData(inputData, url);
	$("#example-output-" + String(i)).text(exampleOutput);
}


function generateURL(additionalParams) {
	const params = {
		"csv_sep": ",",
		"header_sel": true,
		"wrapper": false,
		"file_or_input": "input",
		...additionalParams
	};

	let urlParams = "/output?";
	for (p in params) {
		urlParams += p + "=" + params[p] + "&";
	}
	urlParams = urlParams.substring(0, urlParams.length - 1);

	let url = window.location.origin;
	url += urlParams;

	return url
}


function getJSONData(data, url) {
	const dataJson = {data: data};
	return new Promise((resolve, reject) => {
		$.ajax({
		  	type: "POST",
		  	url: url,
		  	data: dataJson,
			dataType: "text",
			success: (response) => {
				const json = JSON.parse(response);
                resolve(JSON.stringify(json, null, 2));
            },
            error: (response) => {
                reject(response);
            }
		})
	})
};
