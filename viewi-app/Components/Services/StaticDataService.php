<?php

namespace Components\Services;
use Viewi\Common\ClientRouter;
use Viewi\Components\Services\DomHelper;
use Viewi\DOM\Events\DOMEvent;
use Viewi\Common\HttpClient;

class StaticDataService {

    private HttpClient $http;
    private ClientRouter $router;    

    function __construct(HttpClient $http, ClientRouter $router){
        $this->http = $http;
        $this->router = $router;
    }

    function GetCountries(callable $callback){
        $this->http->get('/viewi-app/assets/static/data/countries.json')
        ->then(function($data) use ($callback) {
            // echo $data;
            // $data = ["name" => "Kofi", "age" => 20];
            // echo $data;
            $callback($data);
        }, function($error){
            echo $error;
        });
    }
}