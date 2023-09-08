<?php

use Viewi\PageEngine;
use Viewi\BaseComponent;

function RenderServicesPage_Slot(
    Components\Views\Services\ServicesPage $_component,
    PageEngine $pageEngine,
    array $slots
    , ...$scope
) {
    $slotContents = [];
    
    $_content = '';

    $_content .= '
    <div class="p-4">
        <!-- <i class="lni lni-save"></i> -->
        
    </div>  
';
    return $_content;
   
}
