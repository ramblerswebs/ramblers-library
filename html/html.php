<?php

class RHtml {

    static function addTableHeader($cols) {
        if (is_array($cols)) {
            $out = "<tr>";
            foreach ($cols as $value) {
                $out.="<th>" . $value . "</th>";
            }
            $out.="</tr>" . PHP_EOL;
            return $out;
        } else {
            return "<tr><td>invalid argument in html::addTableRows</td></tr>";
        }
    }

    static function addTableRow($cols,$class="") {
        if (is_array($cols)) {
            if ($class=="") {
                $out = "<tr>";
            }else {
                  $out = "<tr class='".$class."'>";
                  }
          
            foreach ($cols as $value) {
                $out.="<td>" . $value . "</td>";
            }
            $out.="</tr>" . PHP_EOL;
            return $out;
        } else {
            return "<tr><td>invalid argument in html::addTableRows</td></tr>";
        }
    }

}
