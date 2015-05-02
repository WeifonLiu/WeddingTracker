// load google chart library
google.load("visualization", "1", {packages:["table"]});
function init() {
	$( "#eDatepicker" ).datepicker();
}
/*
* setup table view
*/
function initBudgetTable() {
	var tableData = new google.visualization.DataTable();
	var entries;
	
	tableData.addColumn('string', 'Entry Name');
	tableData.addColumn('string','Detail Description');
	tableData.addColumn('string','Last Modified Date');
	tableData.addColumn('number','Planned Amount($)');
	tableData.addColumn('number','Actual Amount($)');
	tableData.addColumn('boolean','Paid In Full');
	
	return tableData;
}
	
/*
* Save budget entry to user local storage 
*/
function addEntry() {
	var eName = document.getElementById('eName').value;
	var eDesc = document.getElementById('eDescrip').value;
	var eDate = document.getElementById('eDatepicker').value;
	var ePlanAmount = parseFloat(document.getElementById('ePlanAmount').value);
	var eActuAmount = parseFloat(document.getElementById('eActuAmount').value);
	var ePaid = document.getElementById('ePaid').checked;
	
	
	var entryData = {
		"entryName": eName,
		"entryDesc": eDesc,
		"entryDate": eDate,
		"entryPlanAmount": ePlanAmount,
		"entryActualAmount": eActuAmount,
		"entryIsPaid": ePaid
	};
	var reqUrl = "http://192.168.0.50/WeddingTracker/Server/BudgetConnection.php";
	$.ajax({
		url: reqUrl,
		type: "POST",
		data: {addBudgetEntryAjax:true, details:entryData},
		datatype: "json",
		success: function (result) {
			console.log(JSON.parse(result));
		}
	});

/*	
	$.post(url, 
		entryData, 
		function(result, status){
			console.log("R: " + result + "\nS: " + status);
		}
	);
*/
}

/*
* delete budget entry from user local storage 
*/
function removeEntry() {
	
}

/*
* edit a single entry of budget on the user local storage  
*/
function modifyEntry() {
	
}

/*
* view budget entries from local or server (login required for server access)
*/
function viewEntry() {
	var tableData;
	var budgetTable;

	
	$(document).ready(function () {
		budgetTable = new google.visualization.Table(document.getElementById('BudgetTable_div'));
		tableData = initBudgetTable();
		getBudgetEntries(tableData);
		budgetTable.draw(tableData, {showRowNumber: true});
	});
}

function getBudgetEntries(tableData) {
	tableData.addRows([
		['Decor', 'Decoration vender deal', '2015-03-03', 
		{v: 1500, f: '$1500'}, {v: 2000, f: '$2000'}, false]
	]);
}



function formatBudgetEntriesForView() {
	
}

function calculateTotalExpenditure() {

}

// TODO - Add available budget 	
