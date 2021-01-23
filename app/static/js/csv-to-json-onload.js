// Universal Values
const buttonsForRefresh = ["indexCol", "sumField", "avgField", "nestCol"];

/*-------------------------------------
On page ready
-------------------------------------*/
$(document).ready(function(){
	$('#process-data').click(function(){
        resetFields();
		convertCSV("preview", false, true);
		$('html, body').animate({scrollTop: $("#outputOptions").offset().top}, 1000);
	});

	$('#reprocessData').click(function() {
		convertCSV("preview", false, true);
	})

	$('#updatePreview').click(function() {
		convertCSV("preview", true, false);
	})

	$('#convertData').click(function() {
		convertCSV("finalOutput", true, false);
	})

	// Adjustable List for Nesting
	let byId = function (id) { return document.getElementById(id); }
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
});
