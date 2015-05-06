<?php
require_once 'BudgetConnection.php';
$BudgetCon = new BudgetConnection;

// Ajax Message Incoming

/*
*	To receive calls regarding updating table
*/
if($_POST['getAllBudgetEntryAjax'] && $_POST['details'] != NULL) {
	echo json_encode($BudgetCon -> getAllBudgetEntry(
										$_POST['details']['aid']));
}

/*
*	To receive calls regarding creation of new budget entry
*/
if($_POST['addBudgetEntryAjax'] && $_POST['details'] != NULL) {
	echo json_encode($BudgetCon -> addBudgetEntry(
									$_POST['details']['aid'],
									$_POST['details']['entryName'],
									$_POST['details']['entryDesc'],
									$_POST['details']['entryPlanAmount'],
									$_POST['details']['entryActualAmount'],
									$_POST['details']['entryIsPaid']));
}

/*
*	To receive calls regarding modification of existing budget entry 
*/
if($_POST['editBudgetEntryAjax'] && $_POST['details'] != NULL) {
	echo json_encode($BudgetCon -> editBudgetEntry(
									$_POST['details']['aid'],
									$_POST['details']['entryid'],
									$_POST['details']['entryName'],
									$_POST['details']['entryDesc'],
									$_POST['details']['entryPlanAmount'],
									$_POST['details']['entryActualAmount'],
									$_POST['details']['entryIsPaid']));
}

/*
*	To receive calls regarding removal of existing budget entry 
*/
if($_POST['deleteBudgetEntryAjax'] && $_POST['details'] != NULL) {
	echo json_encode($BudgetCon -> delBudgetEntry(
										$_POST['details']['entryid']));
}
?>