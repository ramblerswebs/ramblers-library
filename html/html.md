# RHtml
RHtml::addTableHeader($cols) where $cols is an array. Create the html code for a row of table header tags containing the data values $cols.

RHtml::addTableRow($cols) where $cols is an array. Create the html code for a row of table tags containing the data values $cols.

for example 
```      echo RHtml::addTableHeader(array("Date", "Meet", "Start", "Title", "Distance", "Grade", "Leader"));
  ```