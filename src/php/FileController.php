<?php

use Controller;

class FileController extends Controller {

    public function getFile() {
        $this->validate([
            'file'  => 'required',
        ]);

        $path = realpath($this->request()->get('file'));

        $content = @file_get_contents($path);
    
        if($content === false) return $this->response()->status(404);

        $this->response()->json([
            'path'      => $path,
            'content'   => $content,
        ]);
    }

    public function saveFile() {
        $this->validate([
            'file'      => 'required',
            'content'   => 'required',
        ]);

        $path = realpath($this->request()->get('file'));

        $success = @file_put_contents($path, $this->request()->get('file'));

        if($success === false) $this->response()->status(500);

        die(json_encode([
            'path'  => $path,
        ]));
    }

    public function downloadFile() {
        $this->validate([
            'file'  => 'required',
        ]);

        $path = realpath($this->request()->get('file'));

        if(!is_file($path)) return $this->response()->status(404);

        $this->response()->file($path);
    }
}