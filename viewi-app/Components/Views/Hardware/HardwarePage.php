<?php

namespace Components\Views\Hardware;

use Viewi\BaseComponent;

class HardwarePage extends BaseComponent
{
    public string $title = 'Hardware';
    public $activeIndex = 0;
    public $activeClass = "border-blue-600 bg-white hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500 dark:bg-gray-900 dark:focus:ring-blue-800";
    public $inactiveClass = "border-white hover:border-gray-200 dark:border-gray-900 dark:bg-gray-900 dark:hover:border-gray-700 bg-white focus:ring-4 focus:outline-none focus:ring-gray-300 dark:text-white dark:focus:ring-gray-800";
    public $active = '';

    function __init(){
        $this->active = $this->activeIndex == 0 ? $this->activeClass : $this->inactiveClass;
    } 

    public function toggleCategoryIndex(DomEvent $event, int $index){
        // echo $index;
        $this->activeIndex = $index;
        $this->active = $this->activeIndex == $index ? $this->activeClass : $this->inactiveClass;
        return $this->active;
    }

    public function handleSubmit(DOMEvent $event) {
        $event->preventDefault();
    }
}
