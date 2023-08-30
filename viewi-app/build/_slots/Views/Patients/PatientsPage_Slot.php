<?php

use Viewi\PageEngine;
use Viewi\BaseComponent;

function RenderPatientsPage_Slot(
    Components\Views\Patients\PatientsPage $_component,
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
    </div>
';
    return $_content;
   
}
