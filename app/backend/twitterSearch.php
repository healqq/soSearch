<?php
require_once ('../../vendor/autoload.php');
/*
	setting api consumer key
*/
\Codebird\Codebird::setConsumerKey(
	'IXBI9z79snb70TRUv347nTirC', 
	'aoYRe7pdNEb4CrhfcHidxTKp3VbAlswtohWdxouaZRrOecUesF'); // static, see 'Using multiple Codebird instances'
/*
	getting instance
*/
$cb = \Codebird\Codebird::getInstance();
/*
	application auth
*/
$reply = $cb->oauth2_token();
$bearer_token = $reply->access_token;
\Codebird\Codebird::setBearerToken($bearer_token);

/*
	requesting
*/
$q = $_GET['q'];
$reply = $cb->search_tweets(
	[
		'q' => $q
	]
	, true
);
echo json_encode($reply);