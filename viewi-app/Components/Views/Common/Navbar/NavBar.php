<?php

namespace Components\Views\Common;

use Viewi\BaseComponent;
use Components\Services\Features;

class NavBar extends BaseComponent
{
    // public CounterState $counter;
    public string $currentUrl = '';

    public Features $features;

    function __init(Features $features){
        $this->features = $features;
    }  
}
