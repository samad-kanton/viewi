<?php

use Viewi\PageEngine;
use Viewi\BaseComponent;

function RenderCssBundle_v1(
    Viewi\Components\Assets\CssBundle $_component,
    PageEngine $pageEngine,
    array $slots
    , ...$scope
) {
    $slotContents = [];
    
    $_content = '';

    $_content .= '<link rel="stylesheet" href="/css/main.css">';
    return $_content;
   
}
