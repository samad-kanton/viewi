<?php

use Viewi\PageEngine;
use Viewi\BaseComponent;

function RenderAboutPage_Slot(
    Components\Views\About\AboutPage $_component,
    PageEngine $pageEngine,
    array $slots
    , ...$scope
) {
    $slotContents = [];
    
    $_content = '';

    $_content .= '
    <h1>';
    $_content .= htmlentities($_component->title ?? '');
    $_content .= '</h1>
';
    return $_content;
   
}
