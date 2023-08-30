<?php

use Components\Views\Dashboard\DashboardPage;
use Components\Views\Patients\PatientsPage;
use Components\Views\Contact\ContactPage;
use Components\Views\NotFound\NotFoundPage;
use Viewi\Routing\Route as ViewiRoute;

ViewiRoute::get('/', DashboardPage::class);
ViewiRoute::get('/patients', PatientsPage::class);
ViewiRoute::get('/contact', ContactPage::class);
ViewiRoute::get('*', NotFoundPage::class);
