<?php
// Same-origin proxy for the wh_cang dashboard API.
// The 3D dashboard is served over HTTPS, but the wh_cang API only exists on
// the HTTP site -> a browser fetch from the HTTPS page is blocked (mixed
// content). This endpoint runs server-side, fetches the HTTP API and returns
// it over HTTPS, so the dashboard can load live data.
error_reporting(0);
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');

$action = isset($_GET['action']) ? preg_replace('/[^A-Za-z_]/', '', $_GET['action']) : 'dashboard';
$allowed = array('dashboard'); // public actions only
if (!in_array($action, $allowed, true)) {
    http_response_code(403);
    echo json_encode(array('success' => false, 'message' => 'action not allowed'));
    exit;
}

$url = 'http://10.176.33.211:1102/wh_cang/api/api.php?action=' . rawurlencode($action);

$resp = false;
if (function_exists('curl_init')) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    $resp = curl_exec($ch);
    curl_close($ch);
}
if ($resp === false) {
    $ctx = stream_context_create(array('http' => array('timeout' => 30)));
    $resp = @file_get_contents($url, false, $ctx);
}
if ($resp === false) {
    http_response_code(502);
    echo json_encode(array('success' => false, 'message' => 'proxy failed to reach wh_cang API'));
    exit;
}

echo $resp;
