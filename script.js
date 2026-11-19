const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');
const restartBtn = document.getElementById('restartBtn');

let board = ["", "", "", "", "", "", "", "", ""];
let gameActive = true;
const HUMAN = "X";
const AI = "O";

const winConditions = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

function handleCellClick(e) {
  const index = e.target.getAttribute('data-index');
  if (board[index] !== "" || !gameActive) return;

  makeMove(index, HUMAN);

  if (gameActive) {
    statusText.textContent = "AI is thinking...";
    setTimeout(() => {
      const bestMove = getBestMove();
      makeMove(bestMove, AI);
    }, 200); // Slight delay feels more natural
  }
}

function makeMove(index, player) {
  board[index] = player;
  cells[index].textContent = player;
  cells[index].classList.add(player.toLowerCase());

  const winner = checkWinner(board);
  if (winner) {
    gameActive = false;
    statusText.textContent = winner === "TIE" ? "It's a draw!" : `${winner} wins!`;
  } else {
    statusText.textContent = player === HUMAN ? "AI's turn (O)" : "Your turn (X)";
  }
}

function checkWinner(currentBoard) {
  for (let condition of winConditions) {
    const [a, b, c] = condition;
    if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
      return currentBoard[a];
    }
  }
  return currentBoard.includes("") ? null : "TIE";
}

// --- MINIMAX ALGORITHM ---
function getBestMove() {
  let bestScore = -Infinity;
  let move;

  for (let i = 0; i < 9; i++) {
    if (board[i] === "") {
      board[i] = AI;
      let score = minimax(board, 0, false);
      board[i] = "";
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

const scores = { O: 10, X: -10, TIE: 0 };

function minimax(currentBoard, depth, isMaximizing) {
  let result = checkWinner(currentBoard);
  if (result !== null) {
    // Subtract/add depth so the AI prefers faster wins and slower losses
    return result === AI ? scores[result] - depth : result === HUMAN ? scores[result] + depth : 0;
  }

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (currentBoard[i] === "") {
        currentBoard[i] = AI;
        let score = minimax(currentBoard, depth + 1, false);
        currentBoard[i] = "";
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (currentBoard[i] === "") {
        currentBoard[i] = HUMAN;
        let score = minimax(currentBoard, depth + 1, true);
        currentBoard[i] = "";
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

function restartGame() {
  board = ["", "", "", "", "", "", "", "", ""];
  gameActive = true;
  statusText.textContent = "Your turn (X)";
  cells.forEach(cell => {
    cell.textContent = "";
    cell.classList.remove('x', 'o');
  });
}

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
restartBtn.addEventListener('click', restartGame);
