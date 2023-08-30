<?php

namespace Components\Views\Contact;

use Viewi\BaseComponent;
use Viewi\Common\HttpClient;

class ContactPage extends BaseComponent
{
    public string $title = 'Contact | KOG';    
    public string $statusMessage = "loading...";

    private HttpClient $http;
    // private MessageService $messageService;

    // public function __construct(HttpClient $http)
    // {
    //     $this->http = $http;
    //     // $this->messageService = $messageService;
    // }

    public function pop()
    {
        // $event->preventDefault();
        // $this->http->get("https://jsonplaceholder.typicode.com/todos")
        $this->http->get("/api/name")
        ->then(function ($data) {
            // use $data here
            $this->statusMessage = 'We have received Your message and we will get to you shortly';
        }, function ($error) {
            // handle error here
            $this->statusMessage = 'Something went wrong';
        });
    }
    
    
}
