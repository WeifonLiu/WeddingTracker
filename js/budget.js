// import google chart library
google.load("visualization", "1", {packages:["table"]});

// global variable
var gBudgetTable;
var gTableData;

// onLoad initialization
google.setOnLoadCallback(initBudgetTable);


function init() {
	$( "#eDatepicker" ).datepicker();
}
/*
* setup table view
*/
function initBudgetTable() {
	// new 
	gBudgetTable = new google.visualization.Table(document.getElementById('BudgetTable_div'));
	gTableData = new google.visualization.DataTable();
	
	// add columns to budget table
	gTableData.addColumn('string', 'Entry Name');
	gTableData.addColumn('string','Detail Description');
	gTableData.addColumn('string','Last Modified Date');
	gTableData.addColumn('number','Planned Amount($)');
	gTableData.addColumn('number','Actual Amount($)');
	gTableData.addColumn('boolean','Paid In Full');
}
	
/*
* Save budget entry to user local storage 
*/
function addEntry() {
	// get fields info 
	var eName = document.getElementById('eName').value;
	var eDesc = document.getElementById('eDescrip').value;
	var ePlanAmount = parseFloat(document.getElementById('ePlanAmount').value);
	var eActuAmount = parseFloat(document.getElementById('eActuAmount').value);
	var ePaid = document.getElementById('ePaid').checked;
	
	// for table
	var json_result;
	
	// for ajax
	var reqUrl = "http://192.168.0.50/WeddingTracker/Server/BudgetAjaxInterface.php";
	var entryData = {
		"entryName": eName,
		"entryDesc": eDesc,
		"entryPlanAmount": ePlanAmount,
		"entryActualAmount": eActuAmount,
		"entryIsPaid": ePaid
	};
	
	$.ajax({
		url: reqUrl,
		type: "POST",
		data: {addBudgetEntryAjax:true, details:entryData},
		datatype: "json",
		success: function (result) {
			//console.log(result);
			json_result = jQuery.parseJSON(result);
			if (json_result['status'] > 0) {
				gTableData.addRows([
					[eName, eDesc, 
					json_result['modified_date'], 
					{v: ePlanAmount, f: '$' + ePlanAmount}, 
					{v: eActuAmount, f: '$' + eActuAmount}, 
					ePaid]
				]);
			}
			
			// redraw table
			gBudgetTable.draw(gTableData, {showRowNumber: true});
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
	
	$(document).ready(function () {
		getBudgetEntries();
	});
}

function getBudgetEntries() {
	
	// from webpage
	var email = "test@test.user";		// TODO: placeholder, as account feature not available
	
	// for ajax
	var reqUrl = "http://192.168.0.50/WeddingTracker/Server/BudgetAjaxInterface.php";
	var userData = {
		"email": email
	};
	
	$.ajax({
		url: reqUrl,
		type: "POST",
		data: {getAllBudgetEntryAjax:true, details:userData},
		datatype: "json",
		success: function (result) {
			//console.log(result);
			json_result = jQuery.parseJSON(result);
			if (json_result != []) {
				$.each(json_result, function(entry_key, entry_detail) {
					// Attention: need to parseInt(amounts) because json parse amounts to string
					entry_detail['planned_amount'] = parseInt(entry_detail['planned_amount']);
					// need to parse bool from string "0" and "1"
					entry_detail['is_Paid'] = entry_detail['is_Paid'] == "0" ? false : true;
					
					// update table data
					gTableData.addRows([
						[entry_detail['name'], 
						entry_detail['description'], 
						entry_detail['modified_date'], 
						{v: entry_detail['planned_amount'], f: '$' + entry_detail['planned_amount']}, 
						{v: entry_detail['planned_amount'], f: '$' + entry_detail['actual_amount']}, 
						entry_detail['is_Paid']]
					]);
				});
				
			}
			
			// redraw table
			gBudgetTable.draw(gTableData, {showRowNumber: true});
		}
	});
	
	
	/*
	gTableData.addRows([
		['Decor', 'Decoration vender deal', '2015-03-03', 
		{v: 1500, f: '$1500'}, {v: 2000, f: '$2000'}, false]
	]);
	*/
}



function formatBudgetEntriesForView() {
	
}

function calculateTotalExpenditure() {

}

// TODO - Add available budget 	
