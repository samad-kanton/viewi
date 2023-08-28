<?php

use Components\Views\Home\HomePage;
use Components\Views\About\AboutPage;
use Components\Views\Contact\ContactPage;
use Components\Views\NotFound\NotFoundPage;
use Viewi\Routing\Route as ViewiRoute;

ViewiRoute::get('/', HomePage::class);
ViewiRoute::get('/about', AboutPage::class);
ViewiRoute::get('/contact', ContactPage::class);
ViewiRoute::get('*', NotFoundPage::class);
