<?php
/**
 * Description of template
 *
 * @author Chris Vaughan
 */
class RHtmlTemplate {
    
    private $contents;
    
public     function __construct($template) {
        $this->contents=file_get_contents ( $template);
    }
    
 public       function replaceString($string,$with){
        $this->contents = str_replace($string, $with, $this->contents);
    }
    
 public        function insertTemplate() {
        echo $this->contents;
    }
    public        function getContents() {
        return $this->contents;
    }
}
