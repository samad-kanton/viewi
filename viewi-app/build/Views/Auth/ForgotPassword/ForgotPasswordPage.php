<?php

use Viewi\PageEngine;
use Viewi\BaseComponent;

function RenderForgotPasswordPage(
    Components\Views\Auth\ForgotPassword\ForgotPasswordPage $_component,
    PageEngine $pageEngine,
    array $slots
    , ...$scope
) {
    $slotContents = [];
    
    $_content = '';

    $slotContents[0] = 'ForgotPasswordPage_Slot';
    $pageEngine->putInQueue($_content);
    $pageEngine->renderComponent('BaseLayout', [], $_component, $slotContents, [
'title' => $_component->title,
], ...$scope);
    $slotContents = [];
    $_content = "";
    return $_content;
   
}
