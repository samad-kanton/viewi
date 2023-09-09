<?php

use Viewi\PageEngine;
use Viewi\BaseComponent;

function RenderHardwarePage_Slot(
    Components\Views\Hardware\HardwarePage $_component,
    PageEngine $pageEngine,
    array $slots
    , ...$scope
) {
    $slotContents = [];
    
    $_content = '';

    $_content .= '    
    <section class="bg-center bg-no-repeat bg-cover bg-[url(&#039;/viewi-app/assets/clientele/madina_supermarket.jpeg&#039;)] bg-gray-700 bg-blend-multiply">
        <div class="px-4 mx-auto max-w-screen-xl text-center py-24 lg:py-56">
            <h1 class="mb-4 text-[10vw] font-extrabold tracking-tight leading-none text-white sm:text-5xl md:text-6xl lg:text-6xl max-w-xl lg:max-w-full mx-auto">Hardware that makes selling easy</h1>
            <p class="mb-8 text-lg font-normal text-gray-300 lg:text-xl sm:px-16 lg:px-48 max-w-2xl lg:max-w-full mx-auto">Run your point of sale with hardware that suits your business needs and unlock long-term value that drive economic growth.</p>
            <div class="flex justify-center space-x-4">
                <a href="#" class="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-lg bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900">
                    Get started
                    <svg class="w-3.5 h-3.5 ml-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"></path>
                    </svg>
                </a>
                <a href="#" class="inline-flex justify-center hover:text-gray-900 items-center py-3 px-5 text-base font-medium text-center text-white rounded-lg border border-white hover:bg-gray-100 focus:ring-4 focus:ring-gray-400">
                    Learn more
                </a>  
            </div>
        </div>
    </section>
    <div class="px-4">
        <div class="max-w-screen-xl mx-auto">
            ';
    $_content .= htmlentities($_component->activeIndex ?? '');
    $_content .= '
            <div class="flex items-center justify-center py-4 md:py-8 flex-wrap">
                <button type="button" class="text-blue-700 hover:text-white border ';
    $temp = $_component->active;
    if ($temp !== null) {
        $_content .= htmlentities($temp);
    }
    $_content .= ' rounded-full text-base font-medium px-5 py-2.5 text-center mr-3 mb-3">All categories - ';
    $_content .= htmlentities($_component->active ?? '');
    $_content .= '</button>
                <button type="button" class="text-gray-900 border rounded-full ';
    $temp = $_component->active;
    if ($temp !== null) {
        $_content .= htmlentities($temp);
    }
    $_content .= ' text-base font-medium px-5 py-2.5 text-center mr-3 mb-3">Computers - ';
    $_content .= htmlentities($_component->active ?? '');
    $_content .= '</button>
                <button type="button" class="text-gray-900 border rounded-full ';
    $temp = $_component->active;
    if ($temp !== null) {
        $_content .= htmlentities($temp);
    }
    $_content .= ' text-base font-medium px-5 py-2.5 text-center mr-3 mb-3">Printers - ';
    $_content .= htmlentities($_component->active ?? '');
    $_content .= '</button>
                <button type="button" class="text-gray-900 border rounded-full ';
    $temp = $_component->active;
    if ($temp !== null) {
        $_content .= htmlentities($temp);
    }
    $_content .= ' text-base font-medium px-5 py-2.5 text-center mr-3 mb-3">Scanners - ';
    $_content .= htmlentities($_component->active ?? '');
    $_content .= '</button>
                <button type="button" class="text-gray-900 border rounded-full ';
    $temp = $_component->active;
    if ($temp !== null) {
        $_content .= htmlentities($temp);
    }
    $_content .= ' text-base font-medium px-5 py-2.5 text-center mr-3 mb-3">Cash Drawers - ';
    $_content .= htmlentities($_component->active ?? '');
    $_content .= '</button>
                <button type="button" class="text-gray-900 border rounded-full ';
    $temp = $_component->active;
    if ($temp !== null) {
        $_content .= htmlentities($temp);
    }
    $_content .= ' text-base font-medium px-5 py-2.5 text-center mr-3 mb-3">Paper Rolls - ';
    $_content .= htmlentities($_component->active ?? '');
    $_content .= '</button>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                    <img class="h-auto max-w-full rounded-lg" src="https://flowbite.s3.amazonaws.com/docs/gallery/square/image.jpg" alt/>
                </div>
                <div>
                    <img class="h-auto max-w-full rounded-lg" src="https://flowbite.s3.amazonaws.com/docs/gallery/square/image-1.jpg" alt/>
                </div>
                <div>
                    <img class="h-auto max-w-full rounded-lg" src="https://flowbite.s3.amazonaws.com/docs/gallery/square/image-2.jpg" alt/>
                </div>
                <div>
                    <img class="h-auto max-w-full rounded-lg" src="https://flowbite.s3.amazonaws.com/docs/gallery/square/image-3.jpg" alt/>
                </div>
                <div>
                    <img class="h-auto max-w-full rounded-lg" src="https://flowbite.s3.amazonaws.com/docs/gallery/square/image-4.jpg" alt/>
                </div>
                <div>
                    <img class="h-auto max-w-full rounded-lg" src="https://flowbite.s3.amazonaws.com/docs/gallery/square/image-5.jpg" alt/>
                </div>
                <div>
                    <img class="h-auto max-w-full rounded-lg" src="https://flowbite.s3.amazonaws.com/docs/gallery/square/image-6.jpg" alt/>
                </div>
                <div>
                    <img class="h-auto max-w-full rounded-lg" src="https://flowbite.s3.amazonaws.com/docs/gallery/square/image-7.jpg" alt/>
                </div>
                <div>
                    <img class="h-auto max-w-full rounded-lg" src="https://flowbite.s3.amazonaws.com/docs/gallery/square/image-8.jpg" alt/>
                </div>
                <div>
                    <img class="h-auto max-w-full rounded-lg" src="https://flowbite.s3.amazonaws.com/docs/gallery/square/image-9.jpg" alt/>
                </div>
                <div>
                    <img class="h-auto max-w-full rounded-lg" src="https://flowbite.s3.amazonaws.com/docs/gallery/square/image-10.jpg" alt/>
                </div>
                <div>
                    <img class="h-auto max-w-full rounded-lg" src="https://flowbite.s3.amazonaws.com/docs/gallery/square/image-11.jpg" alt/>
                </div>
            </div>

        </div>
    </div>  
';
    return $_content;
   
}
