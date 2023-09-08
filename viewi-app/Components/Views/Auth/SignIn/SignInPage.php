<?php

namespace Components\Views\Auth\SignIn;

use Viewi\BaseComponent;
use Viewi\Common\HttpClient;
use Viewi\Common\ClientRouter;
use Viewi\Components\Services\DomHelper;
use Components\Services\InputState;

class SignInPage extends BaseComponent
{
    public string $title = "Signin to MyshopOS";    
    public string $email = '';    
    public string $password = ''; 
    public $resp = '';
    public bool $isSubmitted; 
    public bool $validEmail;  
    public InputState $inputStates;

    private HttpClient $http;
    private ClientRouter $router;

    // function __init(HttpClient $http, ClientRouter $clientRouter, UIClass $uiClassState){
    function __init(HttpClient $http, ClientRouter $clientRouter, InputState $inputState){
        $this->http = $http;
        $this->router = $clientRouter;
        // $this->uiClass = $uiClassState;
        $this->inputStates = $inputState;
    }    

    public function login(DOMEvent $event){
        $event->preventDefault();
        $document = DomHelper::getWindow();
        // echo $email->value . ' ' . $password->value;
        $this->http->post('/api/login', [
            'email' => $this->email,
            'password' => $this->password,
        ])
        ->then(
            function ($resp) {
                echo "Resp: " . json_encode($resp, true);
                // $this->isSubmitted = 'true';
                $this->validEmail = $resp->email;
                $this->validPassword = $resp->password;
                // $this->isValid = ['email' => $resp->email, 'password' => $resp->password];
                echo $this->validEmail;
                // echo count($this->valid);
                // $this->resp = $resp;
                // if (!$this->Id) {
                    // $this->router->navigate("/sources/edit/{$data->name}");
                // }
            },
            function ($error) {
                echo $error;
            }
        );
        // kanton404@gmail.com
    }

    function valid($field){
        return $field;
    }
}
