import React, { useState, useEffect, useMemo } from "react";
import Square from "./Square";
import "../css/Board.css";
const createInitialBoard = (rows, cols, maxBombCount) => {
  let initailBoard = {};
  let bombsPositions = getBombsPositions(rows, cols, maxBombCount);
  for (let i = 0; i < rows; i++) {
    initailBoard[i] = Array(cols).fill(null);
    for (let j = 0; j < cols; j++) {
      if (bombsPositions[i] && bombsPositions[i][j] === 1) {
        initailBoard[i][j] = -1;
      } else {
        let adjacentBombCount = getAdjacentBombCountForPosition(
          i,
          j,
          bombsPositions
        );
        initailBoard[i][j] = adjacentBombCount;
      }
    }
  }
  return initailBoard;
};

const getRandomNumber = (maxNum) => {
  return Math.floor(Math.random() * maxNum);
};

const getBombsPositions = (rows, cols, maxBomb) => {
  let bombs = {};
  let totalBombs = 0;
  while (true) {
    let bombRow = getRandomNumber(rows);
    let bombCol = getRandomNumber(cols);
    let bombPresent = bombs[bombRow] && bombs[bombRow].includes(bombCol);

    if (!bombPresent) {
      if (!bombs[bombRow]) {
        bombs[bombRow] = [];
      }
      bombs[bombRow][bombCol] = 1;
      totalBombs++;
    }
    if (totalBombs == maxBomb) {
      break;
    }
  }
  return bombs;
};

const getAdjacentBombCountForPosition = (row, col, bombsPostions) => {
  let prevRow = row - 1;
  let nextRow = row + 1;
  let prevCol = col - 1;
  let nextCol = col + 1;
  let count = 0;

  //position is already a bomb
  if (bombsPostions[row] && bombsPostions[row][col]) return -1;

  if (bombsPostions[prevRow] && bombsPostions[prevRow][prevCol]) count++;
  if (bombsPostions[prevRow] && bombsPostions[prevRow][col]) count++;
  if (bombsPostions[prevRow] && bombsPostions[prevRow][nextCol]) count++;
  if (bombsPostions[row] && bombsPostions[row][prevCol]) count++;
  if (bombsPostions[row] && bombsPostions[row][col]) count++;
  if (bombsPostions[row] && bombsPostions[row][nextCol]) count++;
  if (bombsPostions[nextRow] && bombsPostions[nextRow][prevCol]) count++;
  if (bombsPostions[nextRow] && bombsPostions[nextRow][col]) count++;
  if (bombsPostions[nextRow] && bombsPostions[nextRow][nextCol]) count++;

  return count;
};

const openedSquaresInitial = (row, col) => {
  let openedSquares = {};
  for (let i = 0; i < row; i++) {
    openedSquares[i] = Array(col).fill(0);
  }
  return openedSquares;
};

export default function Board() {
  const [board, setBoard] = useState({});
  const [gameOver, setGameOver] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [gameMessage, setGameMessage] = useState("");
  const [gameType, setGameType] = useState("easy");
  const [openedSquares, setOpenedSquares] = useState({});
  const [rows, setRows] = useState(8);
  const [cols, setCols] = useState(8);

  const maxBombCount = useMemo(() => {
    return (() => {
      let percentage;
      switch (gameType) {
        case "easy":
          percentage = 15;
          break;
        default:
          percentage = 15;
      }
      return Math.floor(rows * cols * (percentage / 100));
    })();
  }, [rows, cols]);

  useEffect(() => {
    setBoard(createInitialBoard(rows, cols, maxBombCount));
    setOpenedSquares(openedSquaresInitial(rows, cols));
  }, []);

  useEffect(() => {
    checkFinish();
  }, [openedSquares]);

  const handleSquareClick = (e) => {
    let elem = e.target;
    let row = elem.dataset["row"];
    let col = elem.dataset["col"];
    let openedRow = [...openedSquares[row]];
    if (!gameOver) {
      openedRow[col] = 1;
      if (board[row][col] === -1) {
        setGameOver(true);
        setGameMessage("You have clicked on a mine. Game Over !!!");
        setOpenedSquares((openedSquares) => {
          return { ...openedSquares, [row]: openedRow };
        });
      } else if (board[row][col] > 0) {
        setOpenedSquares((openedSquares) => {
          return { ...openedSquares, [row]: openedRow };
        });
      } else {
        let openThePositions = getAdjacentPositionsToOpen(row, col);
        Object.keys(openThePositions).map((row) => {
          let openedRow = [...openedSquares[row]];
          openThePositions[row].map((col) => {
            openedRow[col] = 1;
          });
          setOpenedSquares((openedSquares) => {
            return { ...openedSquares, [row]: openedRow };
          });
        });
      }
    }
  };

  const getAdjacentPositionsToOpen = (row, col) => {
    let queue = [];
    let allPositions = {};
    row = parseInt(row);
    col = parseInt(col);
    for (let i = 0; i < rows; i++) {
      allPositions[i] = [];
    }
    queue.push([row, col]);
    while (queue.length > 0) {
      let position = queue.shift();
      let positionRow = position[0];
      let positionCol = position[1];
      let previousRow = positionRow - 1;
      let nextRow = positionRow + 1;
      let previousCol = positionCol - 1;
      let nextCol = positionCol + 1;

      if (!allPositions[positionRow].includes(positionCol))
        allPositions[positionRow].push(positionCol);

      //check left position
      if (board[positionRow][previousCol] === 0) {
        if (
          !allPositions[positionRow] ||
          !allPositions[positionRow].includes(previousCol)
        )
          queue.push([positionRow, previousCol]);
      } else if (board[positionRow][previousCol] > 0) {
        allPositions[positionRow].push(previousCol);
      }

      //check right positon
      if (board[positionRow][nextCol] == 0) {
        if (
          !allPositions[positionRow] ||
          !allPositions[positionRow].includes(nextCol)
        )
          queue.push([positionRow, nextCol]);
      } else if (board[positionRow][nextCol] > 0) {
        allPositions[positionRow].push(nextCol);
      }

      //check bottom position
      if (board[previousRow] && board[previousRow][positionCol] == 0) {
        if (
          !allPositions[previousRow] ||
          !allPositions[previousRow].includes(positionCol)
        )
          queue.push([previousRow, positionCol]);
      } else if (board[previousRow] && board[previousRow][positionCol] > 0) {
        allPositions[previousRow].push(positionCol);
      }

      //check the top postion
      if (board[nextRow] && board[nextRow][positionCol] == 0) {
        if (
          !allPositions[nextRow] ||
          !allPositions[nextRow].includes(positionCol)
        )
          queue.push([nextRow, positionCol]);
      } else if (board[nextRow] && board[nextRow][positionCol] > 0) {
        allPositions[nextRow].push(positionCol);
      }

      //check corners, if value greater than 0 then open it
      if (board[previousRow] && board[previousRow][previousCol] > 0) {
        allPositions[previousRow].push(previousCol);
      }
      if (board[previousRow] && board[previousRow][nextCol] > 0) {
        allPositions[previousRow].push(nextCol);
      }
      if (board[nextRow] && board[nextRow][previousCol] > 0) {
        allPositions[nextRow].push(previousCol);
      }
      if (board[nextRow] && board[nextRow][nextCol] > 0) {
        allPositions[nextRow].push(nextCol);
      }
    }
    return allPositions;
  };

  const checkFinish = () => {
    let openedSquaresCount = 0;
    Object.keys(openedSquares).map((row) => {
      openedSquaresCount += openedSquares[row].filter((data) => data === 1)
        .length;
    });
    if (openedSquaresCount === rows * cols - maxBombCount) {
      setGameFinished(true);
      setGameMessage("You have successfully completed the game");
    }
  };

  const handleReset = () => {
    setBoard(createInitialBoard(rows, cols, maxBombCount));
    setOpenedSquares(openedSquaresInitial(rows, cols));
    setGameOver(false);
    setGameMessage("");
    setGameFinished(false);
  };

  console.log(board);

  return (
    <div className="container mt-10">
      <div>
        <h3>Minesweeper</h3>
      </div>
      {gameOver ? <div className="alert alert-danger">{gameMessage}</div> : ""}
      {gameFinished ? (
        <div className="alert alert-success">{gameMessage}</div>
      ) : (
        ""
      )}
      <div className="mb-10">
        <button className="btn btn-primary" onClick={handleReset}>
          Reset
        </button>
      </div>
      <div className="board">
        {Object.keys(board).map((row, index) => {
          row = parseInt(row);
          return (
            <div
              className="row align-center"
              key={String(index) + Math.floor(Math.random() * 1000)}
            >
              {board[row].map((value, index1) => {
                let col = index1;
                let hideDetail = openedSquares[row][col] == 0 ? true : false;
                {
                  return (
                    <Square
                      key={index1}
                      row={row}
                      col={col}
                      value={value}
                      hideDetail={hideDetail}
                      handleSquareClick={handleSquareClick}
                    />
                  );
                }
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
