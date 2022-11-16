<?php

use Controller;

class CommandController extends Controller {

    public function createCommand() {
        $this->validate([
            'dir'       => 'required',
            'command'   => 'required',
        ]);

        if(is_dir($this->request()->get('dir'))) chdir($this->request()->get('dir'));

        $command = htmlspecialchars_decode($this->request()->get('command'));
        $result = '';
    
        if(preg_match('/^cd\s/', $command)) {
            $dir = trim(preg_replace('/^cd/', '', $command));
    
            if(is_dir($dir)) {
                chdir($dir);
            } else {
                $result = "cd: {$dir}: No such file or directory\n";
            }
        }
    
        if($this->shouldExecute($command)) {
            $result = shell_exec("{$command} 2>&1 &");
        }

        $this->response()->json([
            'dir'       => getcwd(),
            'result'    => $result,
        ]);
    }

    private function shouldExecute(string $command): bool {
        if(trim($command) === 'clear') return false;
        if(preg_match('/cd\s/', $command)) return false;
    
        return true;
    }
}