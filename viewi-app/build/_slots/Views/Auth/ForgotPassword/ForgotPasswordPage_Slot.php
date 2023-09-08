<?php

use Viewi\PageEngine;
use Viewi\BaseComponent;

function RenderForgotPasswordPage_Slot(
    Components\Views\Auth\ForgotPassword\ForgotPasswordPage $_component,
    PageEngine $pageEngine,
    array $slots
    , ...$scope
) {
    $slotContents = [];
    
    $_content = '';

    $_content .= '
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-white grid items-center">
        <section>
            <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                <a href="#" class="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
                    <img src="/viewi-app/assets/icons/favicon.ico" class="w-8 h-8 mr-2 h-8" alt="MyshopOS Logo"/> 
                    MyshopOS    
                </a>
                <div class="w-full p-6 bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md dark:bg-gray-800 dark:border-gray-700 sm:p-8">
                    <h1 class="mb-1 text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                        Forgot your password?
                    </h1>
                    <p class="font-light text-gray-500 dark:text-gray-400">Don\'t fret! Just type in your email and we will send you a code to reset your password!</p>
                    <form class="mt-4 space-y-4 lg:mt-5 md:space-y-5" action="#">
                        <div>
                            <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>
                            <input type="email" name="email" id="email" class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="name@company.com" required/>
                        </div>
                        <div class="flex items-start">
                            <div class="flex items-center h-5">
                              <input id="terms" aria-describedby="terms" type="checkbox" class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800" required/>
                            </div>
                            <div class="ml-3 text-sm">
                              <label for="terms" class="font-light text-gray-500 dark:text-gray-300">I accept the <a class="font-medium text-primary-600 hover:underline dark:text-primary-500" href="#">Terms and Conditions</a></label>
                            </div>
                        </div>
                        <button type="submit" class="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg sm:text-sm px-5 py-4 sm:py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Reset password</button>
                        <div class="inline-flex items-center justify-center w-full">
                            <hr class="w-64 h-px my-8 bg-gray-200 border-0 dark:bg-gray-700"/>
                            <span class="absolute px-3 font-medium text-gray-900 -translate-x-1/2 bg-white left-1/2 dark:text-white dark:bg-gray-900">or</span>
                        </div>
                        <div class="text-center">
                            <a href="/signin" class="text-blue-500">Return to login </a>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    </div>
';
    return $_content;
   
}
