<?php

use Router;

class Cookie {

    public int $expires = 0;

    public string $path = '';

    public string $domain = '';

    public function __construct(
        public string $name,
        public string $value,
        int|string $expires = 0,
        ?string $path = null,
        ?string $domain = null,
        public bool $secure = true,
        public bool $httponly = true,
        public string $samesite = 'Lax',
    ) {
        if(is_string($expires)) $expires = (new DateTime())->modify($expires)->getTimestamp();

        $this->expires = $expires;

        if($path === null) $path = Router::base();

        $this->path = $path;

        if($domain === null) $domain = Router::domain();

        $this->domain = $domain;
    }
}