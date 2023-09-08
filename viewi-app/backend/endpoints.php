<?php

namespace BackendApp;

use Viewi\Routing\Router;
use Viewi\WebComponents\Request;
use Viewi\WebComponents\Response;

Router::register('get', '/api/name', function () {
    return [
        "name" => "Samad Kanton"
    ];
});

Router::register('post', '/api/login', function () {
    $inputContent = file_get_contents('php://input');
    $stdObject = json_decode($inputContent, false);
    $email = $stdObject->email;
    $password = $stdObject->password;
    return [
        "email" => $email == 'k@kk.com',
        "password" => $password == 'pass'
    ];
});

// 404 
Router::register('*', '/api/*', function () {
    return Response::Json([
        "message" => "Not Found"
    ])->WithCode(404);
});
