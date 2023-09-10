<?php

namespace Components\Views\BaseLayout;

use Viewi\BaseComponent;
use Viewi\DOM\Events\DOMEvent;
use Viewi\Components\Services\DomHelper;
use Components\Services\ThemeModeService; 

class BaseLayout extends BaseComponent {
    public string $title = 'Base Layout';
    public int $scrollTop = 0;

    public ThemeModeService $themeMode;

    function __init(ThemeModeService $themeMode){
        // $this->clientRouter = $clientRouter;
        $this->themeMode = $themeMode;
    }

    function __rendered(){ 
        $document = DomHelper::getDocument();
        $window = DomHelper::getWindow();
        $document !== null && $document->addEventListener('scroll', $this->toggleScrollTop);
        $this->toggleScrollTop();
    }
 
    function toggleScrollTop(){
        $document = DomHelper::getDocument();
        if($document !== null){
            $this->scrollTop = $document->scrollingElement->scrollTop;
            // echo $this->scrollTop;
            $this->showScrollTop = $this->scrollTop > 350;
            // echo $this->showScrollTop;
        }
    }

    function scrollToTop(){
        $window = DomHelper::getWindow();
        $window !== null && $window->scrollTo(0, 0, 3000);
        // echo $window;
        // <<<'javascript'
        //     // console.log(window.document.documentElement);
        //     // setTimeout(() => window.scrollTo(0, 0), 0);
        //     window.scrollTo(0, 0);
        // javascript;
    }
}
