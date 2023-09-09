<?php

use Viewi\PageEngine;
use Viewi\BaseComponent;

function RenderHomePage_Slot(
    Components\Views\Home\HomePage $_component,
    PageEngine $pageEngine,
    array $slots
    , ...$scope
) {
    $slotContents = [];
    
    $_content = '';

    $_content .= '
    ';
    $slotContents[0] = false;
    $pageEngine->putInQueue($_content);
    $pageEngine->renderComponent('Hero', [], $_component, $slotContents, [], ...$scope);
    $slotContents = [];
    $_content = "";
    $_content .= '
    <div class="p-4">
        <!-- <i class="lni lni-save"></i> -->
        <div class="max-w-screen-xl mx-auto space-y-16">
            <!-- ';
    $_content .= htmlentities($_component->currentUrl ?? '');
    $_content .= ' -->
            ';
    $slotContents[0] = false;
    $pageEngine->putInQueue($_content);
    $pageEngine->renderComponent('WhyUs', [], $_component, $slotContents, [], ...$scope);
    $slotContents = [];
    $_content = "";
    $_content .= '
            ';
    $slotContents[0] = false;
    $pageEngine->putInQueue($_content);
    $pageEngine->renderComponent('Testimonial', [], $_component, $slotContents, [], ...$scope);
    $slotContents = [];
    $_content = "";
    $_content .= '
        </div>
    </div>  
';
    return $_content;
   
}
