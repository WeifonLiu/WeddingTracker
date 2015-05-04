<?php
require_once 'BudgetConnection.php';
$BudgetCon = new BudgetConnection;

// Ajax Message Incoming

if($_POST['getAllBudgetEntryAjax'] && $_POST['details'] != NULL) {
	echo json_encode($BudgetCon -> getAllBudgetEntry(
										$_POST['details']['email']));
	
}


if($_POST['addBudgetEntryAjax'] && $_POST['details'] != NULL) {
	echo json_encode($BudgetCon -> addBudgetEntry(
									$_POST['details']['entryName'],
									$_POST['details']['entryDesc'],
									$_POST['details']['entryPlanAmount'],
									$_POST['details']['entryActualAmount'],
									$_POST['details']['entryIsPaid']));
}


?>