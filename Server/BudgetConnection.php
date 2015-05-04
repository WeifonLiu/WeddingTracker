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
	*	@param $useremail
	*/
	function getAllBudgetEntry($useremail) {
		$retList = Array(); 		// return with a list of entries
		$db = $this->db;	// set $db in this function as refering to class private $db;
		// if no database connection, connect to it;
		if($db == null) { 
			$db = ConnectDB();	
		}
		
		$sql = "SELECT B.bid, B.name, B.description, B.modified_date, ".
						"B.planned_amount, B.actual_amount, " . 
						"B.is_Paid" ." ".
				"FROM budget as B" ." ".
				"LEFT JOIN account as A ON A.aid=B.userid" ." ".
				"WHERE A.email='". $useremail ."'"; 
		$qRes = mysqli_query($db,$sql);
		
		while($entry = mysqli_fetch_assoc($qRes)) {
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
	
	function addBudgetEntry($name, $desc, $plan_amount, 
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
				"WHERE name='" .$name. "'";
		$qRet = mysqli_query($db,$sql);
		$ret = mysqli_fetch_array($qRet);
		
		if($ret == null) {
			// Not in DB yet, add new one
			
			
			$sql_insert = "INSERT INTO `budget`(`userid`, `name`, `description`, `planned_amount`, 
												`actual_amount`, `is_Paid` ,
												`modified_date`)" . " ";
												
			// TODO: with login available: $userid = $_SESSION['userid'];
			$sql_insert .= "VALUES (". 0 .",'". $name ."','". $desc ."',". $plan_amount .
									",". $actual_amount .",". $is_paid .
									",". $date .")";
			$qRet_insert = mysqli_query($db,$sql_insert);

			if ($qRet_insert == TRUE) {
				$retMsg = "SUCCESS: Added new Budget Entry";
				$retStatus = mysqli_insert_id($db);
			} else {
				$retMsg = "FAILED: unable to add new Budget Entry";
				$retStatus = -2;
			}			
		} else {
			// in DB already, Abort addition process
			$retMsg = "FAILED: duplicate entry with same name detected";
			$retStatus = -1;
		}
		
		$retPack = [
			"status" => $retStatus,
			"message" => $retMsg,
			"modified_date" => date("Y-M-d", strtotime($date)),
		];
		return $retPack;
	}

	function editBudgetEntry($id) {
		$db = $this->db;	// set $db in this function as refering to class private $db;
		// if no database connection, connect to it;
		if($db == null) { 
			$db = ConnectDB();	
		}
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