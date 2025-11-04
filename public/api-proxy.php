<?php
/**
 * API Proxy - Routes requests to backend PHP files
 * This file bypasses the frontend SPA router since it's in the public/ folder
 */

// Get the requested file from query parameter
$file = isset($_GET['file']) ? basename($_GET['file']) : null;

if (!$file) {
    http_response_code(400);
    die(json_encode(['error' => 'Missing file parameter']));
}

// List of allowed API files
$allowedFiles = [
    'GetDiscordReleaseNotes.php',
    'GetDiscordContentCarousel.php',
];

if (!in_array($file, $allowedFiles)) {
    http_response_code(403);
    die(json_encode(['error' => 'File not allowed']));
}

// Forward query parameters
$queryString = http_build_query($_GET);
$path = "/game/$file" . ($queryString ? "?$queryString" : '');

// Use curl to fetch from the backend
$ch = curl_init("http://localhost/game/$file" . ($queryString ? "?$queryString" : ''));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Parse headers and body
list($headers, $body) = explode("\r\n\r\n", $response, 2);

// Forward response
http_response_code($httpCode);
echo $body;
?>
