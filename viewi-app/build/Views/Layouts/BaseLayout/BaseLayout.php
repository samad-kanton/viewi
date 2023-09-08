<?php

use Viewi\PageEngine;
use Viewi\BaseComponent;

function RenderBaseLayout(
    Components\Views\BaseLayout\BaseLayout $_component,
    PageEngine $pageEngine,
    array $slots
    , ...$scope
) {
    $slotContents = [];
    
    $_content = '';

    $_content .= '<!DOCTYPE html>
<html lang="en" class>

<head>
    <title>
        ';
    $_content .= htmlentities($_component->title ?? '');
    $_content .= ' | Myshop OS
    </title>
    <meta charset="utf-8"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
    <meta name="viewport" content="width=device-width, initial-scale=.8, minimum-scale=.8, maximum-scale=1.0, user-scalable=no"/>
    <link rel="shortcut icon" href="/viewi-app/assets/icons/favicon.ico" type="image/x-icon"/>
    ';
    $slotContents[0] = false;
    $pageEngine->putInQueue($_content);
    $pageEngine->renderComponent('CssBundle', [], $_component, $slotContents, [
'links' => (['/viewi-app/assets/static/css/main.css']),
], ...$scope);
    $slotContents = [];
    $_content = "";
    $_content .= '
    <link rel="stylesheet" href="https://cdn.lineicons.com/4.0/lineicons.css"/>
    <script src="/viewi-app/assets/static/js/tailwindcss@3.3.3.js"></script>
</head>

<body style="font-family: &#039;Raleway&#039;;">

    ';
    $pageEngine->putInQueue($_content);
    $pageEngine->renderComponent($slots[0], [], $_component, $slotContents, [], ...$scope); 
    $_content = "";
    $_content .= '
    
    ';
    $slotContents[0] = false;
    $pageEngine->putInQueue($_content);
    $pageEngine->renderComponent('ViewiScripts', [], $_component, $slotContents, [], ...$scope);
    $slotContents = [];
    $_content = "";
    $_content .= '

    <script src="/viewi-app/assets/static/js/flowbite@1.8.1.min.js"></script>
    <script>
        tailwind.config = {
            darkMode: \'class\',
            theme: {
                extend: {
                    colors: {
                        primary: {"50":"#eff6ff","100":"#dbeafe","200":"#bfdbfe","300":"#93c5fd","400":"#60a5fa","500":"#3b82f6","600":"#2563eb","700":"#1d4ed8","800":"#1e40af","900":"#1e3a8a","950":"#172554"}
                    }
                },
                fontFamily: {
                    \'body\': [
                        \'Raleway\', 
                        \'Poppins\', 
                        \'Inter\', 
                        \'ui-sans-serif\', 
                        \'system-ui\', 
                        \'-apple-system\', 
                        \'system-ui\', 
                        \'Segoe UI\', 
                        \'Roboto\', 
                        \'Helvetica Neue\', 
                        \'Arial\', 
                        \'Noto Sans\', 
                        \'sans-serif\', 
                        \'Apple Color Emoji\', 
                        \'Segoe UI Emoji\', 
                        \'Segoe UI Symbol\', 
                        \'Noto Color Emoji\'
                    ],
                        \'sans\': [
                        \'Inter\', 
                        \'ui-sans-serif\', 
                        \'system-ui\', 
                        \'-apple-system\', 
                        \'system-ui\', 
                        \'Segoe UI\', 
                        \'Roboto\', 
                        \'Helvetica Neue\', 
                        \'Arial\', 
                        \'Noto Sans\', 
                        \'sans-serif\', 
                        \'Apple Color Emoji\', 
                        \'Segoe UI Emoji\', 
                        \'Segoe UI Symbol\', 
                        \'Noto Color Emoji\'
                    ]
                }
            }
        }
    </script>
</body>

</html>';
    return $_content;
   
}
