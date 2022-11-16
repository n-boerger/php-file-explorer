<?php

use Validation;
use Request;
use RequiredValidation;

class RequiredIfValidation implements Validation {

    public static function validate(Request $request, string $field, array $parameter): bool {
        [$otherField] = $parameter;

        if(!$request->has($otherField)) return true;

        return RequiredValidation::validate($request, $field, $parameter);
    }
}