// import google chart library
google.load("visualization", "1", {packages:["table"]});

// Global variables
// Overview Variable
var gLastModDate;
var gTotalEst;
var gTotalPending;
var gTotalPaid;

// Detail table variable 
var gBudgetTable;
var gTableData;
var gTableView;

// budget editor dialog variable
var gBudgetEditorForm; 
var gBudgetEditorDialog; 	// dialog (popup) contains the form(fields)
		

// onLoad initialization
google.setOnLoadCallback(initBudgetTable);



/*
* setup table view
*/
function initBudgetTable() {
	initSummary();

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

/*
*	Initialize Budget Table Headers 
*/
function setBudgetTableHeader() {
	// add columns to budget table
	gTableData.addColumn('number', 	'Entry ID', 			'entry_id');
	gTableData.addColumn('string', 	'Entry Name', 			'name');
	gTableData.addColumn('string',	'Detail Description', 	'descrip');
	gTableData.addColumn('string',	'Last Modified Date', 	'date');
	gTableData.addColumn('number',	'Estimated Cost($)', 	'plan_amount');
	gTableData.addColumn('number',	'Actual Cost($)', 		'actu_amount');
	gTableData.addColumn('boolean',	'Paid In Full', 		'is_paid');
}	

/*
* 	Draw table with some of the columns for users
*/
function drawViewable(){
	// display (1)name, (2)desc, (3)mod_date, (4)planned amount, (5)actual amount, and (6)paid
	gTableView.setColumns([1,2,3,4,5,6]); //here you set the columns you want to display
	
	// draw
	gBudgetTable.draw(gTableView, {showRowNumber: true});
	
	// add event listener to the drawn table 
	google.visualization.events.addListener(gBudgetTable, 'select', selectionHandler);
}

/*
*	Budget Table Selection Handler
* 	popup editor dialog when an item is selected for edit 
*/
function selectionHandler() {
	var FIRST_SELECTION = 0;// always get the first of all selections for edit
	var selections;			// an array of selected rows or cells 
	var selected;			// the current item in the array
	var curHeader, curVal;	// the current header ID and value of the selected cell
	
	gBudgetEditorDialog.dialog( "open" );
	
	selections = gBudgetTable.getSelection();	
	
	if (selections.length == 0) {
		// when a de-selection is triggered
		gBudgetEditorDialog.dialog( "close" );
	} else {
		// when something is selected 
		selected = selections[FIRST_SELECTION];
		if (selected.row != null) {
			for(var iterCol=0; iterCol < gTableData.getNumberOfColumns(); iterCol++) {
				// get the header id and cell value of given row and column 
				curHeader = gTableData.getColumnId(iterCol);
				curVal = gTableData.getValue(selected.row, iterCol);
				
				// update the editor fields 
				if (curHeader == "is_paid") {
					$( "#" + curHeader)[0].checked = curVal;
				} else if (curHeader != "date") {
					// skip "Date" value, as it is not editable for user
					$( "#" + curHeader)[0].value = curVal;
				}
			}
			//showBudgetEntryEditor("edit");
			
		}
	}
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
	
	// initialize summary data (clear old data)
	initSummary();
	
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
					entry_detail['entry_id'] = parseFloat(entry_detail['entry_id']);
					entry_detail['planned_amount'] = parseFloat(entry_detail['planned_amount']);
					entry_detail['actual_amount'] = parseFloat(entry_detail['actual_amount']);
					// need to parse bool from string "0" and "1"
					entry_detail['is_Paid'] = entry_detail['is_Paid'] == "0" ? false : true;
					
					// update table data
					gTableData.addRows([
						[entry_detail['entry_id'], 
						entry_detail['name'], 
						entry_detail['description'], 
						{v: entry_detail['modified_date_value'], f: entry_detail['modified_date']},
						//entry_detail['modified_date'], 
						{v: entry_detail['planned_amount'], f: '$' + entry_detail['planned_amount']}, 
						{v: entry_detail['actual_amount'], f: '$' + entry_detail['actual_amount']}, 
						entry_detail['is_Paid']]
					]);
					
					// update summary
					if (entry_detail['is_Paid']) {
						// Paid, so actual amount goest to "total paid"
						updateSummary(entry_detail['modified_date_value'], entry_detail['planned_amount'],
									0, entry_detail['actual_amount']);
					} else {
						// Not Paid, so actual goest to "pending"
						updateSummary(entry_detail['modified_date_value'], entry_detail['planned_amount'],
									entry_detail['actual_amount'], 0);
					}
				});
			}
			
			// Show summary to the overview section 
			showSummary();
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

/*
* Save budget entry to server
*/
function addEntry() {
	// user id
	var uid = 0;
	
	// get fields input from editor dialog 
	var eName = $( "#name" )[0].value;
	var eDesc = $( "#descrip" )[0].value;
	var ePlanAmount = parseFloat($( "#plan_amount" )[0].value);
	var eActuAmount = parseFloat($( "#actu_amount" )[0].value);
	var ePaid = $( "#is_paid" )[0].checked;
	
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
					{v: json_result['modified_date_value'], f: json_result['modified_date']},
					{v: ePlanAmount, f: '$' + ePlanAmount}, 
					{v: eActuAmount, f: '$' + eActuAmount}, 
					ePaid]
				]);
				
				// update summary
				if (ePaid) {
					// Paid, so actual amount goest to "total paid"
					updateSummary(json_result['modified_date_value'], ePlanAmount,
								0, eActuAmount);
				} else {
					// Not Paid, so actual goest to "pending"
					updateSummary(json_result['modified_date_value'], ePlanAmount,
								eActuAmount, 0);
				}
			}
			
			// Show summary to the overview section 
			showSummary();
			// redraw table
			drawViewable();
			
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
	// get fields input from editor dialog 
	var eID = $( "#entry_id" )[0].value;
	
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
	
	// get fields input from editor dialog 
	var eID = $( "#entry_id" )[0].value;
	var eName = $( "#name" )[0].value;
	var eDesc = $( "#descrip" )[0].value;
	var ePlanAmount = parseFloat($( "#plan_amount" )[0].value);
	var eActuAmount = parseFloat($( "#actu_amount" )[0].value);
	var ePaid = $( "#is_paid" )[0].checked;
	
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
			}
			
			// redraw table
			loadBudgetTable();
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) { 
        	console.log("Status: " + textStatus); 
        	console.log("Error: " + errorThrown); 
    	}  
	});
}


/*
* For the following dialog code, 
* it is derived from the sample code provided in jQuery-ui tutorial
* https://jqueryui.com/dialog/#modal-form
*/
// when document ready 
$(function() {
	// budget editor variable 
	var id = $( "#entry_id" ),
		name = $( "#name" ),
		description = $( "#descrip" ),
		plan_amount = $( "#plan_amount" ),
		actu_amount = $( "#actu_amount" ),
		is_paid = $( "#is_paid" ),
		allFields = $( [] ).add( id ).add( name ).add( description ).
							add( plan_amount ).add( actu_amount ).add( is_paid ),
		tips = $( ".validateTips" );	
	
	// showing tool tips (copy from jquery-ui tutorial)
	function updateTips( t ) {
		tips
			.text( t )
			.addClass( "ui-state-highlight" );
		setTimeout(function() {
			tips.removeClass( "ui-state-highlight", 1500 );
		}, 500 );
    }
 
	// checking restricted length requirement (copy from jquery-ui tutorial)
    function checkLength( o, n, min, max ) {
		if ( o.val().length > max || o.val().length < min ) {
			o.addClass( "ui-state-error" );
			updateTips( "Length of " + n + " must be between " +
				min + " and " + max + "." );
			return false;
		} else {
			return true;
		}
    }

	// checking acceptable characters (copy from jquery-ui tutorial)
    function checkRegexp( o, regexp, n ) {
		if ( !( regexp.test( o.val() ) ) ) {
			o.addClass( "ui-state-error" );
			updateTips( n );
			return false;
		} else {
			return true;
		}
    }
	
	// modified and derived from jquery-ui tutorial
	function checkValidation() {
		var valid = true;
		allFields.removeClass( "ui-state-error" );
		
		valid = valid && checkLength( name, "Entry Name", 3, 40 );
		
		valid = valid && checkRegexp( plan_amount, /^\s*-?[1-9]\d*(\.\d{1,2})?\s*$/, 
			"Cost must be numbers up to 2 decimals and must begin with a number. eg. 123.45" );
		valid = valid && checkRegexp( actu_amount, /^\s*-?[1-9]\d*(\.\d{1,2})?\s*$/, 
			"Cost must be numbers up to 2 decimals and must begin with a number. eg. 123.45" );
 
		return valid;
	}
	
	
	// popup budget entry editor 
    gBudgetEditorDialog = $( "#budget_editor_dialog_form" ).dialog({
		autoOpen: false,
		height: 450,
		width: 550,
		modal: true,
		buttons: {
        //"Create an account": addUser,
			Add: function() {
				if (checkValidation()) {
					addEntry();	
					gBudgetEditorDialog.dialog( "close" );
				}
				
			},
			Save: function() {
				if (checkValidation()) {
					modifyEntry();
					gBudgetEditorDialog.dialog( "close" );
				}
			},
			Delete: function() {
				if (confirm("WARNING: this action cannot be undone!") == true) {
					removeEntry();
				}				
				gBudgetEditorDialog.dialog( "close" );
			},
			Cancel: function() {
				gBudgetEditorDialog.dialog( "close" );
			}
		},
		open: function() {
				
		},
        close: function() {
        gBudgetEditorForm[ 0 ].reset();
        allFields.removeClass( "ui-state-error" );
        }
    });
 
    gBudgetEditorForm = $( "#budget_editor_form" ).on( "submit", function( event ) {
		event.preventDefault();
    });
 
    $( "#add_new_entry_dialog" ).button().on( "click", function() {
		gBudgetEditorDialog.dialog( "open" );
    });

});


/*
*	Populate the Summary Data to the page 
*/
function showSummary() {
	$("#lab_last_update")[0].textContent     = gLastModDate;
	$("#lab_total_estimated")[0].textContent = "$ " + gTotalEst;
	$("#lab_pending_payment")[0].textContent = "$ " + gTotalPending;
	$("#lab_actu_payment")[0].textContent    = "$ " + gTotalPaid;
}

/*
*	Initialize the default value of the summary 
*/
function initSummary() {
	// set default value
	gLastModDate = "";
	gTotalEst = 0;
	gTotalPending = 0;
	gTotalPaid = 0;
}

/*
*	Update the values of the summary in the overview section 
*/
function updateSummary(date, est, pending, paid) {
	gLastModDate = (gLastModDate > date) ? gLastModDate : date;	//keep the later (greater) date
	gTotalEst += est;
	gTotalPending += pending;
	gTotalPaid += paid;
}

