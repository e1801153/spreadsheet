import React from "react";
import { Import as StyledImport } from "./styles";
import ReactDOM from "react-dom";
import App from "./App";

const Import = () => {


    return (
        <StyledImport>
            <form>
                Import external data:
                <input type="file" id="myFile" name="filename"></input>
            </form>
        </StyledImport>
    );
};

export default Import;