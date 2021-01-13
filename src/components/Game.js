import React, { useState } from "react";
import Board from "./Board";

export default function Game() {
  const [rows, setRows] = useState(4);
  const [cols, setCols] = useState(4);

  return (
    <div className="container">
      <Board rows={rows} cols={cols} />
    </div>
  );
}
