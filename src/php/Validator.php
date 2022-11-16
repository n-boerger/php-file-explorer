<?php

use Request;
use RequiredValidation;
use RequiredIfValidation;

class Validator {

    private array $errors = [];

    public function __construct(
        private Request $request,
    ) {}

    public function validate(array $validations): bool {
        foreach($validations as $field => $fieldValidationsString) {
            $this->validateField($field, $fieldValidationsString);
        }

        return empty($this->errors);
    }

    private function validateField(string $field, string $fieldValidationsString): bool {
        $fieldValidations = $this->parseValidationsString($fieldValidationsString);

        $requiredValidation = RequiredValidation::validate($this->request, $field, []);

        if(!$requiredValidation && isset($fieldValidations['optional'])) {
            return true;
        }

        if(!$requiredValidation && isset($fieldValidations['required_if'])) {
            $requiredValidation = RequiredIfValidation::validate($this->request, $field, $fieldValidations['required_if']);
        }

        if(!$requiredValidation) {
            $this->errors[$field] ??= [];
            $this->errors[$field][] = 'required';

            return false;
        }

        $fieldValidations = array_filter(
            $fieldValidations,
            fn($type) => !in_array($type, ['required', 'optional', 'required_if'], true),
            ARRAY_FILTER_USE_KEY
        );

        foreach($fieldValidations as $type => $parameter) {
            $validationClass = $this->getValidationClass($type);

            if($validationClass === null) continue;

            $valid = $validationClass::validate($this->request, $field, $parameter);

            if(!$valid) {
                $this->errors[$field] ??= [];
                $this->errors[$field][] = $type;
            }
        }

        return !isset($this->errors[$field]);
    }

    private function parseValidationsString(string $validationsString) {
        $validationPairs = explode('|', $validationsString);
        $validations = [];

        foreach($validationPairs as $validationPair) {
            $typeAndParameters = explode(':', $validationPair);
            $type = array_shift($typeAndParameters);
            $parameters = explode(',', implode(':', $typeAndParameters));

            $validations[$type] = array_filter($parameters, fn($param) => $param !== '');
        }
        
        return $validations;
    }

    private function getValidationClass(string $type): ?string {
        return match($type) {
            'required'      => RequiredValidation::class,
            'required_if'   => RequiredIfValidation::class,
            default => null,
        };
    }

    public function getErrors() {
        return $this->errors;
    }
}