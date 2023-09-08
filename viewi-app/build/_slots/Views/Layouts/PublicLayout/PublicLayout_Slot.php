<?php

use Viewi\PageEngine;
use Viewi\BaseComponent;

function RenderPublicLayout_Slot(
    Components\Views\PublicLayout\PublicLayout $_component,
    PageEngine $pageEngine,
    array $slots
    , ...$scope
) {
    $slotContents = [];
    
    $_content = '';

    $_content .= '
    <div id="layout-main" class="space-y-16">
        ';
    $slotContents[0] = false;
    $pageEngine->putInQueue($_content);
    $pageEngine->renderComponent('NavBar', [], $_component, $slotContents, [], ...$scope);
    $slotContents = [];
    $_content = "";
    $_content .= '
        <main class="mt-12 sm:mt-15 dark:bg-slate-700">
            ';
    $pageEngine->putInQueue($_content);
    $pageEngine->renderComponent($slots[0], [], $_component, $slotContents, [], ...$scope); 
    $_content = "";
    $_content .= '
        </main>           
        ';
    $slotContents[0] = false;
    $pageEngine->putInQueue($_content);
    $pageEngine->renderComponent('Footer', [], $_component, $slotContents, [], ...$scope);
    $slotContents = [];
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

    <script src="//code.tidio.co/rwlyw0a6tajrsjt8h9tp85it0kpxd1nk.js" async></script>
';
    return $_content;
   
}
