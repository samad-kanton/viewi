<?php

namespace Components\Views\Auth\ForgotPassword;

use Viewi\BaseComponent;
use Viewi\Common\HttpClient;
use Viewi\Common\ClientRouter;
use Components\Services\CounterState;

class ForgotPasswordPage extends BaseComponent
{
    public string $title = "Reset Password";    
    
    private HttpClient $http;
    private ClientRouter $router;
    public CounterState $counter;

    function __init(HttpClient $http, ClientRouter $clientRouter, CounterState $counterState){
        $this->http = $http;
        $this->router = $clientRouter;
        $this->counter = $counterState;
    }

    public function save(DOMEvent $event){
        $event->preventDefault();
        // kanton404@gmail.com
        $this->http->get("/api/name")
        ->then(
            function ($data) {
                echo $data;
                // if (!$this->Id) {
                    $this->router->navigate("/sources/edit/{$data->name}");
                // }
            },
            function ($error) {
                echo $error;
            }
        );
    }
}
