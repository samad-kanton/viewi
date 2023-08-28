<?php

use Viewi\PageEngine;

function ReadComponentsInfo(PageEngine $pageEngine)
{
    $pageEngine->setStartups(array (
));
$pageEngine->setComponentsInfo(array (
  'NotFoundPage' => 
  array (
    'Name' => 'NotFoundPage',
    'Namespace' => 'Components\\Views\\NotFound',
    'ComponentName' => 'NotFoundPage',
    'Tag' => 'NotFoundPage',
    'FullPath' => '\\Views\\NotFound\\NotFoundPage.php',
    'TemplatePath' => '\\Views\\NotFound\\NotFoundPage.html',
    'BuildPath' => '\\Views\\NotFound\\NotFoundPage.php',
    'RenderFunction' => 'RenderNotFoundPage',
    'IsComponent' => true,
    'HasInit' => false,
    'HasMounted' => false,
    'HasBeforeMount' => false,
    'HasVersions' => false,
    'Relative' => true,
    'Inputs' => 
    array (
      '__id' => true,
      '_props' => true,
      '_refs' => true,
      '_element' => true,
      '_slots' => true,
    ),
    'Instance' => NULL,
  ),
  'AboutPage' => 
  array (
    'Name' => 'AboutPage',
    'Namespace' => 'Components\\Views\\About',
    'ComponentName' => 'AboutPage',
    'Tag' => 'AboutPage',
    'FullPath' => '\\Views\\About\\AboutPage.php',
    'TemplatePath' => '\\Views\\About\\AboutPage.html',
    'BuildPath' => '\\Views\\About\\AboutPage.php',
    'RenderFunction' => 'RenderAboutPage',
    'IsComponent' => true,
    'HasInit' => false,
    'HasMounted' => false,
    'HasBeforeMount' => false,
    'HasVersions' => false,
    'Relative' => true,
    'Inputs' => 
    array (
      'title' => true,
      '__id' => true,
      '_props' => true,
      '_refs' => true,
      '_element' => true,
      '_slots' => true,
    ),
    'Instance' => NULL,
  ),
  'MenuBar' => 
  array (
    'Name' => 'MenuBar',
    'Namespace' => 'Components\\Views\\Common',
    'ComponentName' => 'MenuBar',
    'Tag' => 'MenuBar',
    'FullPath' => '\\Views\\Common\\MenuBar.php',
    'TemplatePath' => '\\Views\\Common\\MenuBar.html',
    'BuildPath' => '\\Views\\Common\\MenuBar.php',
    'RenderFunction' => 'RenderMenuBar',
    'IsComponent' => true,
    'HasInit' => false,
    'HasMounted' => false,
    'HasBeforeMount' => false,
    'HasVersions' => false,
    'Relative' => true,
    'Inputs' => 
    array (
      '__id' => true,
      '_props' => true,
      '_refs' => true,
      '_element' => true,
      '_slots' => true,
    ),
    'Instance' => NULL,
  ),
  'ContactPage' => 
  array (
    'Name' => 'ContactPage',
    'Namespace' => 'Components\\Views\\Contact',
    'ComponentName' => 'ContactPage',
    'Tag' => 'ContactPage',
    'FullPath' => '\\Views\\Contact\\ContactPage.php',
    'TemplatePath' => '\\Views\\Contact\\ContactPage.html',
    'BuildPath' => '\\Views\\Contact\\ContactPage.php',
    'RenderFunction' => 'RenderContactPage',
    'IsComponent' => true,
    'HasInit' => false,
    'HasMounted' => false,
    'HasBeforeMount' => false,
    'HasVersions' => false,
    'Relative' => true,
    'Inputs' => 
    array (
      'title' => true,
      '__id' => true,
      '_props' => true,
      '_refs' => true,
      '_element' => true,
      '_slots' => true,
    ),
    'Instance' => NULL,
  ),
  'DashboardPage' => 
  array (
    'Name' => 'DashboardPage',
    'Namespace' => 'Components\\Views\\Dashboard',
    'ComponentName' => 'DashboardPage',
    'Tag' => 'DashboardPage',
    'FullPath' => '\\Views\\Dashboard\\DashboardPage.php',
    'TemplatePath' => '\\Views\\Dashboard\\DashboardPage.html',
    'BuildPath' => '\\Views\\Dashboard\\DashboardPage.php',
    'RenderFunction' => 'RenderDashboardPage',
    'IsComponent' => true,
    'HasInit' => false,
    'HasMounted' => false,
    'HasBeforeMount' => false,
    'HasVersions' => false,
    'Relative' => true,
    'Inputs' => 
    array (
      'title' => true,
      '__id' => true,
      '_props' => true,
      '_refs' => true,
      '_element' => true,
      '_slots' => true,
    ),
    'Instance' => NULL,
  ),
  'Layout' => 
  array (
    'Name' => 'Layout',
    'Namespace' => 'Components\\Views\\Layouts',
    'ComponentName' => 'Layout',
    'Tag' => 'Layout',
    'FullPath' => '\\Views\\Layouts\\Layout.php',
    'TemplatePath' => '\\Views\\Layouts\\Layout.html',
    'BuildPath' => '\\Views\\Layouts\\Layout.php',
    'RenderFunction' => 'RenderLayout',
    'IsComponent' => true,
    'HasInit' => false,
    'HasMounted' => false,
    'HasBeforeMount' => false,
    'HasVersions' => false,
    'Relative' => true,
    'Inputs' => 
    array (
      'title' => true,
      '__id' => true,
      '_props' => true,
      '_refs' => true,
      '_element' => true,
      '_slots' => true,
    ),
    'Instance' => NULL,
  ),
  'CssBundle' => 
  array (
    'Name' => 'CssBundle',
    'Namespace' => 'Viewi\\Components\\Assets',
    'ComponentName' => 'CssBundle',
    'Tag' => 'CssBundle',
    'FullPath' => 'C:\\Users\\kanto\\Desktop\\viewi\\vendor\\viewi\\viewi\\src\\Viewi\\Components\\Assets\\CssBundle.php',
    'TemplatePath' => 'C:\\Users\\kanto\\Desktop\\viewi\\vendor\\viewi\\viewi\\src\\Viewi\\Components\\Assets\\CssBundle.html',
    'BuildPath' => '\\Viewi\\Components\\Assets\\CssBundle_v1.php',
    'IsComponent' => true,
    'HasInit' => false,
    'HasMounted' => false,
    'HasBeforeMount' => false,
    'HasVersions' => true,
    'Relative' => false,
    'Inputs' => 
    array (
      'links' => true,
      'link' => true,
      'minify' => true,
      'combine' => true,
      'inline' => true,
      'shakeTree' => true,
      '__id' => true,
      '_props' => true,
      '_refs' => true,
      '_element' => true,
      '_slots' => true,
    ),
    'Versions' => 
    array (
      '/css/main.css0000' => 
      array (
        'key' => '_v1',
        'RenderFunction' => 'RenderCssBundle_v1',
        'BuildPath' => '\\Viewi\\Components\\Assets\\CssBundle_v1.php',
      ),
    ),
    'Instance' => NULL,
  ),
  'HttpClient' => 
  array (
    'Name' => 'HttpClient',
    'Namespace' => 'Viewi\\Common',
    'FullPath' => 'C:\\Users\\kanto\\Desktop\\viewi\\vendor\\viewi\\viewi\\src\\Viewi\\Common\\HttpClient.php',
    'IsComponent' => false,
    'HasInit' => false,
    'HasMounted' => false,
    'HasBeforeMount' => false,
    'Relative' => false,
    'Dependencies' => 
    array (
      'asyncStateManager' => 
      array (
        'name' => 'AsyncStateManager',
      ),
    ),
    'Instance' => NULL,
  ),
  'AsyncStateManager' => 
  array (
    'Name' => 'AsyncStateManager',
    'Namespace' => 'Viewi\\Components\\Services',
    'FullPath' => 'C:\\Users\\kanto\\Desktop\\viewi\\vendor\\viewi\\viewi\\src\\Viewi\\Components\\Services\\AsyncStateManager.php',
    'IsComponent' => false,
    'HasInit' => false,
    'HasMounted' => false,
    'HasBeforeMount' => false,
    'Relative' => false,
    'Instance' => 
    array (
    ),
  ),
  'ViewiScripts' => 
  array (
    'Name' => 'ViewiScripts',
    'Namespace' => 'Viewi\\Components\\Assets',
    'ComponentName' => 'ViewiScripts',
    'Tag' => 'ViewiScripts',
    'FullPath' => 'C:\\Users\\kanto\\Desktop\\viewi\\vendor\\viewi\\viewi\\src\\Viewi\\Components\\Assets\\ViewiScripts.php',
    'TemplatePath' => 'C:\\Users\\kanto\\Desktop\\viewi\\vendor\\viewi\\viewi\\src\\Viewi\\Components\\Assets\\ViewiScripts.html',
    'BuildPath' => '\\Viewi\\Components\\Assets\\ViewiScripts.php',
    'RenderFunction' => 'RenderViewiScripts',
    'IsComponent' => true,
    'HasInit' => false,
    'HasMounted' => false,
    'HasBeforeMount' => false,
    'HasVersions' => false,
    'Relative' => false,
    'Inputs' => 
    array (
      'responses' => true,
      '__id' => true,
      '_props' => true,
      '_refs' => true,
      '_element' => true,
      '_slots' => true,
    ),
    'Dependencies' => 
    array (
      'httpClient' => 
      array (
        'name' => 'HttpClient',
      ),
      'asyncStateManager' => 
      array (
        'name' => 'AsyncStateManager',
      ),
    ),
    'Instance' => NULL,
  ),
  'NotFoundPage_Slot' => 
  array (
    'Name' => 'NotFoundPage_Slot',
    'Namespace' => 'Components\\Views\\NotFound',
    'ComponentName' => 'NotFoundPage',
    'Tag' => 'NotFoundPage_Slot',
    'FullPath' => '\\Views\\NotFound\\NotFoundPage.php',
    'TemplatePath' => '\\Views\\NotFound\\NotFoundPage_Slot.html',
    'BuildPath' => '\\_slots\\Views\\NotFound\\NotFoundPage_Slot.php',
    'RenderFunction' => 'RenderNotFoundPage_Slot',
    'IsComponent' => false,
    'IsSlot' => true,
    'Relative' => true,
    'Instance' => NULL,
  ),
  'AboutPage_Slot' => 
  array (
    'Name' => 'AboutPage_Slot',
    'Namespace' => 'Components\\Views\\About',
    'ComponentName' => 'AboutPage',
    'Tag' => 'AboutPage_Slot',
    'FullPath' => '\\Views\\About\\AboutPage.php',
    'TemplatePath' => '\\Views\\About\\AboutPage_Slot.html',
    'BuildPath' => '\\_slots\\Views\\About\\AboutPage_Slot.php',
    'RenderFunction' => 'RenderAboutPage_Slot',
    'IsComponent' => false,
    'IsSlot' => true,
    'Relative' => true,
    'Instance' => NULL,
  ),
  'ContactPage_Slot' => 
  array (
    'Name' => 'ContactPage_Slot',
    'Namespace' => 'Components\\Views\\Contact',
    'ComponentName' => 'ContactPage',
    'Tag' => 'ContactPage_Slot',
    'FullPath' => '\\Views\\Contact\\ContactPage.php',
    'TemplatePath' => '\\Views\\Contact\\ContactPage_Slot.html',
    'BuildPath' => '\\_slots\\Views\\Contact\\ContactPage_Slot.php',
    'RenderFunction' => 'RenderContactPage_Slot',
    'IsComponent' => false,
    'IsSlot' => true,
    'Relative' => true,
    'Instance' => NULL,
  ),
  'DashboardPage_Slot' => 
  array (
    'Name' => 'DashboardPage_Slot',
    'Namespace' => 'Components\\Views\\Dashboard',
    'ComponentName' => 'DashboardPage',
    'Tag' => 'DashboardPage_Slot',
    'FullPath' => '\\Views\\Dashboard\\DashboardPage.php',
    'TemplatePath' => '\\Views\\Dashboard\\DashboardPage_Slot.html',
    'BuildPath' => '\\_slots\\Views\\Dashboard\\DashboardPage_Slot.php',
    'RenderFunction' => 'RenderDashboardPage_Slot',
    'IsComponent' => false,
    'IsSlot' => true,
    'Relative' => true,
    'Instance' => NULL,
  ),
  'IHttpContext' => 
  array (
    'Name' => 'IHttpContext',
    'Namespace' => 'Viewi\\WebComponents',
    'FullPath' => '',
    'IsComponent' => false,
    'HasInit' => false,
    'HasMounted' => false,
    'HasBeforeMount' => false,
    'Instance' => 
    array (
    ),
  ),
));   
}
