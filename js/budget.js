// import google chart library
google.load("visualization", "1", {packages:["table"]});

// global variable
var gBudgetTable;
var gTableData;
var gTableView;

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
	
	// load budget table
	reloadBudgetTable();

}

/*
* load budget table again from the current server data
* if out of sync (ever), discard client data 
*/
function reloadBudgetTable() {
	// new 
	gTableData = new google.visualization.DataTable();
	
	// initialize budget table with current server data
	setBudgetTableHeader();
	getBudgetEntries();
}
	
function setBudgetTableHeader() {
	// add columns to budget table
	gTableData.addColumn('number', 'Entry ID');
	gTableData.addColumn('string', 'Entry Name');
	gTableData.addColumn('string','Detail Description');
	gTableData.addColumn('string','Last Modified Date');
	gTableData.addColumn('number','Planned Amount($)');
	gTableData.addColumn('number','Actual Amount($)');
	gTableData.addColumn('boolean','Paid In Full');
}	
	
/*
* Save budget entry to server
*/
function addEntry() {
	// user id
	var uid = 0;
	
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
		"aid": uid,
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
					[json_result['status'], 	//inserted entry_id is represented as status
					eName, eDesc, 
					json_result['modified_date'], 
					{v: ePlanAmount, f: '$' + ePlanAmount}, 
					{v: eActuAmount, f: '$' + eActuAmount}, 
					ePaid]
				]);
			}
			
			// redraw table
			drawViewable();
		}
	});
}

/*
* delete budget entry in server database
*/
function removeEntry() {
	
}

/*
* edit a single entry of budget and commit to server
*/
function modifyEntry() {
	// user id
	var uid = 0;
	
	// get fields info 
	var eID = document.getElementById('eID').value;
	var eName = document.getElementById('eName').value;
	var eDesc = document.getElementById('eDescrip').value;
	var ePlanAmount = parseFloat(document.getElementById('ePlanAmount').value);
	var eActuAmount = parseFloat(document.getElementById('eActuAmount').value);
	var ePaid = document.getElementById('ePaid').checked;
	
	// for table
	var json_result;
	
	// *********PLACEHOLDER*********
	eID = 27;
	
	// for ajax
	var reqUrl = "http://192.168.0.50/WeddingTracker/Server/BudgetAjaxInterface.php";
	var entryData = {
		"aid": uid,
		"entryid": eID,
		"entryName": eName,
		"entryDesc": eDesc,
		"entryPlanAmount": ePlanAmount,
		"entryActualAmount": eActuAmount,
		"entryIsPaid": ePaid
	};
	
	// for updating table
	var targetRow;
	
	
	$.ajax({
		url: reqUrl,
		type: "POST",
		data: {editBudgetEntryAjax:true, details:entryData},
		datatype: "json",
		success: function (result) {
			//console.log(result);
			json_result = jQuery.parseJSON(result);
			if (json_result['status'] == 1) {
				// status 1 means ok, 0 means not changed, and -1 or -2 means error
				// find the row number
				//targetRow = gTableData.getFilteredRows([{column: 0, value: eID}])[0];	// should be only 1 row
				
				/*
				gTableData.setRowProperties(targetRow, [
					[eID, eName, eDesc, 
					json_result['modified_date'], 
					{v: ePlanAmount, f: '$' + ePlanAmount}, 
					{v: eActuAmount, f: '$' + eActuAmount}, 
					ePaid]
				]);
				*/
				/*gTableData.setRowProperty(targetRow, 'Entry Name', eName);
				gTableData.setRowProperty(targetRow, 'Detail Description', eDesc);
				gTableData.setRowProperty(targetRow, 'Last Modified Date', json_result['modified_date']);
				gTableData.setRowProperty(targetRow, 'Planned Amount($)', {v: ePlanAmount, f: '$' + ePlanAmount});
				gTableData.setRowProperty(targetRow, 'Actual Amount($)', {v: eActuAmount, f: '$' + eActuAmount});
				gTableData.setRowProperty(targetRow, 'Paid In Full', ePaid);*/
			}
			
			// redraw table
			reloadBudgetTable();
		}
	});
}

/*
* view budget entries from server 
*/
function viewEntry() {
	
}

/*
* ajax calls to retrieve server data
* TODO: add account feature 
*/
function getBudgetEntries() {
	
	// user id
	var uid = 0;		// TODO: placeholder, as account feature not available
	
	// for ajax
	var reqUrl = "http://192.168.0.50/WeddingTracker/Server/BudgetAjaxInterface.php";
	var userData = {
		"aid": uid
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
					entry_detail['entry_id'] = parseInt(entry_detail['entry_id']);
					entry_detail['planned_amount'] = parseInt(entry_detail['planned_amount']);
					entry_detail['actual_amount'] = parseInt(entry_detail['actual_amount']);
					// need to parse bool from string "0" and "1"
					entry_detail['is_Paid'] = entry_detail['is_Paid'] == "0" ? false : true;
					
					// update table data
					gTableData.addRows([
						[entry_detail['entry_id'], 
						entry_detail['name'], 
						entry_detail['description'], 
						entry_detail['modified_date'], 
						{v: entry_detail['planned_amount'], f: '$' + entry_detail['planned_amount']}, 
						{v: entry_detail['actual_amount'], f: '$' + entry_detail['actual_amount']}, 
						entry_detail['is_Paid']]
					]);
				});
				
			}
			// re-draw budget table
			drawViewable();
		}
	});
}

function drawViewable(){
	gTableView = new google.visualization.DataView(gTableData);
	gTableView.setColumns([1,2,3,4,5,6]); //here you set the columns you want to display
	
	gBudgetTable.draw(gTableView, {showRowNumber: true});
}

function formatBudgetEntriesForView() {
	
}

function calculateTotalExpenditure() {

}

// TODO - Add available budget 	
