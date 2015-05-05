<?php
require_once 'BudgetConnection.php';
$BudgetCon = new BudgetConnection;

// Ajax Message Incoming

if($_POST['getAllBudgetEntryAjax'] && $_POST['details'] != NULL) {
	echo json_encode($BudgetCon -> getAllBudgetEntry(
										$_POST['details']['aid']));
}


if($_POST['addBudgetEntryAjax'] && $_POST['details'] != NULL) {
	echo json_encode($BudgetCon -> addBudgetEntry(
									$_POST['details']['aid'],
									$_POST['details']['entryName'],
									$_POST['details']['entryDesc'],
									$_POST['details']['entryPlanAmount'],
									$_POST['details']['entryActualAmount'],
									$_POST['details']['entryIsPaid']));
}

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

if($_POST['deleteBudgetEntryAjax'] && $_POST['details'] != NULL) {
	echo json_encode($BudgetCon -> delBudgetEntry(
										$_POST['details']['entryid']));
}
?>