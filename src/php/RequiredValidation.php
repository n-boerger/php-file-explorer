<?php

use Validation;
use Request;

class RequiredValidation implements Validation {

    public static function validate(Request $request, string $field, array $parameter): bool {
        return $request->has($field) && $request->get($field) !== '';
    }
}