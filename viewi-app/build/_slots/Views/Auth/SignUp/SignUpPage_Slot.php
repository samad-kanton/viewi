<?php

use Viewi\PageEngine;
use Viewi\BaseComponent;

function RenderSignUpPage_Slot(
    Components\Views\Auth\SignUp\SignUpPage $_component,
    PageEngine $pageEngine,
    array $slots
    , ...$scope
) {
    $slotContents = [];
    
    $_content = '';

    $_content .= '
    Data: ';
    $_content .= htmlentities(count($_component->staticData) ?? '');
    $_content .= '
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-white grid items-center">
        <div class="grid grid-cols-1 sm:grid-cols-[.7fr_1fr]">
            <div class="hidden sm:grid justify-center items-center">
                <img src="/viewi-app/assets/images/welcome.png" class="w-[200px] h-[200px]" alt="MyshopOS Logo"/>
            </div>
            <div class="min-h-screen flex flex-col p-4 bg-white border border-gray-200 rounded-lg sm:p-6 md:p-8 dark:bg-gray-800 dark:border-gray-700">
                <div class="max-w-xl mx-auto space-y-12">
                    <div class>
                        <p class="flex gap-2 items-center">
                            <a href="/">
                                <img src="/viewi-app/assets/icons/favicon.ico" class="mr-3" alt="MyshopOS Logo"/>  
                            </a>
                            <div class="grid gap-y-3">
                                <a href="/" class="text-lg font-extrabold">MyshopOS</a>
                                <p>
                                    <span>Already have an account</span>
                                    <a href="/signin" class="text-blue-700 hover:underline dark:text-blue-500 text-xl">Signin</a>
                                </p>
                            </div>
                        </p>                    
                    </div>
                    <form class="space-y-6">
                        <h5 class="text-xl font-medium text-gray-900 dark:text-white">Create a free account and experience full-featured premium plan for 14 days.</h5>
                        <div>
                            <label for="company_name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Company Name</label>
                            <input type="text" name="company_name" id="company_name" class="bg-gray-50 border border-gray-300 text-gray-900 text-md sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-4 md:p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" placeholder="your business name" required/>
                        </div>
                        <div>
                            <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>
                            <input type="email" name="email" id="email" class="bg-gray-50 border border-gray-300 text-gray-900 text-md sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-4 md:p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" placeholder="name@company.com" required/>
                        </div>
                        <div>
                            <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your password</label>
                            <input type="password" name="password" id="password" placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;" class="bg-gray-50 border border-gray-300 text-gray-900 text-md sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-4 md:p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" required/>
                        </div>
                        <div>
                            <label for="country" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Company Location</label>
                            <select id="country" class="bg-gray-50 border border-gray-300 text-gray-900 mb-6 text-md sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-4 md:p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required>
                                <option selected>Choose a country</option>
                              
                            </select>
                            <p class="mx-auto -mt-5">Your data will be stored in US Data Center</p>
                        </div>
                        <div class="flex gap-2 items-center">
                            <input id="remember" type="checkbox" value class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800" required/>
                            <div class="text-sm">
                                I agree to the <a href="/terms-of-service" class="ml-auto text-sm text-blue-700 hover:underline dark:text-blue-500">Terms of service</a> and  <a href="/privacy-policy" class="ml-auto text-sm text-blue-700 hover:underline dark:text-blue-500">Privacy Policy</a>
                            </div>                        
                        </div>
                        <button type="submit" class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg sm:text-sm px-5 py-4 sm:py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Create your account</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
';
    return $_content;
   
}
