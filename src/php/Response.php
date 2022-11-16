<?php

use Cookie;

class Response {

    public function __construct(
        private int $status = 200,
        private array $headers = [],
        private array $cookies = [],
        private string $body = '',
    ) {}

    public function status(int $status): self {
        $this->status = $status;

        return $this;
    }

    public function header(string $name, string $value): self {
        $this->headers[$name] = $value;

        return $this;
    }

    public function headers(array $headers): self {
        $this->headers = $headers;

        return $this;
    }

    public function cookie(Cookie $cookie): self {
        $this->cookies[] = $cookie;

        return $this;
    }

    public function json($data): self {
        $this->header('Content-Type', 'application/json');

        $this->body = json_encode($data);

        return $this;
    }

    public function html(string $html): self {
        $this->header('Content-Type', 'text/html');

        $this->body = $html;

        return $this;
    }

    public function message(string $message): self {
        $this->header('Content-Type', 'text/plain');

        $this->body = $message;

        return $this;
    }

    public function file(string $filePath): self {
        $mime = mime_content_type($filePath) ?: 'application/octet-stream';

        $this->header('Content-Type', $mime);
        $this->header('Content-Disposition', 'filename="'.basename($filePath).'"');
        $this->header('Content-Length', (string) filesize($filePath));

        $this->body = file_get_contents($filePath);

        return $this;
    }

    public function body(string $body): self {
        $this->body = $body;

        return $this;
    }

    public function send() {
        http_response_code($this->status);

        foreach($this->headers as $name => $value) {
            header("$name: $value");
        }

        foreach($this->cookies as $cookie) {
            setcookie($cookie->name, $cookie->value, [
                'expires'   => $cookie->expires,
                'path'      => $cookie->path,
                'domain'    => $cookie->domain,
                'secure'    => $cookie->secure,
                'httponly'  => $cookie->httponly,
                'samesite'  => $cookie->samesite,
            ]);
        }

        die($this->body);
    }
}