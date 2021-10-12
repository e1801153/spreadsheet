import React from "react";
import { Reset } from "styled-reset";
import Dropdown from "./Dropdown";
import Import from "./Import";

import Sheet from "./Sheet";

const App = () => {
  return (
    <>
          <Reset />
          <table>
              <tr>
                   <th><Import /></th>
                   <th><Dropdown /></th>
                </tr>
              </table>
          <Sheet numberOfRows={10} numberOfColumns={10} />
          
      </>
  );
};

export default App;