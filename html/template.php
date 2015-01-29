<?php
/**
 * Description of template
 *
 * @author Chris Vaughan
 */
class RHtmlTemplate {
    
    private $contents;
    
    function __construct($template) {
        $this->contents=file_get_contents ( $template);
    }
    
    function replaceString($string,$with){
        $this->contents = str_replace($string, $with, $this->contents);
    }
    
     function insertTemplate() {
        echo $this->contents;
    }
}
