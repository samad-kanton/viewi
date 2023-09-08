<?php

use Viewi\PageEngine;
use Viewi\BaseComponent;

function RenderPricingPage(
    Components\Views\Pricing\PricingPage $_component,
    PageEngine $pageEngine,
    array $slots
    , ...$scope
) {
    $slotContents = [];
    
    $_content = '';

    $slotContents[0] = 'PricingPage_Slot';
    $pageEngine->putInQueue($_content);
    $pageEngine->renderComponent('PublicLayout', [], $_component, $slotContents, [
'title' => $_component->title,
'currentUrl' => $_component->currentUrl,
], ...$scope);
    $slotContents = [];
    $_content = "";
    return $_content;
   
}
