<?php

use WebApplication;

if(isset($_GET['route'])) {
    $application = new WebApplication();
    $application->run();
}