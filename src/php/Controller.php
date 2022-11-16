<?php

use Validator;
use Request;
use Response;

abstract class Controller {

    private Validator $validator;
    
    public function __construct(
        private Request $request,
        private Response $response,
    ) {
        $this->validator = new Validator($this->request);
    }

    public function request(): Request {
        return $this->request;
    }

    public function response(): Response {
        return $this->response;
    }

    public function validate(array $validations) {
        if(!$this->validator->validate($validations)) {
            $this->response()
                ->status(400)
                ->json($this->validator->getErrors())
                ->send();
        }
    }
}