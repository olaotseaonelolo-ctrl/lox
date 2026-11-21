const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');
const restartBtn = document.getElementById('restartBtn');
const resetScoreBtn = document.getElementById('resetScoreBtn');
const difficultySelect = document.getElementById('difficulty');

const playerScoreEl = document.getElementById('playerScore');
const aiScoreEl = document.getElementById('aiScore');
const drawScoreEl = document.getElementById('drawScore');

let board = ["", "", "", "", "", "", "", "", ""];
let gameActive = true;
let isAiTurn = false;
let scoresCount = { X: 0, O: 0, TIE: 0 };

const HUMAN = "X";
const AI = "O";

const winConditions = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

function handleCellClick(e) {
  const index = e.target.getAttribute('data-index');
  if (board[index] !== "" || !gameActive || isAiTurn) return;

  makeMove(index, HUMAN);

  if (gameActive) {
    isAiTurn = true;
    statusText.textContent = "AI is thinking...";
    setTimeout(() => {
      const move = getAiMove();
      makeMove(move, AI);
      isAiTurn = false;
    }, 250);
  }
}

function makeMove(index, player) {
  board[index] = player;
  cells[index].textContent = player;
  cells[index].classList.add(player.toLowerCase(), 'taken');

  const result = checkWinner(board);
  if (result) {
    gameActive = false;
    if (result.winner === "TIE") {
      statusText.textContent = "It's a draw!";
      scoresCount.TIE++;
      drawScoreEl.textContent = scoresCount.TIE;
    } else {
      statusText.textContent = result.winner === HUMAN ? "You win!" : "AI wins!";
      scoresCount[result.winner]++;
      updateScoreDisplay();
      highlightWinningCells(result.line);
    }
  } else {
    statusText.textContent = player === HUMAN ? "AI's turn (O)" : "Your turn (X)";
  }
}

function highlightWinningCells(line) {
  line.forEach(index => cells[index].classList.add('win'));
}

function updateScoreDisplay() {
  playerScoreEl.textContent = scoresCount.X;
  aiScoreEl.textContent = scoresCount.O;
}

function checkWinner(currentBoard) {
  for (let condition of winConditions) {
    const [a, b, c] = condition;
    if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
      return { winner: currentBoard[a], line: condition };
    }
  }
  return currentBoard.includes("") ? null : { winner: "TIE", line: [] };
}

// --- AI MOVE SELECTION BY DIFFICULTY ---
function getAiMove() {
  const difficulty = difficultySelect.value;
  const available = board.map((val, idx) => val === "" ? idx : null).filter(val => val !== null);

  if (difficulty === "easy") {
    return available[Math.floor(Math.random() * available.length)];
  }

  if (difficulty === "medium" && Math.random() < 0.5) {
    return available[Math.floor(Math.random() * available.length)];
  }

  return getBestMove();
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

const minimaxScores = { O: 10, X: -10, TIE: 0 };

function minimax(currentBoard, depth, isMaximizing) {
  const result = checkWinner(currentBoard);
  if (result !== null) {
    const winner = result.winner;
    return winner === AI ? minimaxScores[winner] - depth : winner === HUMAN ? minimaxScores[winner] + depth : 0;
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
  isAiTurn = false;
  statusText.textContent = "Your turn (X)";
  cells.forEach(cell => {
    cell.textContent = "";
    cell.classList.remove('x', 'o', 'taken', 'win');
  });
}

function resetScores() {
  scoresCount = { X: 0, O: 0, TIE: 0 };
  playerScoreEl.textContent = 0;
  aiScoreEl.textContent = 0;
  drawScoreEl.textContent = 0;
  restartGame();
}

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
restartBtn.addEventListener('click', restartGame);
resetScoreBtn.addEventListener('click', resetScores);
difficultySelect.addEventListener('change', restartGame);
