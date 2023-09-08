<?php

use Viewi\PageEngine;
use Viewi\BaseComponent;

function RenderPost(
    \Post $_component,
    PageEngine $pageEngine,
    array $slots
    , ...$scope
) {
    $slotContents = [];
    
    $_content = '';

    $_content .= '<p>';
    $_content .= htmlentities($_component->content ?? '');
    $_content .= '</p>

';
    return $_content;
   
}
