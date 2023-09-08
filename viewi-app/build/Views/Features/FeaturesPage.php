<?php

use Viewi\PageEngine;
use Viewi\BaseComponent;

function RenderFeaturesPage(
    Components\Views\Features\FeaturesPage $_component,
    PageEngine $pageEngine,
    array $slots
    , ...$scope
) {
    $slotContents = [];
    
    $_content = '';

    $slotContents[0] = 'FeaturesPage_Slot';
    $pageEngine->putInQueue($_content);
    $pageEngine->renderComponent('PublicLayout', [], $_component, $slotContents, [
'title' => $_component->title,
], ...$scope);
    $slotContents = [];
    $_content = "";
    return $_content;
   
}
