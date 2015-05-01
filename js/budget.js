
/*
// load jquery 
var script = document.createElement('script');
script.src = 'http://code.jquery.com/jquery-1.11.0.min.js';
script.type = 'text/javascript';
document.getElementsByTagName('head')[0].appendChild(script);

// load google chart library
$.getScript( "https://www.google.com/jsapi", function( data, textStatus, jqxhr ) {
  console.log( data ); // Data returned
  console.log( textStatus ); // Success
  console.log( jqxhr.status ); // 200
  console.log( "Load was performed." );
});
*/
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
	tableData.addColumn('string','Date');
	tableData.addColumn('number','Planned Amount($)');
	tableData.addColumn('number','Actual Amount($)');
	tableData.addColumn('boolean','Paid In Full');
	
	return tableData;
}
	
/*
* Save budget entry to user local storage 
*/
function addEntry() {
	
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
