<?php

use Request;

interface Validation {
    public static function validate(Request $request, string $field, array $parameter): bool;
}