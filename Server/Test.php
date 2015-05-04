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

	echo var_dump($BudgetCon -> getAllBudgetEntry("test@test.user"));
	
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