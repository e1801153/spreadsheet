import React, { useState, useEffect } from 'react';
import Sheet from "./Sheet";


const DataBase = () => {
    const [data, setData] = useState([]);
    useEffect(() => {
        fetchData();
    }, []);
    
    function fetchData() {
        fetch("http://projectware.net:8890/sparql?default-graph-uri=urn%3Asparql%3Abind%3Avamk-data&query=SELECT+%3Fo+WHERE+%7B+%3Fs+%3Fp+%3Fo+%7D&should-sponge=&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on&run=+Run+Query+")
            .then(response => response.json())
            .then(jsonData => {
                console.log(jsonData);
                jsonData && jsonData.results.bindings && setData(jsonData.results.bindings[3].o.value);
            })
    }

    return (      
        <div>
            {JSON.stringify(data)}
        </div>      
    )
}
export default DataBase;