<?php

use Viewi\PageEngine;
use Viewi\BaseComponent;

function RenderFooter(
    Components\Views\Common\Footer $_component,
    PageEngine $pageEngine,
    array $slots
    , ...$scope
) {
    $slotContents = [];
    
    $_content = '';

    $slotContents[0] = false;
    $pageEngine->putInQueue($_content);
    $pageEngine->renderComponent('MobileApp', [], $_component, $slotContents, [], ...$scope);
    $slotContents = [];
    $_content = "";
    $_content .= '

<footer class="bg-gray-50 dark:bg-gray-900">
    <div class="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">
        <div class="md:grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] md:justify-between gap-20">
            <div class="mb-6 md:mb-0 space-y-5">
                <a href="/" class="flex items-center">
                    <img src="/viewi-app/assets/icons/favicon.ico" class="h-8 mr-3" alt="MyshopOS Logo"/>
                    <span class="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">MyshopOS</span>
                </a>
                <div class="grid relative">                    
                    <div class="flex grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2">
                        <div>
                            <img class="h-[200px] max-w-full rounded-lg" src="https://flowbite.s3.amazonaws.com/docs/gallery/square/image-1.jpg" alt/>
                        </div>
                        <div>
                            <img class="h-[200px] max-w-full rounded-lg" src="https://flowbite.s3.amazonaws.com/docs/gallery/square/image-2.jpg" alt/>
                        </div>
                        <div>
                            <img class="h-[200px] max-w-full rounded-lg" src="https://flowbite.s3.amazonaws.com/docs/gallery/square/image-3.jpg" alt/>
                        </div>
                        <div>
                            <img class="h-[200px] max-w-full rounded-lg" src="https://flowbite.s3.amazonaws.com/docs/gallery/square/image-4.jpg" alt/>
                        </div>
                    </div>
                </div>
            </div>
            <div class="grid grid-cols-[auto_auto] gap-8 md:gap-10 sm:grid-cols-[auto_auto_auto_auto] justify-between">
                <div>
                    <h2 class="mb-6 text-sm font-extrabold text-gray-900 uppercase dark:text-white">Features</h2>
                    <ul class="sm:text-sm text-gray-500 dark:text-gray-400 font-medium space-y-4">
                        <li><a href="https://help.myshopos.com/invoicing" class="hover:underline">Invoicing</a></li>
                        <li><a href="https://help.myshopos.com/expenses" class="hover:underline">Expenses</a></li>
                        <li><a href="https://help.myshopos.com/inventory" class="hover:underline">Inventory</a></li>
                        <li><a href="https://help.myshopos.com/po" class="hover:underline">Purchase Orders</a></li>
                        <li><a href="https://help.myshopos.com/mr" class="hover:underline">Stock Movement</a></li>
                        <li><a href="https://help.myshopos.com/expenses" class="hover:underline">Bills</a></li>
                        <li><a href="https://help.myshopos.com/estimates" class="hover:underline">Estimates</a></li>
                        <li><a href="https://help.myshopos.com/sales" class="hover:underline">Sales Orders</a></li>
                        <li><a href="https://help.myshopos.com/sales" class="hover:underline">Credit Notes</a></li>
                        <li><a href="https://help.myshopos.com/reporing" class="hover:underline">Reporting</a></li>
                    </ul>
                </div>
                <div>
                    <h2 class="mb-6 text-sm font-extrabold text-gray-900 uppercase dark:text-white">Solutions</h2>
                    <ul class="sm:text-sm text-gray-500 dark:text-gray-400 font-medium space-y-4">
                        <li><a href="https://myshopos.com" class="hover:underline">MyshopOS</a></li>
                        <li><a href="https://yorwor.com" class="hover:underline">Yorwor</a></li>
                        <li><a href="https://hiregaps.com" class="hover:underline">HireGaps</a></li>
                        <li><a href="https://crm.myshop.com" class="hover:underline">CRM</a></li>
                        <li><a href="https://tailwindcss.com" class="hover:underline">Desktop App</a></li>
                    </ul>
                </div>
                <div>
                    <h2 class="mb-6 text-sm font-extrabold text-gray-900 uppercase dark:text-white">Resources</h2>
                    <ul class="sm:text-sm text-gray-500 dark:text-gray-400 font-medium space-y-4">
                        <li><a href="https://flowbite.com/" class="hover:underline">Help Docs</a></li>
                        <li><a href="https://tailwindcss.com/" class="hover:underline">FAQS</a></li>
                        <li><a href="https://tailwindcss.com/" class="hover:underline">Forums</a></li>
                        <li><a href="https://tailwindcss.com/" class="hover:underline">What\'s New</a></li>
                        <li><a href="https://tailwindcss.com/" class="hover:underline">Release Notes</a></li>
                    </ul>
                </div>
                <div>
                    <h2 class="mb-6 text-sm font-extrabold text-gray-900 uppercase dark:text-white">Legal</h2>
                    <ul class="sm:text-sm text-gray-500 dark:text-gray-400 font-medium space-y-4">
                        <li>
                            <a href="#" class="hover:underline">Privacy Policy</a>
                        </li>
                        <li>
                            <a href="#" class="hover:underline">Terms &amp; Conditions</a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <hr class="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8"/>
        <div class="text-center sm:text-left sm:flex sm:items-center sm:justify-between">
            <span class="text-sm text-gray-500 sm:text-center dark:text-gray-400">© ';
    $_content .= htmlentities(date('Y') ?? '');
    $_content .= ' <a href="/" class="hover:underline">MyshopOS</a>. All Rights Reserved.</span>
            <div class="flex justify-center mt-4 space-x-5 sm:justify-center sm:mt-0">
                <a href="https://web.facebook.com/people/Myshop-OS/100064781571456/" class="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:scale-150 duration-300">
                    <i class="lni lni-facebook text-blue-500 text-xl"></i>
                    <span class="sr-only">Facebook page</span>
                </a>
                <a href="https://discord.gg/fx3RPw8A" class="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:scale-150 duration-300">
                    <i class="lni lni-discord-alt text-xl"></i>
                    <span class="sr-only">Discord community</span>
                </a>
                <a href="twitter.com/MyshopOs" class="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:scale-150 duration-300">
                    <i class="lni lni-twitter text-blue-900 text-xl"></i>
                    <span class="sr-only">Twitter page</span>
                </a>
                <a href="instagram.com/my_shopos" class="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:scale-150 duration-300">
                    <i class="lni lni-instagram text-purple-500 text-xl"></i>
                    <span class="sr-only">Instagram Page</span>
                </a>
                <a href="https://www.youtube.com/myshopos" class="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:scale-150 duration-300">
                    <i class="lni lni-youtube text-red-500 text-xl"></i>
                    <span class="sr-only">Youtube</span>
                </a>
            </div>
        </div>
    </div>
</footer>
';
    return $_content;
   
}
