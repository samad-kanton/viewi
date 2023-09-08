<?php

namespace Components\Views\Home;

use Viewi\BaseComponent;
// use Viewi\Common\ClientRouter;

class HomePage extends BaseComponent
{
    public string $title = 'Smart Billing Software';
    // public string $currentUrl = '';
    // public array $fruits = ["Orange", "Apple"];
    // public string $name = "Your name";
    // public array $posts = [
    //     'Viewi is awesome!',
    //     'Lorem ipsum dolor sit amet'
    // ];

    // private ClientRouter $clientRouter;

    // function __init(ClientRouter $clientRouter) {
    //     $this->clientRouter = $clientRouter;
    // }

    function __mounted() {
        // $currentUrl = $this->clientRouter->getUrl();
        // $this->clientRouter->navigate("/signin");
        // $isActive = $myurl == $currentUrl;
    }

    public function handleSubmit(DOMEvent $event)
    {
        $event->preventDefault();
    }
}
