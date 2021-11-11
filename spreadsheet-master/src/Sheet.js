import React, { useState, useCallback, Fragment, useEffect } from "react";
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

    const [database, setDatabase] = useState([]);
    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData(jsonUrl = '', jsonInteger = {}, jsonChar = {}) {
        await fetch(jsonUrl);
        fetch(jsonUrl)
            .then(response => response.json())
            .then(jsonData => {
                try {
                    console.log(jsonChar);
                    console.log(jsonData.results.bindings[jsonInteger][jsonChar].value);
                    jsonData && jsonData.results.bindings && setDatabase(jsonData.results.bindings[jsonInteger][jsonChar].value);
                } catch (error) {
                    jsonData && jsonData.results.bindings && setDatabase("Invalid parameters!");
                    console.log(error);
                }
            })
    }

    const computeCell = useCallback(
        ({ row, column }) => {

            const cellContent = data[`${column}${row}`];
            if (cellContent) {
                if (cellContent.charAt(0) === "=") {
                    if (cellContent.slice(0, 15) === "=SPARQL(SELECT ") {
                        try {
                            // Take the string of Cellcontent after =SPARQL(
                            var subStitutedExpression = cellContent.slice(15, cellContent.length);
                            // Split the subStitutedExpression after every space to create items
                            const expression = subStitutedExpression.split(" ");
                            let urlQuery = "";
                            let jsonChar = '';
                            let isFirstItem = true;
                            // Going through every item, checking if it includes ? or WHERE
                            expression.forEach(item => {
                                if (item.charAt(0) === "?") {
                                    let slicedItem = item.slice(1, item.length);
                                    urlQuery += "+%3F";
                                    urlQuery += slicedItem;
                                    console.log(urlQuery);
                                    if (isFirstItem === true) {
                                        jsonChar = slicedItem;
                                        isFirstItem = false;
                                    }
                                } else if (item === "WHERE") {
                                    urlQuery += "+WHERE+%7B"
                                    console.log(urlQuery);
                                }
                            });
                            let jsonUrl = "http://projectware.net:8890/sparql?default-graph-uri=urn%3Asparql%3Abind%3Avamk-data&query=SELECT";
                            const endOfUrl = "+%7D%0D%0A&should-sponge=&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on&run=+Run+Query+";
                            // Combining above urls with the queries
                            jsonUrl += urlQuery;
                            jsonUrl += endOfUrl;
                            let jsonInteger = 5;
                            fetchData(jsonUrl, jsonInteger, jsonChar);
                            return (database);
                        } catch (error) {
                            return "Invalid query!";
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
                            return "Invalid query!";
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
