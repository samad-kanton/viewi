<?php

use Viewi\PageEngine;
use Viewi\BaseComponent;

function RenderDashboardPage_Slot(
    Components\Views\Dashboard\DashboardPage $_component,
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
