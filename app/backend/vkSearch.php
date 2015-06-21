<?php

require_once ('../../vendor/autoload.php');

/*
	requesting
*/
$q = $_GET['q'];
if ( isset($_GET['offset']) ) {
	$offset = $_GET['offset'];
}
else{
	$offset = 0;
}

// echo $q;
$reply = sendRequest($q, $offset);
echo $reply;

function sendRequest($q, $offset)
{
	$url = 'https://api.vk.com/method/';
	$method = 'newsfeed.search';
	$client = new GuzzleHttp\Client();
	
	$reply = $client->get(
		$url.$method,
		[
			'query' => [
				'q' => $q,
				'count' => 200,
				'offset' => $offset
			],
		]
	
	);

	return $reply->getBody();
}