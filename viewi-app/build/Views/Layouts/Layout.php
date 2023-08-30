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
    $_content .= '
    </title>
    <meta charset="utf-8"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <link rel="shortcut icon" href="/viewi-app/assets/icons/favicon.ico" type="image/x-icon"/>
    ';
    $slotContents[0] = false;
    $pageEngine->putInQueue($_content);
    $pageEngine->renderComponent('CssBundle', [], $_component, $slotContents, [
'links' => (['/viewi-app/assets/lib/css/main.css']),
], ...$scope);
    $slotContents = [];
    $_content = "";
    $_content .= '
    <link rel="stylesheet" href="https://cdn.lineicons.com/4.0/lineicons.css"/>

    <!-- <script src="https://unpkg.com/ionicons@5.0.0/dist/ionicons.js"></script> -->
    <!-- <link href=\'https://unpkg.com/css.gg@2.0.0/icons/css/abstract.css\' rel=\'stylesheet\' /> -->
    <!-- <script src="/viewi-app/assets/lib/js/tailwindcss@3.3.3.js"></script> -->
    <script src="https://cdn.tailwindcss.com"></script>
</head>

<body>

    <div id="layout-main">
        ';
    $slotContents[0] = false;
    $pageEngine->putInQueue($_content);
    $pageEngine->renderComponent('NavBar', [], $_component, $slotContents, [], ...$scope);
    $slotContents = [];
    $_content = "";
    $_content .= '
        ';
    $slotContents[0] = false;
    $pageEngine->putInQueue($_content);
    $pageEngine->renderComponent('SideBar', [], $_component, $slotContents, [], ...$scope);
    $slotContents = [];
    $_content = "";
    $_content .= '
        
        <main class="mt-11 sm:mt-9 bg-red-500">
            ';
    $pageEngine->putInQueue($_content);
    $pageEngine->renderComponent($slots[0], [], $_component, $slotContents, [], ...$scope); 
    $_content = "";
    $_content .= '
        </main>        
    </div>
    
    ';
    $slotContents[0] = false;
    $pageEngine->putInQueue($_content);
    $pageEngine->renderComponent('ViewiScripts', [], $_component, $slotContents, [], ...$scope);
    $slotContents = [];
    $_content = "";
    $_content .= '

    <script src="/viewi-app/assets/lib/js/uikit@3.16.24.min.js"></script>
    <script src="/viewi-app/assets/lib/js/uikit-icons@3.16.24.min.js"></script>
    <script src="/viewi-app/assets/lib/js/flowbite@1.8.1.min.js"></script>
</body>

</html>';
    return $_content;
   
}
