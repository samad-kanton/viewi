<?php

namespace Components\Views\Features;

use Viewi\BaseComponent;
use Components\Services\Features;

class FeaturesPage extends BaseComponent
{
    public string $title = 'Features';
    public Features $features;

    function __init(Features $features){
        $this->features = $features;
    }
    
}
