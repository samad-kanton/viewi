<?php

use Viewi\PageEngine;
use Viewi\BaseComponent;

function RenderContactPage_Slot(
    Components\Views\Contact\ContactPage $_component,
    PageEngine $pageEngine,
    array $slots
    , ...$scope
) {
    $slotContents = [];
    
    $_content = '';

    $_content .= '
    <div class="p-4 sm:ml-64">
        <h1>';
    $_content .= htmlentities($_component->title ?? '');
    $_content .= '</h1>
        ';
    $_content .= $_component->pop();
    $_content .= '
        <p>
            ';
    $_content .= htmlentities($_component->statusMessage ?? '');
    $_content .= '
        </p>
    </div>
';
    return $_content;
   
}
