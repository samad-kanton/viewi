<?php

namespace Components\Services;

class InputState {
    public $states = [
        'n' => 2,
        'label' => [
            'default' => 'text-gray-900 dark:text-white',
            'error' => 'text-red-700 dark:text-red-500',
            'success' => 'text-green-700 dark:text-green-500',
        ],
        'input' => [
            'default' => 'bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white',
            'error' => 'bg-red-50 border-red-500 text-red-900 placeholder-red-700 focus:ring-red-500 focus:border-red-500 dark:bg-red-100 dark:border-red-400',
            'success' => 'bg-green-50 border-green-500 text-green-900 placeholder-green-700 focus:ring-green-500 focus:border-green-500 dark:bg-green-100 dark:border-green-400',
        ],
    ];
}