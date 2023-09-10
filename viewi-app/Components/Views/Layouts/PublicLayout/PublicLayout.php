<?php

namespace Components\Views\PublicLayout;

use Viewi\BaseComponent;
use Viewi\Common\ClientRouter;
use Viewi\DOM\Events\DOMEvent;
use Viewi\Components\Services\DomHelper;
use Components\Services\ThemeModeService; 

class PublicLayout extends BaseComponent
{
    public string $title = '';
    public ThemeModeService $themeMode;

    function __init(ClientRouter $clientRouter, ThemeModeService $themeMode){
        // $this->clientRouter = $clientRouter;
        $this->themeMode = $themeMode;
    }

    function toggleTheme(){
        
    }

    // function __mounted() {
    //     $currentUrl = $this->clientRouter->getUrl();
    //     // $isActive = $myurl === $currentUrl;
    // }
}
