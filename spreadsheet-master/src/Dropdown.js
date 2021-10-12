import React from "react";
import { Dropdown as StyledDropdown } from "./styles";
import ReactDOM from "react-dom";
import App from "./App";

const Dropdown = () => {


    return (
    <StyledDropdown>
            <label>
                Select a value:
                <select>
                    <option value="1">42</option>
                    <option value="2">81</option>
                    <option value="3">531</option>
                    <option value="4">910</option>
                </select>
            </label>
            <input type="submit" value="Submit" />
    </StyledDropdown>
    );
};

export default Dropdown;