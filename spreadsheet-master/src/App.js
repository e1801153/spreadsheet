import React from "react";
import { Reset } from "styled-reset";
import Database from "./Database";

import Sheet from "./Sheet";

const App = () => {
  return (
    <>
          <Reset />
          <Sheet numberOfRows={10} numberOfColumns={10} />
          <Database/>
      </>
  );
};

export default App;