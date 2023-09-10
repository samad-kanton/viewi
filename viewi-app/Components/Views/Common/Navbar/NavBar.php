<?php

namespace Components\Views\Common;

use Viewi\BaseComponent;
use Components\Services\Features;
use Components\Services\ThemeModeService; 

class NavBar extends BaseComponent
{
    public string $currentUrl = '';
    
    public Features $features;
    public ThemeModeService $themeMode;

    function __init(Features $features, ThemeModeService $themeMode){
        $this->features = $features;
        $this->themeMode = $themeMode;
    }  
}
