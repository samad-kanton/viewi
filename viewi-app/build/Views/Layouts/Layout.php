<?php

use Viewi\PageEngine;
use Viewi\BaseComponent;

function RenderLayout(
    Components\Views\Layouts\Layout $_component,
    PageEngine $pageEngine,
    array $slots
    , ...$scope
) {
    $slotContents = [];
    
    $_content = '';

    $_content .= '<!DOCTYPE html>
<html lang="en">

<head>
    <title>
        ';
    $_content .= htmlentities($_component->title ?? '');
    $_content .= ' | Viewi
    </title>
    <meta charset="utf-8"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <!-- <CssBundle link="./css/main.css" /> -->
    ';
    $slotContents[0] = false;
    $pageEngine->putInQueue($_content);
    $pageEngine->renderComponent('CssBundle', [], $_component, $slotContents, [
'links' => (['/css/main.css']),
], ...$scope);
    $slotContents = [];
    $_content = "";
    $_content .= '

</head>

<body>
    <div id="sidebar">
        ';
    $slotContents[0] = false;
    $pageEngine->putInQueue($_content);
    $pageEngine->renderComponent('MenuBar', [], $_component, $slotContents, [], ...$scope);
    $slotContents = [];
    $_content = "";
    $_content .= '
    </div>
    <div id="content">
        ';
    $pageEngine->putInQueue($_content);
    $pageEngine->renderComponent($slots[0], [], $_component, $slotContents, [], ...$scope); 
    $_content = "";
    $_content .= '
    </div>
    ';
    $slotContents[0] = false;
    $pageEngine->putInQueue($_content);
    $pageEngine->renderComponent('ViewiScripts', [], $_component, $slotContents, [], ...$scope);
    $slotContents = [];
    $_content = "";
    $_content .= '
</body>

</html>';
    return $_content;
   
}
