<?php

namespace Components\Views\Contact;

use Viewi\BaseComponent;
use Viewi\Common\HttpClient;

class ContactPage extends BaseComponent
{
    public string $title = 'Contact | KOG';    
    public string $statusMessage = "loading...";

    private HttpClient $http;

    public function pop()
    {
        $this->http->get("https://jsonplaceholder.typicode.com/todos")
        ->then(function ($data) {
            // use $data here
            $this->statusMessage = 'We have received Your message and we will get to you shortly';
        }, function ($error) {
            // handle error here
            $this->statusMessage = 'Something went wrong';
        });
    }
    
    
}
