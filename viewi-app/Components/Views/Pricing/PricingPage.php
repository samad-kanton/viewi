<?php

namespace Components\Views\Pricing;

use Viewi\BaseComponent;
use Viewi\Common\ClientRouter;

class PricingPage extends BaseComponent
{
    public string $title = 'Pricing';
    // public array $fruits = ["Orange", "Apple"];
    // public string $name = "Your name";
    public string $currentUrl = '';
    public string $isActive = '';
    public bool $myurl;

    private ClientRouter $clientRouter;

    function __init(ClientRouter $clientRouter) {
        $this->clientRouter = $clientRouter;
    }

    function __mounted() {
        $currentUrl = $this->clientRouter->getUrl();
        // $isActive = $myurl == $currentUrl;
    }

    public function handleSubmit(DOMEvent $event)
    {
        $event->preventDefault();
    }
}
