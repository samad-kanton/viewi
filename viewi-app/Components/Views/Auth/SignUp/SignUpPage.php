<?php

namespace Components\Views\Auth\SignUp;

use Viewi\BaseComponent;
use Viewi\Common\HttpClient;
use Viewi\Common\ClientRouter;
use Viewi\Components\Services\DomHelper;
use Viewi\DOM\Events\DOMEvent;

class SignUpPage extends BaseComponent
{
    public string $title = "Create a MyshopOS account";
    public $countries = [];
    public $fruits = ["Orange", "Apple"];

    private HttpClient $http;
    private ClientRouter $router;

    function __init(HttpClient $http, ClientRouter $router){
        $this->http = $http;
        $this->router = $router;
    }

    function __rendered() {
        // click outside
        // $document = DomHelper::getDocument();
        // if ($document !== null) {
        //     $document->addEventListener('click', $this->onClickOutside, 'hello');
        // }

        // // resize event
        // // $document = DomHelper::getWindow();
        // if ($document !== null) {
        //     $document->addEventListener('resize', $this->onResize, ['passive' => true]);
        // }
        // echo DomHelper::getDocument()->location;

        $this->http->get('/viewi-app/assets/static/data/countries.json')
        ->then(function($data){
            echo $data;
            // $this->countries = json_decode(json_encode($data));
            $this->countries = ($data);
        }, function($error){
            echo $error;
        });
    }

    function popCountries(){
        // $this->http->get('/viewi-app/assets/static/js/countries.json')
        // ->then(function($data){
        //     echo $data;
        // }, function($error){
        //     echo $error;
        // });
        // echo file_get_contents('/viewi-app/assets/static/js/countries.json');

        // <<<'javascript'
        //     const resp = fetch('/viewi-app/assets/static/js/countries.json')
        //     .then(resp => resp.ok && resp.json())
        //     .then(data => {
        //         console.log(data);
        //         $onClickOutside = "Hello";
        //         document.querySelector('#country').value = "";
        //     })
        //     javascript;        
    }

    function handleSubmit(DomEvent $event){
        $event->preventDefault();

    }

}
