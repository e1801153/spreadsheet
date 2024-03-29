### Spreadsheet

Simple spreadsheet using react.

### To run

```
$ Use the following commands:
$ Yarn (to install Yarn)
$ Yarn start (to run the program inside the source folder)
```
### How to use
```
$ For arithmetic operations, simply create a formula based on corresponding cells, e.g. "=A1+A2".
$ To fetch data from Vaasa University of Applied Sciences database, wrap your query in "=SPARQL()" for the syntax.
$ The only supported query in the current release is to fetch data. Format: "SELECT ? WHERE { ? ? ? } 0"
$ Example: "=SPARQL(SELECT ?s WHERE { ?s ?p ?o }) 16", wherein the first variable is the name of the desired column and the following variables are all the existing columns inside a table.
$ Finally, a number points to a desired row within the table. In the following releases, it's suggested this would be replaced with a user friendly dropdown menu instead.
```
