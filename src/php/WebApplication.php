<?php

use Application;
use Router;
use Request;
use StaticContentController;
use FolderController;
use FileController;
use CommandController;

class WebApplication implements Application {

    public function run(): void {
        $router = $this->router();

        $router->get('/favicon', StaticContentController::class, 'favicon');

        $router->get('/folder', FolderController::class, 'getFolder');

        $router->get('/file', FileController::class, 'getFile');
        $router->put('/file', FileController::class, 'saveFile');
        $router->get('/file/download', FileController::class, 'downloadFile');

        $router->post('/command', CommandController::class, 'createCommand');

        $router->execute(new Request());
    }

    private function router(): Router {
        $path = parse_url("https://{$_SERVER['HTTP_HOST']}{$_SERVER['REQUEST_URI']}", PHP_URL_PATH);

        return new Router($_SERVER['HTTP_HOST'], $path);
    }
}