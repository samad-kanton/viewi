<?php

use Viewi\PageEngine;
use Viewi\BaseComponent;

function RenderHardwarePage(
    Components\Views\Hardware\HardwarePage $_component,
    PageEngine $pageEngine,
    array $slots
    , ...$scope
) {
    $slotContents = [];
    
    $_content = '';

    $slotContents[0] = 'HardwarePage_Slot';
    $pageEngine->putInQueue($_content);
    $pageEngine->renderComponent('PublicLayout', [], $_component, $slotContents, [
'title' => $_component->title,
], ...$scope);
    $slotContents = [];
    $_content = "";
    return $_content;
   
}
