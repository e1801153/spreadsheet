import React, { useState, useCallback, Fragment, useEffect } from "react";
import Cell from "./Cell";
import { Sheet as StyledSheet } from "./styles";

const databaseUrl = "http://projectware.net:8890/sparql?default-graph-uri=urn%3Asparql%3Abind%3Avamk-data&query=select+%3Fs+%3Fo+%3Fp+WHERE+%7B+%3Fs+%3Fo+%3Fp+%7D&should-sponge=&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on&run=+Run+Query+";
const errorQuery = "Invalid query.";
const errorParse = "Failed to parse.";
const errorFetch = "Unable to fetch data.";
const errorSELECT = "Only SELECT is supported.";
const errorArguments = "Too many arguments.";
const maxAmountOfArguments = 3;
const initializeRow = 0;
const initializeColumn = "s";

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
        [data, setData],
    );

    // Convert cells from fetch into a computable format
    function convertComputedCell(row, column, value = '') {
        const newData = { ...data };
        value = value.toString();
        newData[`${column}${row}`] = value;
        setData(newData);
    }

    // Initialize the database
    useEffect(() => {
        fetchData(initializeRow, initializeColumn);
    }, []);

    const [databaseValue, setDatabaseValue] = useState([]);

    // Fetch from database
    function fetchData(jsonRow, jsonColumn) {
        fetch(databaseUrl)
            .then(response => response.json())
            .then(jsonData => {
                try {
                    console.log(jsonData);
                    setDatabaseValue(jsonData.results.bindings[jsonRow][jsonColumn].value);
                } catch (error) {
                    return errorFetch;
                }
            })
    }

    // Parse SPARQL query and/or compute two cells
    const computeCell = useCallback(
        ({ row, column }) => {
            const cellContent = data[`${column}${row}`];
            if (cellContent) {
                    if (cellContent.charAt(0) === "=") {
                        if (cellContent.slice(0, 8) === "=SPARQL(" && cellContent.slice(cellContent.length - 1, cellContent.length) == ")") {
                            try {
                                const substitutedExpression = cellContent.slice(8, cellContent.length - 1);
                                const expression = substitutedExpression.split(" ");
                                let jsonRow = 0;
                                let jsonColumn;
                                let lookForSELECT = true;
                                let lookForFirstItem = true;
                                let lookForQueryWHERE = true;
                                let lookforOpeningBracket = true;
                                let lookforClosingBracket = true;
                                let lookForQueryS = true;
                                let lookForQueryO = true;
                                let lookForQueryP = true;
                                let lookForAmountOfArguments = 0;
                                let foundInvalidQuery = false;
                                expression.forEach(item => {
                                    if (item.charAt(0) === "?") {
                                        let substitutedItem = item.slice(1, item.length);
                                        if (lookForFirstItem) {
                                            jsonColumn = substitutedItem;
                                            lookForFirstItem = false;
                                        } else if (item.charAt(1) === "s" && item.length == 2 && !(lookForQueryWHERE)) {
                                            lookForQueryS = false;
                                            lookForAmountOfArguments++;
                                        } else if (item.charAt(1) === "o" && item.length == 2 && !(lookForQueryWHERE)) {
                                            lookForQueryO = false;
                                            lookForAmountOfArguments++;
                                        } else if (item.charAt(1) === "p" && item.length == 2 && !(lookForQueryWHERE)) {
                                            lookForQueryP = false;
                                            lookForAmountOfArguments++;
                                        }
                                    } else if (item === "WHERE") {
                                        if (!lookForFirstItem) {
                                            lookForQueryWHERE = false;
                                        }
                                    } else if (item === "SELECT") {
                                        if (lookForFirstItem) {
                                            lookForSELECT = false;
                                        }
                                    } else if (!(isNaN(item)) && lookForAmountOfArguments == maxAmountOfArguments) {
                                        jsonRow = item;
                                    } else if(item === "{") {
                                        if (lookforOpeningBracket && !lookForQueryWHERE)
                                            lookforOpeningBracket = false;
                                    } else if (item === "}") {
                                        if (lookforClosingBracket && lookForAmountOfArguments > 0)
                                            lookforClosingBracket = false;
                                    } else {
                                        foundInvalidQuery = true;
                                    }
                                });
                                if (jsonColumn && !(lookForFirstItem) && !(lookForQueryWHERE) && !(lookForQueryS) && !(lookForQueryO) && !(lookForQueryP)) {
                                    if (!(lookForSELECT)) {
                                        if (lookForAmountOfArguments = maxAmountOfArguments) {
                                            if (!(lookforClosingBracket) && !(lookforOpeningBracket)) {
                                                if (!(foundInvalidQuery)) {
                                                    fetchData(jsonRow, jsonColumn);
                                                    convertComputedCell(row, column, databaseValue);
                                                    return (databaseValue);
                                                } else {
                                                    return errorQuery;
                                                }
                                            } else {
                                                return errorQuery;
                                            }
                                        } else {
                                            return errorArguments;
                                        }
                                    } else {
                                        return errorSELECT;
                                    }
                                } else {
                                    return errorQuery;
                                }
                            } catch (error) {
                                return errorParse;
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
                            try {
                                let finalexpression = eval(subStitutedExpression);
                                convertComputedCell(row, column, finalexpression);
                                return (finalexpression);
                            } catch (error) {
                                return "Failed to compute.";
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
