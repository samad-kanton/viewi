<?php

use Components\Views\Auth\SignIn\SignInPage;
use Components\Views\Auth\SignUp\SignUpPage;
use Components\Views\Auth\ForgotPassword\ForgotPasswordPage;
use Components\Views\Home\HomePage;
use Components\Views\Features\FeaturesPage;
use Components\Views\Pricing\PricingPage;
use Components\Views\Services\ServicesPage;
use Components\Views\Hardware\HardwarePage;
use Components\Views\Contact\ContactPage;
use Components\Views\NotFound\NotFoundPage;
use Viewi\Routing\Route as ViewiRoute;

ViewiRoute::get('/signin', SignInPage::class);
ViewiRoute::get('/signup', SignUpPage::class);
ViewiRoute::get('/forgot-password', ForgotPasswordPage::class);
ViewiRoute::get('/', HomePage::class);
ViewiRoute::get('/features', FeaturesPage::class);
ViewiRoute::get('/pricing', PricingPage::class);
ViewiRoute::get('/services', ServicesPage::class);
ViewiRoute::get('/hardware', HardwarePage::class);
ViewiRoute::get('/contact', ContactPage::class);
ViewiRoute::get('*', NotFoundPage::class);
