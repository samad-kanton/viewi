<?php

use Viewi\PageEngine;
use Viewi\BaseComponent;

function RenderSignInPage_Slot(
    Components\Views\Auth\SignIn\SignInPage $_component,
    PageEngine $pageEngine,
    array $slots
    , ...$scope
) {
    $slotContents = [];
    
    $_content = '';

    $_content .= '
    <div class="h-screen bg-gray-50 dark:bg-gray-900 dark:text-white grid items-end">
        <div class=" w-full sm:w-[80vw] md:w-[90vw] xl:w-[900px] gap-y-12 grid md:grid-cols-[.8fr_1fr] sm:shadow-md mx-auto">
            <div class="md:dark:bg-slate-800 m-auto w-full pt-5 md:p-8 pl-5 h-full flex md:flex-col justify-between">
                <a href="/" class="flex gap-2 items-center">                        
                    <img src="/viewi-app/assets/icons/favicon.ico" class="mr-2 h-8" alt="MyshopOS Logo"/> 
                    <span>MyshopOS</span>
                </a>
                <img src="/viewi-app/assets/images/loginKeys.png" class="w-[100px] md:w-xl md:m-auto sm:h-sm md:mx-auto" alt="MyshopOS Logo"/>
            </div>
            <div class="mx-auto md:mx-0 w-full sm:max-w-xl p-4 bg-white border border-gray-200 rounded-lg sm:p-6 md:p-8 dark:bg-gray-800 dark:border-gray-700">
                <form class="space-y-6" autocomplete="off">
                    <h5 class="text-xl font-medium text-gray-900 dark:text-white">Sign in to access MyshopOS</h5>
                    <div>
                        <label for="email" class="block mb-2 text-sm font-medium">Your email - ';
    $_content .= htmlentities($_component->validEmail ?? '');
    $_content .= '</label>
                        <input type="email" name="email" id="email" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-4 md:p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" placeholder="name@company.com" required/>
                    </div>
                    <div>
                        <label for="password" class="block mb-2 text-sm font-medium ">Your password</label>
                        <input type="password" name="password" id="password" class="md:text-sm rounded-lg block w-full p-4 md:p-2.5" placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;" required/>
                    </div>
                    <div class="flex items-start">
                        <div class="flex items-start">
                            <div class="flex items-center h-5">
                                <input id="remember" type="checkbox" value class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800"/>
                            </div>
                            <label for="remember" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Remember me</label>
                        </div>
                        <a href="/forgot-password" class="ml-auto text-sm text-blue-700 hover:underline dark:text-blue-500">Lost Password?</a>
                    </div>
                    <button type="submit" class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg sm:text-sm px-5 py-4 sm:py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Login to your account</button>
                    <div class="text-sm font-medium text-gray-500 dark:text-gray-300">
                        Don\'t have a MyshopOS account? <a href="/signup" class="text-blue-700 hover:underline dark:text-blue-500">Create account</a>
                    </div>
                </form>
            </div>
        </div>
        <p class="mx-auto py-5 text-sm text-gray-500">&copy;';
    $_content .= htmlentities(date('Y') ?? '');
    $_content .= ' MyshopOS. All Rights Reserved</p>
    </div>
';
    return $_content;
   
}
