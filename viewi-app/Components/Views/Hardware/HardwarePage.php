<?php

namespace Components\Views\Hardware;

use Viewi\BaseComponent;

class HardwarePage extends BaseComponent
{
    public string $title = 'Hardware';

    public function handleSubmit(DOMEvent $event)
    {
        $event->preventDefault();
    }
}
