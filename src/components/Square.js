import React from "react";
import "../css/square.css";

export default function Square({
  row,
  col,
  value,
  hideDetail,
  handleSquareClick,
}) {
  let allClassNames = hideDetail
    ? `square hide-detail`
    : value === -1
    ? "square bomb"
    : "square";
  return (
    <button
      data-row={row}
      data-col={col}
      className={allClassNames}
      onClick={handleSquareClick}
    >
      {hideDetail ? "" : value ? value : ""}
    </button>
  );
}
