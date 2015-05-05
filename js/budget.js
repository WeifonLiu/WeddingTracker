// import google chart library
google.load("visualization", "1", {packages:["table"]});

// global variable
var gBudgetTable;
var gTableData;
var gTableView;

// onLoad initialization
google.setOnLoadCallback(initBudgetTable);


function init() {
	$( "#eDate" ).datepicker();
}
/*
* setup table view
*/
function initBudgetTable() {
	// new 
	gBudgetTable = new google.visualization.Table(document.getElementById('BudgetTable_div'));
	
	// load budget table
	loadBudgetTable();

}

/*
* load budget table from the current server data
* if out of sync (ever), discard client data 
*/
function loadBudgetTable() {
	// new 
	gTableData = new google.visualization.DataTable();
	gTableView = new google.visualization.DataView(gTableData);
	
	// initialize budget table with current server data
	setBudgetTableHeader();
	getBudgetEntries();
	
}
	
function setBudgetTableHeader() {
	// add columns to budget table
	gTableData.addColumn('number', 	'Entry ID', 			'ID');
	gTableData.addColumn('string', 	'Entry Name', 			'Name');
	gTableData.addColumn('string',	'Detail Description', 	'Descrip');
	gTableData.addColumn('string',	'Last Modified Date', 	'Date');
	gTableData.addColumn('number',	'Planned Amount($)', 	'PlanAmount');
	gTableData.addColumn('number',	'Actual Amount($)', 	'ActuAmount');
	gTableData.addColumn('boolean',	'Paid In Full', 		'Paid');
}	

function drawViewable(){
	// display (1)name, (2)desc, (3)mod_date, (4)planned amount, (5)actual amount, and (6)paid
	gTableView.setColumns([1,2,3,4,5,6]); //here you set the columns you want to display
	
	// draw
	gBudgetTable.draw(gTableView, {showRowNumber: true});
	
	// add event listener to the drawn table 
	google.visualization.events.addListener(gBudgetTable, 'select', selectionHandler);
}

function selectionHandler() {
	var FIRST_SELECTION = 0;// always get the first of all selections for edit
	var selections;			// an array of selected rows or cells 
	var selected;			// the current item in the array
	var curHeader, curVal;	// the current header ID and value of the selected cell
	
	selections = gBudgetTable.getSelection();	
	
	if (selections.length == 0) {
		// when a de-selection is triggered
		hideBudgetEntryEditor();
	} else {
		// when something is selected 
		selected = selections[FIRST_SELECTION];
		if (selected.row != null) {
			for(var iterCol=0; iterCol < gTableData.getNumberOfColumns(); iterCol++) {
				// get the header id and cell value of given row and column 
				curHeader = gTableData.getColumnId(iterCol);
				curVal = gTableData.getValue(selected.row, iterCol);
				
				// update the editor fields 
				if (curHeader == "Paid") {
					document.getElementById("e"+ curHeader).checked = curVal;
				} else if (curHeader != "Date") {
					// skip "Date" value, as it is not editable for user
					document.getElementById("e"+ curHeader).value = curVal;
				}
			}
			showBudgetEntryEditor("edit");
		}
	}
}
	
function showBudgetEntryEditor(type) {
	if(type == "addition") {
		// clear for add
		clearBudgetEntryEditor();
		
		// adjust editor for "addition mode"
		document.getElementById("editorHeader2").textContent    = "Add new Entry";
		document.getElementById("but_add_entry").style.display  = "";
		document.getElementById("but_edit_entry").style.display = "none";
		document.getElementById("but_del_entry").style.display  = "none";
		
	} else if (type == "edit") {
		// adjust editor for "edit mode"
		document.getElementById("editorHeader2").textContent = "Edit Entry";
		document.getElementById("but_add_entry").style.display  = "none";
		document.getElementById("but_edit_entry").style.display = "";
		document.getElementById("but_del_entry").style.display  = "";
	}
	
	// show editor after ready
	document.getElementById("budget_entry_editor").style.display = "";
}	
	
function hideBudgetEntryEditor() {
	// hide editor 
	clearBudgetEntryEditor();
	document.getElementById("budget_entry_editor").style.display = "none";
}	

function clearBudgetEntryEditor() {
	// fill editor fields with default value
	document.getElementById('eName').value 		 = "";
	document.getElementById('eDescrip').value	 = "";
	document.getElementById('ePlanAmount').value = 0.00;
	document.getElementById('eActuAmount').value = 0.00;
	document.getElementById('ePaid').checked = false;
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
			hideBudgetEntryEditor();
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) { 
        	console.log("Status: " + textStatus); 
        	console.log("Error: " + errorThrown); 
    	}  
	});
}

/*
* delete budget entry in server database
*/
function removeEntry() {
	// 
	var eID = document.getElementById('eID').value;
	
	// for ajax
	var reqUrl = "http://192.168.0.50/WeddingTracker/Server/BudgetAjaxInterface.php";
	var entryData = {
		"entryid": eID,
	};
	
	// for table
	var json_result;
	
	$.ajax({
		url: reqUrl,
		type: "POST",
		data: {deleteBudgetEntryAjax:true, details:entryData},
		datatype: "json",
		success: function (result) {
			//console.log(result);
			json_result = jQuery.parseJSON(result);
			
			// show result message 
			alert(json_result['message']);
			
			
			// redraw table
			loadBudgetTable();
			hideBudgetEntryEditor();
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) { 
        	console.log("Status: " + textStatus); 
        	console.log("Error: " + errorThrown); 
    	}  
	});
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
				alert(json_result['message']);
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
			loadBudgetTable();
			hideBudgetEntryEditor();
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) { 
        	console.log("Status: " + textStatus); 
        	console.log("Error: " + errorThrown); 
    	}  
	});
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
			// this function is placed here because ajax is async
			drawViewable();
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) { 
        	console.log("Status: " + textStatus); 
        	console.log("Error: " + errorThrown); 
    	}  
	});
}



function formatBudgetEntriesForView() {
	
}

function calculateTotalExpenditure() {

}

// TODO - Add available budget 	
