<?php

namespace Components\Views\Common;

use Viewi\BaseComponent;

class CoreValues extends BaseComponent
{
    // public CounterState $counter;

    // public function __init(CounterState $counterState)
    // {
    //     $this->counter = $counterState;
    // }   
}
function getFeatures(){
        echo $this->features;
        return $this->features ;
    }