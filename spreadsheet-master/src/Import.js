import React from "react";
import { Import as StyledImport } from "./styles";
import ReactDOM from "react-dom";
import App from "./App";

const Import = () => {


    return (
        <StyledImport>
            Import external data: 
            <input type="submit" value="Choose file" />
        </StyledImport>
    );
};

export default Import;