<?php

namespace Components\Views\Dashboard;

use Viewi\BaseComponent;

class DashboardPage extends BaseComponent
{
    public string $title = 'Dashboard | KOG';
    public array $fruits = ["Orange", "Apple"];
    public string $name = "Your name";

    public function handleSubmit(DOMEvent $event)
    {
        $event->preventDefault();
    }
}
