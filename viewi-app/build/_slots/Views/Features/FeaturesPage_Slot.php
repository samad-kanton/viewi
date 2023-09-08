<?php

use Viewi\PageEngine;
use Viewi\BaseComponent;

function RenderFeaturesPage_Slot(
    Components\Views\Features\FeaturesPage $_component,
    PageEngine $pageEngine,
    array $slots
    , ...$scope
) {
    $slotContents = [];
    
    $_content = '';

    $_content .= '
    <div class="p-4">
      
    </div>  
';
    return $_content;
   
}
