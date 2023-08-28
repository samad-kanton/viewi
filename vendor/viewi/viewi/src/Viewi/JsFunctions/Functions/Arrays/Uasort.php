<?php

namespace Viewi\JsFunctions\Functions\Arrays;

use Viewi\JsFunctions\BaseFunctionConverter;
use Viewi\JsTranslator;

class Uasort extends BaseFunctionConverter
{
    public static string $name = 'uasort';

    public static function convert(
        JsTranslator $translator,
        string $code,
        string $indentation
    ): string {
        $jsToInclude = __DIR__ . DIRECTORY_SEPARATOR . 'Uasort.js';
        $translator->includeJsFile(self::$name, $jsToInclude);
        return $code . '(';
    }
}
