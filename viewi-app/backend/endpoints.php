<?php

namespace BackendApp;

use Viewi\Routing\Router;
use Viewi\WebComponents\Response;

Router::register('get', '/api/name', function () {
    return Response::Json([
        "Name" => "Samad Kanton"
    ])->WithCode(200);
});

// 404 
Router::register('*', '/api/*', function () {
    return Response::Json([
        "message" => "Not Found"
    ])->WithCode(404);
});
