<?php

namespace Components\Views\Contact;

use Viewi\BaseComponent;
use Viewi\Common\HttpClient;

class ContactPage extends BaseComponent
{
    public string $title = 'Contact | KOG';    
    public string $statusMessage = "loading...";
    public string $data = "";

    private HttpClient $http;

    function __init(HttpClient $http){
        $this->http = $http;
    }

    public function pop()
    {
        // $this->http->get("https://jsonplaceholder.typicode.com/todos")
        $this->http->get("/api/name")
        ->then(function ($resp) {
            // use $data here
            $this->statusMessage = 'We have received Your message and we will get to you shortly';
            $this->data = $resp['name'];
        }, function ($error) {
            // handle error here
            $this->statusMessage = 'Something went wrong';
        });
    }
    
    
}
