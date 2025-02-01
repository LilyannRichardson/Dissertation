<?php
$json = file_get_contents('php://input');
$obj = json_decode($json, true);
$username = explode("/", dirname(__FILE__))[2];
$server_data = '/home/'.$username.'/server_data';
$path = $server_data."/".$obj["filename"];
if (substr(realpath(dirname($path)), 0, strlen($server_data))!=$server_data) {
    error_log("attempt to write to bad path: ".$path);
} else {
    file_put_contents($path, $obj["filedata"], FILE_APPEND);
}
?>