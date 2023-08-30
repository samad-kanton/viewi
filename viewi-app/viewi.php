<?php

use Viewi\App;

$config = require 'config.php';
include __DIR__ . '/routes.php';
App::init($config);

// ensure to include autoload file
// require_once '../vendor/autoload.php';

// get the config for renderer    
// $config = require($configFile);

// get the public config
// $publicConfig = require($publicConfigFile);

// // include routes
// require __DIR__ . '/routes.php';

// // call init
// App::init($config, $publicConfig);

// call compile
App::getEngine()->compile();

