<?php

use Request;
use Response;

class Router {

    private static $appDomain = '';
    
    private static $appBase = '';

    public const METHOD_GET = 'GET';

    public const METHOD_POST = 'POST';

    public const METHOD_PUT = 'PUT';

    public const METHOD_DELETE = 'DELETE';

    public const METHOD_ANY = '*';

    private array $routes = [];

    public function __construct(
        private string $domain = '',
        private string $base = '',
    ) {
        self::$appDomain = $domain;
        self::$appBase = $base;
    }

    public static function domain(): string {
        return self::$appDomain;
    }

    public static function base(): string {
        return self::$appBase;
    }

    private function defineRoute(string $method, string $route, string $class, string $function, ?string $middleware = null) {
        if(!$this->isValidMethod($method)) return;
        if(!class_exists($class)) return;
        if(!method_exists($class, $function)) return;

        $route = $this->buildRoute($route);

        $this->routes[$route] ??= [];
        $this->routes[$route][$method] = (object) [
            'class'     => $class,
            'function'  => $function,
        ];

        if(isset($middleware) && class_exists($middleware)) {
            $this->routes[$route][$method]->middleware = $middleware;
        }
    }

    public function isValidMethod(string $method): bool {
        return in_array($method, [ self::METHOD_GET, self::METHOD_POST, self::METHOD_PUT, self::METHOD_DELETE, self::METHOD_ANY ], true);
    }

    private function buildRoute(string $route): string {
        $parts = array_merge(
            array_filter(explode('/', self::base())),
            array_filter(explode('/', $route))
        );
        
        $parts = array_map(array: $parts, callback: function($part) {
            if(!preg_match('/^\{.+\}$/', $part)) return $part;

            $part = substr($part, 1, -1);

            if(!preg_match('/\(\?\</', $part)) return $part;

            $subParts = explode(':', $part);
            $name = array_shift($subParts);
            $regex = implode(':', $subParts) ?: '[a-zA-Z0-9]+';

            return "(?<$name>$regex)";
        });

        return '/^\\/' . implode('\\/', $parts) . '$/';
    }

    public function get(string $route, string $class, string $function, ?string $middleware = null) {
        $this->defineRoute(self::METHOD_GET, $route, $class, $function, $middleware);
    }

    public function post(string $route, string $class, string $function, ?string $middleware = null) {
        $this->defineRoute(self::METHOD_POST, $route, $class, $function, $middleware);
    }

    public function put(string $route, string $class, string $function, ?string $middleware = null) {
        $this->defineRoute(self::METHOD_PUT, $route, $class, $function, $middleware);
    }

    public function delete(string $route, string $class, string $function, ?string $middleware = null) {
        $this->defineRoute(self::METHOD_DELETE, $route, $class, $function, $middleware);
    }

    public function any(string $route, string $class, string $function, ?string $middleware = null) {
        $this->defineRoute(self::METHOD_ANY, $route, $class, $function, $middleware);
    }

    public function execute(Request $request) {
        if(!$this->isValidMethod($request->method())) return;

        $route = $request->route();

        foreach($this->routes as $routeRegex => $routeMethods) {
            if(!preg_match($routeRegex, $route, $matches)) continue;
            if(!isset($routeMethods[$request->method()]) && !isset($routeMethods[self::METHOD_ANY])) continue;

            $routeConfig = $routeMethods[$request->method()] ?? $routeMethods[self::METHOD_ANY];

            $controllerClass = $routeConfig->class;
            $controllerFunction = $routeConfig->function;

            $requestQuery = array_filter($matches, fn($key) => !is_int($key), ARRAY_FILTER_USE_KEY);

            $request->setQuery($requestQuery);
            $request->finalize();

            $response = new Response();

            $controller = new $controllerClass($request, $response);

            $intercept = false;

            if(isset($routeConfig->middleware)) {
                $middlewareClass = $routeConfig->middleware;

                if($middlewareClass::intercept($request, $response, $controller)) $intercept = true;
            }

            if($intercept) $response->send();

            $controller->{$controllerFunction}();
            $controller->response()->send();
        }
    }
}