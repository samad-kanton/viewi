<?php

use Viewi\PageEngine;
use Viewi\BaseComponent;

function RenderMenuBar(
    Components\Views\Common\MenuBar $_component,
    PageEngine $pageEngine,
    array $slots
    , ...$scope
) {
    $slotContents = [];
    
    $_content = '';

    $_content .= '<div class="menu-bar">
    <div class="mui--text-white mui--text-display1 mui--align-vertical">
        KOG Eye
    </div>
    <div class>
        <ul class="mui-list--unstyled mui--text-menu" style="padding: 10px 8px; line-height: 32px; font-size: 16px;">
            <li>
                <a href="/" class="mui--text-light">Home</a>
            </li>
            <li>
                <a href="/about" class="mui--text-light">About</a>
            </li>
            <li>
                <a href="/contact" class="mui--text-light">Contact</a>
            </li>
        </ul>
    </div>
</div>';
    return $_content;
   
}
