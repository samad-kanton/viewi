<?php

namespace Components\Views\Services;

use Viewi\BaseComponent;

class ServicesPage extends BaseComponent
{
    public string $title = 'Services';
    // public array $fruits = ["Orange", "Apple"];
    // public string $name = "Your name";

    public function handleSubmit(DOMEvent $event)
    {
        $event->preventDefault();
    }
}
