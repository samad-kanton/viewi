<?php

use Viewi\PageEngine;
use Viewi\BaseComponent;

function RenderContactPage_Slot(
    Components\Views\Contact\ContactPage $_component,
    PageEngine $pageEngine,
    array $slots
    , ...$scope
) {
    $slotContents = [];
    
    $_content = '';

    $_content .= '
    <div class="p-4">
        <!-- <p>
            ';
    $_content .= htmlentities($_component->statusMessage ?? '');
    $_content .= '
        </p>
        <p>
            Data: ';
    $_content .= htmlentities($_component->data ?? '');
    $_content .= '
        </p> -->
        <div class="max-w-screen-xl mx-auto space-y-10">
            <h2 class="mt-5 mb-4 text-4xl tracking-tight font-extrabold text-center text-gray-900 dark:text-white">How can we help you?</h2>
            <form class="max-w-xl mx-auto">   
                <label for="default-search" class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <i class="lni lni-search-alt text-gray-500 dark:text-gray-400"></i>
                    </div>
                    <input type="search" id="default-search" class="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Type keywords to find answers" required/>
                    <button type="submit" class="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Search</button>
                </div>
            </form>
            <div class="grid sm:grid-cols-2 md:grid-cols-3 justify-center gap-5 lg:gap-10">
                <div class="block max-w-md min-w-[95vw] sm:min-w-full p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
                    <h2 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Billing & Plans</h2>
                    <ul class="max-w-md space-y-3 text-gray-500 list-none list-inside dark:text-gray-400">
                        <li><a href="/" class="text-blue-500 hover:underline">Flowbite plans & prices</a></li>
                        <li><a href="/" class="text-blue-500 hover:underline">Switch plans and add-ons</a></li>
                        <li><a href="/" class="text-blue-500 hover:underline">I can\'t login to MyshopOS</a></li>
                        <li><a href="/" class="text-blue-500 hover:underline">Discount on MyshopOS</a></li>
                    </ul>
                </div>
                <div class="block max-w-md min-w-[95vw] sm:min-w-full p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
                    <h2 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Using MyshopOS</h2>
                    <ul class="max-w-md space-y-3 text-gray-500 list-none list-inside dark:text-gray-400">
                        <li><a href="/" class="text-blue-500 hover:underline">Devices to run MyshopOS</a></li>
                        <li><a href="/" class="text-blue-500 hover:underline">Managing Inventory</a></li>
                        <li><a href="/" class="text-blue-500 hover:underline">Fix Network Issues</a></li>
                        <li><a href="/" class="text-blue-500 hover:underline">MyshopOS offline</a></li>
                    </ul>
                </div>
                <div class="block max-w-md min-w-[95vw] sm:min-w-full p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
                    <h2 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">What\'s on MyshopOS</h2>
                    <ul class="max-w-md space-y-3 text-gray-500 list-none list-inside dark:text-gray-400">
                        <li><a href="/" class="text-blue-500 hover:underline">New this month!</a></li>
                        <li><a href="/" class="text-blue-500 hover:underline">Multi-store Locations</a></li>
                        <li><a href="/" class="text-blue-500 hover:underline">Pricing per quantity</a></li>
                        <li><a href="/" class="text-blue-500 hover:underline">Hire store worker</a></li>
                    </ul>
                </div>
            </div>
            <div class="flex flex-col sm:flex-row gap-2 justify-between items-center">
                <div>
                    <h2 class="mb-2 text-2xl font-semibold text-gray-900 dark:text-white">Not what you were looking for?:</h2>
                    <p class="mb-2 text-gray-900 dark:text-white">Browse through all of our Help Center articles</p>
                </div>
                <a href="/contact" class="inline-flex items-center justify-center px-5 py-3 mr-3 text-base font-medium text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-900">Get Started</a> 
            </div>
            <div class="grid sm:grid-cols-2 gap-10 justify-center sm:justify-between py-8">
                <div>
                    <h2 class="mb-2 text-2xl font-semibold text-gray-900 dark:text-white">Points of contact</h2>
                    <dl class="max-w-md py-8 text-gray-900 divide-y divide-gray-200 dark:text-white dark:divide-gray-700">
                        <div class="flex flex-col pb-3">
                            <dt class="mb-1 text-gray-500 md:text-lg dark:text-gray-400">Information & Sales</dt>
                            <dd class="text-lg font-semibold">sales@myshopos.com</dd>
                        </div>
                        <div class="flex flex-col py-3">
                            <dt class="mb-1 text-gray-500 md:text-lg dark:text-gray-400">Support</dt>
                            <dd class="text-lg font-semibold">support@myshopos.com</dd>
                        </div>
                        <div class="flex flex-col py-3">
                            <dt class="mb-1 text-gray-500 md:text-lg dark:text-gray-400">Accra office</dt>
                            <dd class="text-lg font-semibold">Katamanso Road, Amrahia, Accra, Ghana</dd>
                        </div>
                        <div class="flex flex-col pt-3">
                            <dt class="mb-1 text-gray-500 md:text-lg dark:text-gray-400">Phone number</dt>
                            <dd class="text-lg font-semibold">+233 362 195 587 / +233 542 795 439</dd>
                        </div>
                    </dl>                    
                </div>
                <div class="grid">
                    <h2 class="mb-2 text-2xl font-semibold text-gray-900 dark:text-white">Still need help?:</h2>
                    <section class="bg-white dark:bg-gray-900">
                        <div class="py-8">
                            <!-- <h2 class="mb-4 text-4xl tracking-tight font-extrabold text-center text-gray-900 dark:text-white">Contact Us</h2>
                            <p class="mb-8 lg:mb-16 font-light text-center text-gray-500 dark:text-gray-400 sm:text-xl">Got a technical issue? Want to send feedback about a beta feature? Need details about our Business plan? Let us know.</p> -->
                            <form action="#" class="space-y-8">
                                <div>
                                    <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Your email</label>
                                    <input type="email" id="email" class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-4 md:p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 dark:shadow-sm-light" placeholder="name@flowbite.com" required/>
                                </div>
                                <div>
                                    <label for="subject" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Subject</label>
                                    <input type="text" id="subject" class="block p-3 w-full p-4 md:p-2.5 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 dark:shadow-sm-light" placeholder="Let us know how we can help you" required/>
                                </div>
                                <div class="sm:col-span-2">
                                    <label for="message" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400">Your message</label>
                                    <textarea id="message" rows="6" class="block p-3 w-full p-4 md:p-2.5 text-sm text-gray-900 bg-gray-50 rounded-lg shadow-sm border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Leave a comment..."></textarea>
                                </div>
                                <button type="submit" class="py-3 px-5 text-sm font-medium text-center text-white rounded-lg bg-primary-700 w-full sm:w-fit hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Send message</button>
                            </form>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    </div>
';
    return $_content;
   
}
