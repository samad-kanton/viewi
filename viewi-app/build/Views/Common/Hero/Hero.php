<?php

use Viewi\PageEngine;
use Viewi\BaseComponent;

function RenderHero(
    Components\Views\Common\Hero $_component,
    PageEngine $pageEngine,
    array $slots
    , ...$scope
) {
    $slotContents = [];
    
    $_content = '';

    $_content .= '<div class="bg-[#f7f5ff] dark:bg-gray-900">
  <div class="md:h-auto grid gap-y-10 items-center md:grid-cols-[1fr_.8fr] lg:grid-cols-[1fr_.8fr] max-w-screen-xl mx-auto py-8 sm:py-8 md:py-24">
    <div class="sm:text-left grid items-center px-4">
      <div class="mx-auto md:mx-0 max-w-xl text-center md:text-left">
        <a href="#" class="inline-flex justify-between items-center py-1 px-1 pr-4 mb-7 text-sm text-gray-700 bg-[#f5f7ff] rounded-full dark:bg-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700" role="alert">
          <span class="text-xs bg-primary-600 rounded-full text-white px-4 py-1.5 mr-3">New</span> <span class="text-sm font-medium">Myshop Operating Solution</span> 
          <i class="lni lni-chevron-right ml-2"></i>
        </a>
        <h1 class="max-w-2xl mb-4 text-[8vw] font-extrabold tracking-tight leading-none sm:text-[3.2rem] md:text-[4.8vw] lg:text-[3.2rem] xl:text-[3.4rem] dark:text-white">Smart Billing Software <br/>for businesses.</h1>
        <p class="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-md lg:text-md dark:text-gray-400">From checkout to global sales tax compliance, companies around the world use MyshopOS to manage merchandise and simplify their billing needs.</p>
        <div class="flex flex- sm:flex-row gap-5 justify-center md:justify-start">
          <a href="/signup" class="inline-flex items-center justify-center px-5 py-3 mr-3 text-base font-medium text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-900">
            Free 14-day Demo <i class="lni lni-arrow-right ml-2 -mr-1"></i>
          </a>
          <a href="/contact" class="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-800">Speak to Sales</a> 
        </div>
      </div>
    </div>
    <div>
      <img src="/viewi-app/assets/screenshots/all-devices-white.png" alt="mockup" class="h-[230px] sm:h-[20vh] sm:h-[30vh] mx-auto md:mx-0"/>
    </div>
  </div>
</div>';
    return $_content;
   
}
