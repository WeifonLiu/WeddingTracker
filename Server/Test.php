<?php
include 'BudgetConnection.php';
$BudgetCon = new BudgetConnection;
?>


<?php
	
  class test
  {
    public static function run() { echo "Works\n"; }
  }

  $className = 'test';
  $className::run();

?>

<?php 
	echo var_dump($BudgetCon -> delBudgetEntry(28));

/*
	echo var_dump($BudgetCon -> editBudgetEntry(
									0,
									27,
									'more testing',
									'blah',
									350,
									341,
									false));
*/
									
									/*
									
									["aid"]=>
  string(1) "0"
  ["entryid"]=>
  string(2) "27"
  ["entryName"]=>
  string(12) "more testing"
  ["entryDesc"]=>
  string(3) "312"
  ["entryPlanAmount"]=>
  string(3) "350"
  ["entryActualAmount"]=>
  string(3) "331"
  ["entryIsPaid"]=>
  string(5) "false"
?>


<?php
/*
include 'BudgetConnection.php';


echo 'start';
$test = new BudgetConnection;
$result = $test -> addBudgetEntry('testentry16', '', 0, 0, false);
echo $result . '<br>';
*/

?>

<?php
/*
include 'DBConnection.php';

echo 'start';
$test = new DBConnection;
$db = $test -> getDB();
echo '<br>';
if ($db != null) {
	echo 'good ';
} else {
	echo 'nah ';
}
*/
?>