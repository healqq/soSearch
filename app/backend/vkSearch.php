<?php

require_once ('../../vendor/autoload.php');

/*
	requesting
*/
$q = $_GET['q'];
// echo $q;
$reply = sendRequest($q);
echo $reply;

function sendRequest($q)
{
	$url = 'https://api.vk.com/method/';
	$method = 'newsfeed.search';
	$client = new GuzzleHttp\Client();
	
	$reply = $client->get(
		$url.$method,
		[
			'q' => $q,
			'count' => 200
		]
	
	);

	return $reply->getBody();
}