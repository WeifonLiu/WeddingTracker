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
		$retList = Array(); 		// return with a list of entries
		$db = $this->db;	// set $db in this function as refering to class private $db;
		
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
		
		$db = $this->db;		// set $db in this function as refering to class private $db;
		$date = date("Ymd");	// record current system time 
		$retMsg = ""; 			// return message
		$retStatus = 0;			// return status (0 = no change; negative = error; positive = inserted ID)
		$retPack = Array();		// return package with message, status, and date
		
		// if no database connection, connect to it;
		if($db == null) { 
			$db = ConnectDB();	
		}
		
		// cast is_paid ("true"/"false" in string) to tinyint
		$is_paid = $is_paid === 'true'? 1: 0;
		
		$sql = "SELECT userid, name from budget". " " .
				"WHERE name='" .$name. "' ".
				"AND userid='" .$aid. "'";
		$qRet = mysqli_query($db,$sql);
		$ret = mysqli_fetch_array($qRet);
		
		if($ret == null) {
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
				$retMsg = "FAILED: unable to add new Budget Entry";
				$retStatus = -2;
				mysqli_rollback($db);
			}

			// end transaction 
			mysqli_autocommit($db,TRUE);
		} else {
			// in DB already, Abort addition process
			$retMsg = "FAILED: duplicate entry with same name detected";
			$retStatus = -1;
		}

		// prepare return package
		$retPack = [
			"status" => $retStatus,		
			"message" => $retMsg,
			"modified_date" => date("Y-M-d", strtotime($date)),
		];
		return $retPack;
	}

	function editBudgetEntry($aid, $entryId, $name, $desc, $plan_amount, 
							$actual_amount, $is_paid) {
		$db = $this->db;		// set $db in this function as refering to class private $db;
		$date = date("Ymd");	// record current system time 
		$retMsg = ""; 			// return message
		$retStatus = 0;			// return status (0 = no change; negative = error; positive = inserted ID)
		$retPack = Array();		// return package with message, status, and date
		
		// if no database connection, connect to it;
		if($db == null) { 
			$db = ConnectDB();			
		}
		
		// cast is_paid ("true"/"false" in string) to tinyint
		$is_paid = $is_paid === 'true'? 1: 0;
		
		$sql = "SELECT name from budget". " " .
				"WHERE bid='" .$entryId. "' ".
				"AND userid='" .$aid. "'";
		$qRet = mysqli_query($db,$sql);
		$ret = mysqli_fetch_array($qRet);
		
		if($ret == null) {
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
				$retMsg = "ERROR: Input is the same as the system data, nothing changed";
				$retStatus = 0;
				mysqli_rollback($db);
			} else {
				$retMsg = "FAILED: Something went wrong, please try again";
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
		];
		return $retPack;
		
	}
	
	function delBudgetEntry($id) {
		$db = $this->db;	// set $db in this function as refering to class private $db;
		// if no database connection, connect to it;
		if($db == null) { 
			$db = ConnectDB();	
		}
	}
	
}

?>