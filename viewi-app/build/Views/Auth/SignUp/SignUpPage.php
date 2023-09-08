<?php

use Viewi\PageEngine;
use Viewi\BaseComponent;

function RenderSignUpPage(
    Components\Views\Auth\SignUp\SignUpPage $_component,
    PageEngine $pageEngine,
    array $slots
    , ...$scope
) {
    $slotContents = [];
    
    $_content = '';

    $slotContents[0] = 'SignUpPage_Slot';
    $pageEngine->putInQueue($_content);
    $pageEngine->renderComponent('BaseLayout', [], $_component, $slotContents, [
'title' => $_component->title,
], ...$scope);
    $slotContents = [];
    $_content = "";
    $_content .= '
';
    return $_content;
   
}
