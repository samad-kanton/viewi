<?php

require __DIR__ . '/vendor/autoload.php';

// app()->get('/route', function () {
//     echo 'This is a leaf route';
// });

// app()->run();

// include backend
include __DIR__ . '/viewi-app/backend/endpoints.php';

// Viewi application here
include __DIR__ . '/viewi-app/viewi.php';

Viewi\App::handle();