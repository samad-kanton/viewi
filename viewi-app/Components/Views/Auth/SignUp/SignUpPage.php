<?php

namespace Components\Views\Auth\SignUp;
// namespace Components\Db\conn;

// require "/viewi-app/Components/Services/db/conn.php";

use Viewi\BaseComponent;
use Viewi\Common\HttpClient;
use Viewi\Common\ClientRouter;
use Viewi\Components\Services\DomHelper;
use Viewi\DOM\Events\DOMEvent;
use Components\Services\StaticDataService;

class SignUpPage extends BaseComponent
{
    public string $title = "Create a MyshopOS account";
    public StaticDataService $staticDataService;
    public string $staticData;

    private HttpClient $http;
    private ClientRouter $router;

    function __init(HttpClient $http, ClientRouter $router, StaticDataService $staticDataService){
        $this->http = $http;
        $this->router = $router;
        $this->staticDataService = $staticDataService;
        $this->ReadCountries();
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

        // $this->http->get('/viewi-app/assets/static/data/countries.json')
        // ->then(function($data){
        //     echo $data;
        //     // $this->countries = json_decode(json_encode($data));
        //     $this->countries = ($data);
        // }, function($error){
        //     echo $error;
        // });
    }

    function ReadCountries(){
        $this->staticDataService->GetCountries(function($staticData){
            echo $staticData;
            $this->staticData = $staticData;
        });    
    }

    function handleSignUp(DomEvent $event){
        $event->preventDefault();
    }

}
