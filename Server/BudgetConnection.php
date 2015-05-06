<?php
require_once 'DBConnection.php';

class BudgetConnection
{
	private $ConnHelper;
	private $db;	//database connection
	
	public function __construct() {
		$ConnHelper = new DBConnection;
		$this->db = $ConnHelper -> getDB();
	}

	/*
	*	Get all budget entries of a given account email
	*	@param $userid
	*/
	function getAllBudgetEntry($userid) {
		//query variables
		$db = $this->db;	// set $db in this function as refering to class private $db;
		$sql = "";			// SQL query 
		$qRes = null;		// query result
		
		// return variable 
		$retList = Array(); 		// return with a list of entries

		// check DB connectivity
		if($db == null) { 
			// if no database connection, connect to it;
			$db = ConnectDB();	
		}
		
		$sql = "SELECT bid, name, description, modified_date, ".
						"planned_amount, actual_amount, " . 
						"is_Paid" ." ".
				"FROM budget" ." ".
				"WHERE userid=". $userid .""; 
		$qRes = mysqli_query($db,$sql);
		
		while($entry = mysqli_fetch_assoc($qRes)) {
			// send item id (with another field name, to hide DB name)
			$entry['entry_id'] = $entry['bid'];
			unset($entry['bid']);
			// format sql date for view
			$entry['modified_date_value'] = $entry['modified_date'];
			$entry['modified_date'] = date("Y-M-d", strtotime($entry['modified_date']));
			// prepare a list to return
			$retList[] = $entry;
		}

		if ($retList != Array() OR isset($retList)) {
			return $retList;
		} else {
			return Array();
		}
	}
	
	function addBudgetEntry($aid, $name, $desc, $plan_amount, 
							$actual_amount, $is_paid) {
		// other input variable for this function 												
		$date = date("Ymd");	// record current system time 
		
		//query variables
		$db = $this->db;		// set $db in this function as refering to class private $db;
		$sql_verify = "";		// SQL query for verifing pre-existance of entry
		$sql_insert = "";		// SQL query to insert new entry 
		$qRet_verify = null;	// query result (for verification)
		$qRet_insert = null;	// query result (after insert)
		$isExist = null;		// fetched result of returned query call (verification)

		// return variables 
		$retMsg = ""; 			// return message
		$retStatus = 0;			// return status (0 = no change; negative = error; positive = inserted ID)
		$retPack = Array();		// return package with message, status, and date
		
		// if no database connection, connect to it;
		if($db == null) { 
			$db = ConnectDB();	
		}
		
		// cast is_paid ("true"/"false" in string) to tinyint
		$is_paid = $is_paid === 'true'? 1: 0;
		
		$sql_verify = "SELECT userid, name from budget". " " .
				"WHERE name='" .$name. "' ".
				"AND userid='" .$aid. "'";
		$qRet_verify = mysqli_query($db,$sql_verify);
		$isExist = mysqli_fetch_array($qRet_verify);
		
		if($isExist == null) {
			// begin transaction
			mysqli_autocommit($db,FALSE);
			
			// Not in DB yet, add new one
			$sql_insert = "INSERT INTO `budget`(`userid`, `name`, `description`, `planned_amount`, 
												`actual_amount`, `is_Paid` ,
												`modified_date`)" . " ";
												
			// TODO: with login available: $userid = $_SESSION['userid'];
			$sql_insert .= "VALUES (". $aid .",'". $name ."','". $desc ."',". $plan_amount .
									",". $actual_amount .",". $is_paid .
									",". $date .")";
			$qRet_insert = mysqli_query($db,$sql_insert);

			if ($qRet_insert == TRUE) {
				$retMsg = "SUCCESS: Added new Budget Entry";
				$retStatus = mysqli_insert_id($db);
				mysqli_commit($db);
				
			} else {
				$retMsg = "ERROR: unable to add new Budget Entry (A02)";
				$retStatus = -2;
				mysqli_rollback($db);
			}

			// end transaction 
			mysqli_autocommit($db,TRUE);
		} else {
			// in DB already, Abort addition process
			$retMsg = "ERROR: duplicate entry with same name detected (A01)";
			$retStatus = -1;
		}

		// prepare return package
		$retPack = [
			"status" => $retStatus,		
			"message" => $retMsg,
			"modified_date" => date("Y-M-d", strtotime($date)),
			"modified_date_value" => $date,
		];
		return $retPack;
	}

	function editBudgetEntry($aid, $entryId, $name, $desc, $plan_amount, 
							$actual_amount, $is_paid) {
		// other input variable for this function 												
		$date = date("Ymd");	// record current system time 
		
		//query variables
		$db = $this->db;		// set $db in this function as refering to class private $db;
		$sql_verify = "";		// SQL query for verifing pre-existance of entry
		$sql_update = "";		// SQL query to update existing entry 
		$qRet_verify = null;	// query result (for verification)
		$qRet_update = null;	// query result (update)
		$isExist = null;		// fetched result of returned query call (verification)
		$affectRows = 0;		// affected rows after commiting an update query 
		
		// return variables 
		$retMsg = ""; 			// return message
		$retStatus = 0;			// return status (0 = no change; negative = error; positive = inserted ID)
		$retPack = Array();		// return package with message, status, and date
		

		// check DB connectivity
		if($db == null) { 
			$db = ConnectDB();			
		}
		
		// cast is_paid ("true"/"false" in string) to tinyint
		$is_paid = $is_paid === 'true'? 1: 0;
		
		$sql_verify = "SELECT name from budget". " " .
				"WHERE bid='" .$entryId. "' ".
				"AND userid='" .$aid. "'";
		$qRet_verify = mysqli_query($db,$sql_verify);
		$isExist = mysqli_fetch_array($qRet_verify);
		
		if($isExist == null) {
			// not in DB
			$retMsg = "FAILED: entry with this particular name cannot be found";
			$retStatus = -1;
		} else {
			// begin transaction
			mysqli_autocommit($db,FALSE);
			
			$sql_update = "UPDATE `budget` ".
						  "SET `name`='" .$name. "',".
							  "`description`='" .$desc. "',".
							  "`modified_date`=" .$date. ",".
							  "`planned_amount`=" .$plan_amount. ",".
							  "`actual_amount`=" .$actual_amount. ",".
							  "`is_Paid`=" .$is_paid. " ";
			$sql_update .=  "WHERE bid='" .$entryId. "'";
			
			$qRet_update = mysqli_query($db,$sql_update);
			$affectRows = mysqli_affected_rows($db);
			if ($qRet_update == TRUE && $affectRows == 1) {
				// SUCCESSFUL, commit changes to DB
				$retMsg = "SUCCESS: Update the Budget Entry with new information";
				$retStatus = 1;
				mysqli_commit($db);
			} else if ($affectRows == 0) {
				// SUCCESSFUL, commit changes to DB
				$retMsg = "ERROR (E-00): Input is the same as the system data, nothing changed (E00)";
				$retStatus = 0;
				mysqli_rollback($db);
			} else if ($affectRows == -1) {
				// ERROR - Query ERROR 
				$retMsg = "ERROR: Database failure. Please contact support (E01)";
				$retStatus = -1;
				mysqli_rollback($db);
			} else {
				$retMsg = "ERROR: Something went wrong, please try again (E02)";
				$retStatus = -2;
				mysqli_rollback($db);
			}	
			
			// end transaction 
			mysqli_autocommit($db,TRUE);
		}
		
		// prepare return package
		$retPack = [
			"status" => $retStatus,		
			"message" => $retMsg,
			"modified_date" => date("Y-M-d", strtotime($date)),
			"modified_date_value" => $date,
		];
		return $retPack;
		
	}
	
	function delBudgetEntry($id) {
		//query variables
		$db = $this->db;	// set $db in this function as refering to class private $db;
		$sql_del = "";		// SQL query 
		$qRet_del = null;	// query result
		$affectRows = 0;	// affected rows after commit of query
		
		// return variables 
		$retMsg = ""; 		// return message
		$retStatus = 0;		// return status (0 = no change; negative = error; positive = inserted ID)
		$retPack = Array();	// an associative array containing info to return 
		
		
		// if no database connection, connect to it;
		if($db == null) { 
			$db = ConnectDB();	
		}

		
		// if no database connection, connect to it;
		if($db == null) { 
			$db = ConnectDB();			
		}
		// begin transaction
		mysqli_autocommit($db,FALSE);
		
		$sql_del = "DELETE FROM `budget` WHERE `bid`=" . $id;
		$qRet_del = mysqli_query($db,$sql_del);
		$affectRows = mysqli_affected_rows($db);
	
		if ($affectRows == 1) {
			// SUCCESSFUL, commit changes to DB
			$retMsg = "SUCCESS: Delete the Budget Entry";
			$retStatus = 1;
			mysqli_commit($db);
			
		} else if ($affectRows == 0) {
			// ERROR - no affected row, no change
			$retMsg = "ERROR (D-00): Unable to find target entry, please verify submission.(D00)";
			$retStatus = 0;
			mysqli_rollback($db);
			
		} else if ($affectRows == -1) {
			// ERROR - no affected row, no change
			$retMsg = "ERROR (D-1): Database failure. Please contact support. (D01)";
			$retStatus = -1;
			mysqli_rollback($db);
		
		} else {
			$retMsg = "ERROR: unexpected error, please try again later.".
						"If the problem consist, please contact support. (D02)" ;
			$retStatus = -2;
			mysqli_rollback($db);
		}	
		
		// end transaction 
		mysqli_autocommit($db,TRUE);
		
		// prepare return package
		$retPack = [
			"status" => $retStatus,		
			"message" => $retMsg,
		];
		return $retPack;
	}
}

?>