<?php

use Controller;

class FolderController extends Controller {

    public function getFolder() {
        $this->validate([
            'folder'    => 'required',
        ]);

        $path = realpath($this->request()->get('folder')) . DIRECTORY_SEPARATOR;

        if(!is_dir($path)) return $this->response()->status(404);

        $contents = [];

        foreach(new FilesystemIterator($path, FilesystemIterator::SKIP_DOTS) as $fileInfo) {
            if($fileInfo->getRealPath() === __FILE__) continue;

            $contents[] = [
                'type'  => $fileInfo->isFile() ? 'file' : 'folder',
                'name'  => $fileInfo->getBasename(),
            ];
        }

        usort($contents, function($contentA, $contentB) {
            if($contentA['type'] === $contentB['type']) return strtolower($contentA['name']) <=> strtolower($contentB['name']);
            if($contentA['type'] === 'folder') return -1;
            return 1;
        });

        $this->response()->json([
            'path'      => $path,
            'contents'  => array_values($contents),
        ]);
    }
}