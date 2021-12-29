<?php

defined("_JEXEC") or die("Restricted access");

class RJsonwalksStdDiagnostics extends RJsonwalksDisplaybase {

    private $options = ["{lf}", "{group}", "{dowShortdd}", "{dowShortddmm}", "{dowShortddyyyy}",
        "{dowShortddmmyyyy}", "{dowdd}", "{dowddmm}", "{dowddmmyyyy}", "{meet}",
        "{meetTime}", "{meetPlace}", "{meetGR}", "{meetPC}", "{meetOLC}", "{meetMapCode}",
        "{start}", "{startTime}", "{startPlace}", "{startGR}", "{startPC}", "{startOLC}",
        "{startMapCode}", "{finishTime}", "{title}", "{description}", "{difficulty}", "{difficulty+}",
        "{distance}", "{distanceMi}", "{distanceKm}", "{gradeimg}", "{gradeimgRight}",
        "{grade}", "{grade+}", "{nationalGrade}", "{nationalGradeAbbr}", "{localGrade}",
        "{additionalNotes}", "{type}", "{contact}", "{contactname}", "{contactperson}", "{telephone}",
        "{telephone1}", "{telephone2}", "{email}", "{emailat}", "{emaillink}", "{mediathumbr}",
        "{mediathumbl}",
        "{meetOSMap}", "{meetDirections}", "{startOSMap}", "{startDirections}"];

    public function DisplayWalks($walks) {

        $items = $walks->allWalks();
        foreach ($items as $walk) {
            echo "<table><tr><th>Item</th><th>Name</th><th>Value</th><th>HTML</th></tr>";
            $no = 0;
            foreach ($this->options as $option) {

                $html = "<tr>";
                $value = $walk->getWalkValue($option);
                $text = str_replace(["<", ">"], ["&lt;", ">"], $value);
                $html .= "<td>" . $no . "</td><td>" . $option . "</td><td>" . $value . "</td><td>" . $text . "</td>";
                $html .= "</tr>";
                echo $html;
                $no += 1;
            }
            echo "</table>";
        }

        return;
    }

}
