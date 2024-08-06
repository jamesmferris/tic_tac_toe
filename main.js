// Gameboard module
const Gameboard = (function () {
  let board = Array(9).fill(null);

  const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // Rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // Columns
    [0, 4, 8],
    [2, 4, 6], // Diagonals
  ];

  return {
    makeMove: function (index, player) {
      if (board[index] === null) {
        board[index] = player;
        return true;
      }
      return false;
    },
    getBoard: function () {
      return [...board];
    },
    reset: function () {
      board = Array(9).fill(null);
    },
    checkWin: function (player) {
      for (let combination of winningCombinations) {
        if (combination.every((index) => board[index] === player)) {
          return combination; // Return the winning combination
        }
      }
      return null; // No winning combination found
    },
    checkTie: function () {
      return board.every((cell) => cell !== null);
    },
  };
})();

// Player factory
function PlayerFactory(name, marker) {
  return { name, marker };
}

// Game module
const Game = (function () {
  let players = [];
  let currentPlayerIndex = 0;
  let gameOver = false;

  const switchPlayer = () => {
    currentPlayerIndex = currentPlayerIndex === 0 ? 1 : 0;
  };

  return {
    start: function (player1Name, player2Name) {
      players = [PlayerFactory(player1Name, "X"), PlayerFactory(player2Name, "O")];
      Gameboard.reset();
      currentPlayerIndex = 0;
      gameOver = false;
    },
    playTurn: function (index) {
      if (gameOver) return false;

      const currentPlayer = players[currentPlayerIndex];
      if (Gameboard.makeMove(index, currentPlayer.marker)) {
        const winningCombination = Gameboard.checkWin(currentPlayer.marker);
        if (winningCombination) {
          gameOver = true;
          return { result: "win", player: currentPlayer, combination: winningCombination };
        } else if (Gameboard.checkTie()) {
          gameOver = true;
          return { result: "tie" };
        } else {
          switchPlayer();
          return { result: "continue" };
        }
      }
      return false;
    },
    getCurrentPlayer: function () {
      return players[currentPlayerIndex];
    },
    isGameOver: function () {
      return gameOver;
    },
  };
})();

// UI Controller
const UIController = (function () {
  const boardElement = document.getElementById("board");
  const messageElement = document.getElementById("message");
  const restartButton = document.getElementById("restart-button");

  const updateBoard = () => {
    const board = Gameboard.getBoard();
    boardElement.innerHTML = "";
    board.forEach((cell, index) => {
      const cellElement = document.createElement("div");
      cellElement.classList.add("cell");
      cellElement.textContent = cell || "";
      cellElement.dataset.index = index; // Add data-index attribute
      cellElement.addEventListener("click", () => makeMove(index));
      boardElement.appendChild(cellElement);
    });
  };

  const highlightWinningCombination = (combination) => {
    combination.forEach((index) => {
      const cell = boardElement.querySelector(`[data-index="${index}"]`);
      cell.classList.add("winning-cell");
    });
  };

  const makeMove = (index) => {
    const result = Game.playTurn(index);
    if (result) {
      updateBoard();
      if (result.result === "win") {
        messageElement.textContent = `${result.player.name} wins!`;
        highlightWinningCombination(result.combination);
      } else if (result.result === "tie") {
        messageElement.textContent = "It's a tie!";
      } else {
        messageElement.textContent = `${Game.getCurrentPlayer().name}'s turn`;
      }
    }
  };

  const init = () => {
    Game.start("Player 1", "Player 2");
    updateBoard();
    messageElement.textContent = `${Game.getCurrentPlayer().name}'s turn`;
    restartButton.addEventListener("click", () => {
      Game.start("Player 1", "Player 2");
      updateBoard();
      messageElement.textContent = `${Game.getCurrentPlayer().name}'s turn`;
    });
  };

  return { init };
})();

// Initialize the game
document.addEventListener("DOMContentLoaded", UIController.init);
