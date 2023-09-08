<?php

use Viewi\PageEngine;
use Viewi\BaseComponent;

function RenderHardwarePage_Slot(
    Components\Views\Hardware\HardwarePage $_component,
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
