import React, { useState, useCallback, Fragment, useEffect } from "react";
import Database from "./Database";
import ReactDOM from "react-dom";


import Cell from "./Cell";
import { Sheet as StyledSheet } from "./styles";

const getColumnName = index =>
  String.fromCharCode("A".charCodeAt(0) + index - 1);

const Sheet = ({ numberOfRows, numberOfColumns }) => {
  const [data, setData] = useState({});

  const setCellValue = useCallback(
    ({ row, column, value }) => {
      const newData = { ...data };

          newData[`${column}${row}`] = value;
          setData(newData);
    },
    [data, setData]
  );

    let myJson = "";
    const [database, setDatabase] = useState([]);
    useEffect(() => {
        fetchData();
    }, []);

    function fetchData() {
        fetch("http://projectware.net:8890/sparql?default-graph-uri=urn%3Asparql%3Abind%3Avamk-data&query=SELECT+%3Fo+WHERE+%7B+%3Fs+%3Fp+%3Fo+%7D&should-sponge=&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on&run=+Run+Query+")
            .then(response => response.json())
            .then(jsonData => {
                console.log(jsonData);
                jsonData && jsonData.results.bindings && setDatabase(JSON.stringify(jsonData.results.bindings[3].o.value));
            })
    }

    

  const computeCell = useCallback(
    ({ row, column }) => {
          
      const cellContent = data[`${column}${row}`];
      if (cellContent) {
          if (cellContent.charAt(0) === "=") {
              if (cellContent === "=SPARQL") {
                  try {                     
                      return (database);
                  } catch (error) {
                      return "Oho!";
                  }
              } else {
                  // This regex converts = "A1+A2" to ["A1","+","A2"]
                  const expression = cellContent.substr(1).split(/([+*-])/g);

                  let subStitutedExpression = "";

                  expression.forEach(item => {
                      // Regex to test if it is of form alphabet followed by number ex: A1
                      if (/^[A-z][0-9]$/g.test(item || "")) {
                          subStitutedExpression += data[(item || "").toUpperCase()] || 0;
                      } else {
                          subStitutedExpression += item;
                      }
                  });

                  // @shame: Need to comeup with parser to replace eval and to support more expressions
                  try {
                      return eval(subStitutedExpression);
                  } catch (error) {
                      return "ERROR!";
                  }
              }
          }
        return cellContent;
      }
      return "";
    },
    [data]
  );

  return (
    <StyledSheet numberOfColumns={numberOfColumns}>
      {Array(numberOfRows)
        .fill()
        .map((m, i) => {
          return (
            <Fragment key={i}>
              {Array(numberOfColumns)
                .fill()
                .map((n, j) => {
                  const columnName = getColumnName(j);
                  return (
                    <Cell
                      rowIndex={i}
                      columnIndex={j}
                      columnName={columnName}
                      setCellValue={setCellValue}
                      currentValue={data[`${columnName}${i}`]}
                      computeCell={computeCell}
                      key={`${columnName}${i}`}
                    />
                  );
                })}
            </Fragment>
          );
        })}
    </StyledSheet>
  );
};

export default Sheet;
