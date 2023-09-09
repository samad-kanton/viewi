<?php

use Viewi\PageEngine;
use Viewi\BaseComponent;

function RenderFeaturesPage_Slot(
    Components\Views\Features\FeaturesPage $_component,
    PageEngine $pageEngine,
    array $slots
    , ...$scope
) {
    $slotContents = [];
    
    $_content = '';

    $_content .= '
    <div class="p-4">
        <div class="max-w-screen-xl mx-auto py-8">
            <h1 class="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">Features</h1>
            <div class="py-8 grid grid-cols-1 gap-14 md:gap-20 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:grid-cols-4">
                ';
    foreach(json_decode(json_encode($_component->features->features)) as $i => $feature){
    
    $_content .= '<a';
    $attrValue = $feature->link;
    if ($attrValue !== null) {
        $_content .= ' href="' . htmlentities($attrValue) . '"';
    }
    $_content .= ' class="flex md:flex-col gap-4 sm:gap-x-2 hover:scale-[110%] duration-500">
                    <i class="lni lni-';
    $temp = $feature->icon;
    if ($temp !== null) {
        $_content .= htmlentities($temp);
    }
    $_content .= ' text-[6em] text-gradient-to-r from-cyan-500 to-blue-500 hover:text-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800" style="color: hsla(245, 100%, 76%, 1);"></i>
                    <div class="space-y-4 md:space-y-5">
                        <h2 class="text-slate-500 font-semibold text-xl">';
    $_content .= htmlentities($feature->title ?? '');
    $_content .= '</h2>
                        <p class="sm:text-sm text-slate-900">';
    $_content .= htmlentities($feature->text ?? '');
    $_content .= '</p>
                        <a class="text-sm text-blue-500 flex items-center gap-x-2">View more <i class="lni lni-angle-double-right"></i></a>
                    </div>
                </a>';
    }
    
    $_content .= '
            </div>
        </div>
    </div>  
';
    return $_content;
   
}
