<?php

class Request {

    private array $cookies = [];

    private array $headers = [];

    private array $input = [];

    private array $query = [];

    private string $method = '';

    private string $url = '';

    private bool $finalized = false;

    public function __construct() {
        if(getallheaders()) $this->headers = array_change_key_case(getallheaders());

        $this->cookies = $_COOKIE;
        
        $this->method = $_SERVER['REQUEST_METHOD'];
        
        $this->url = "https://{$_SERVER['HTTP_HOST']}{$_SERVER['REQUEST_URI']}";
        
        switch($this->method) {
            case 'PUT':
            case 'POST':
                try {
                    $this->input = json_decode(file_get_contents('php://input'), true, flags: JSON_THROW_ON_ERROR);
                } catch(JsonException $exception) {}

                parse_str(parse_url($this->url, PHP_URL_QUERY), $this->query);

                break;
            case 'GET':
            case 'DELETE':
                parse_str(parse_url($this->url, PHP_URL_QUERY), $this->input);

                break;
        }
    }

    public function method(): string {
        return $this->method;
    }

    public function url(): string {
        return $this->url;
    }

    public function route(): string {
        return $_GET['route'];
    }

    public function setQuery(array $query) {
        if($this->finalized) return;

        $this->query = array_merge($this->query, $query);
    }

    public function has(string $key): bool {
        return $this->hasInput($key) || $this->hasQuery($key);
    }

    public function hasHeader(string $key): bool {
        return isset($this->headers[strtolower($key)]);
    }

    public function hasCookie(string $key): bool {
        return isset($this->cookies[$key]);
    }

    public function hasQuery(string $key): bool {
        return isset($this->query[$key]);
    }

    public function hasInput(string $key): bool {
        return isset($this->input[$key]);
    }

    public function get(string $key) {
        return $this->input($key) ?? $this->query($key);
    }

    public function header(string $key) {
        return $this->headers[strtolower($key)] ?? null;
    }

    public function cookie(string $key) {
        return $this->cookies[$key] ?? null;
    }

    public function query(string $key) {
        return $this->query[$key] ?? null;
    }

    public function input(string $key) {
        return $this->input[$key] ?? null;
    }

    public function finalize() {
        $this->finalized = true;
    }
}