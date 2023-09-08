<?php

namespace Components\Views\PublicLayout;

use Viewi\BaseComponent;
use Viewi\Common\ClientRouter;

class PublicLayout extends BaseComponent
{
    public string $title = '';

    // function __construct(ClientRouter $clientRouter)
    // {
    //     $this->clientRouter = $clientRouter;
    // }

    // function __mounted() {
    //     $currentUrl = $this->clientRouter->getUrl();
    //     // $isActive = $myurl === $currentUrl;
    // }
}
