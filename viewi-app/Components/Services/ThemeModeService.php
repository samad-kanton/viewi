<?php

namespace Components\Services;

use Viewi\Components\Common\DomHelper;

class ThemeModeService {
    public $mode = 'light';
    
    function __init(){
        // $window = DomHelper::getWindow();
        // echo 123;
        // $this->mode = 'dark';
        // // $window !== null ? 
        $this->toggle();
    }

    function toggle(){
        $window = DomHelper::getWindow();
        $document = DomHelper::getDocument();
        echo $this->mode;
        if($this->mode == 'light'){
            $this->mode = 'dark';
            $document->documentElement->classList->remove('light');
            $document->documentElement->classList->add('dark');
        }
        else{
            $this->mode = 'light';
            $document->documentElement->classList->remove('dark');
            $document->documentElement->classList->add('light');
        }
        $window->localStorage->setItem("theme-mode", $this->mode); 
    }
}