// static/js/games/WordleGame.js
// Wordle-like game for Python learners

const PYTHON_WORDLE_WORDS = [
    'tuple', 'class', 'yield', 'print', 'input',
    'slice', 'range', 'float', 'async', 'super'
];

function getTodayWord() {
    // Pick a word based on the date (rotates daily)
    const start = new Date(2025, 0, 1); // Jan 1, 2025
    const today = new Date();
    const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
    return PYTHON_WORDLE_WORDS[diff % PYTHON_WORDLE_WORDS.length];
}

class WordleGame {
    constructor(containerId, onWin) {
        this.container = document.getElementById(containerId);
        this.word = getTodayWord();
        this.maxRows = 6;
        this.wordLength = 5;
        this.currentRow = 0;
        this.currentCol = 0;
        this.grid = Array.from({ length: this.maxRows }, () => Array(this.wordLength).fill(''));
        this.statusGrid = Array.from({ length: this.maxRows }, () => Array(this.wordLength).fill(''));
        this.keyboardStatus = {};
        this.onWin = onWin;
        this.finished = false;
        this.render();
        this.setupListeners();
    }

    render() {
        if (!this.container) return;
        this.container.innerHTML = `
            <div class="wordle-board">
                ${this.grid.map((row, r) => `
                    <div class="wordle-row">
                        ${row.map((letter, c) => `
                            <div class="wordle-cell ${this.statusGrid[r][c]}">${letter}</div>
                        `).join('')}
                    </div>
                `).join('')}
            </div>
            <div class="wordle-keyboard">
                ${this.renderKeyboard()}
            </div>
        `;
    }

    renderKeyboard() {
        const keys = [
            ['q','w','e','r','t','y','u','i','o','p'],
            ['a','s','d','f','g','h','j','k','l'],
            ['Enter','z','x','c','v','b','n','m','Backspace']
        ];
        return keys.map(row => `
            <div class="wordle-key-row">
                ${row.map(k => `
                    <button class="wordle-key ${this.keyboardStatus[k]||''}" data-key="${k}">${k==='Backspace'?'⌫':k}</button>
                `).join('')}
            </div>
        `).join('');
    }

    setupListeners() {
        this.container.addEventListener('click', (e) => {
            if (e.target.classList.contains('wordle-key')) {
                this.handleKey(e.target.dataset.key);
            }
        });
        document.addEventListener('keydown', this.handlePhysicalKey);
    }

    handlePhysicalKey = (e) => {
        if (this.finished) return;
        let key = e.key;
        if (key === 'Backspace') key = 'Backspace';
        if (key === 'Enter') key = 'Enter';
        if (/^[a-zA-Z]$/.test(key)) key = key.toLowerCase();
        if (key.length === 1 || key === 'Enter' || key === 'Backspace') {
            this.handleKey(key);
        }
    }

    handleKey(key) {
        if (this.finished) return;
        if (/^[a-z]$/.test(key) && this.currentCol < this.wordLength) {
            this.grid[this.currentRow][this.currentCol] = key;
            this.currentCol++;
        } else if (key === 'Backspace' && this.currentCol > 0) {
            this.currentCol--;
            this.grid[this.currentRow][this.currentCol] = '';
        } else if (key === 'Enter' && this.currentCol === this.wordLength) {
            this.submitRow();
        }
        this.render();
    }

    submitRow() {
        const guess = this.grid[this.currentRow].join('');
        if (guess.length !== this.wordLength) return;
        // Check guess
        const answer = this.word;
        const status = Array(this.wordLength).fill('absent');
        const answerArr = answer.split('');
        const guessArr = guess.split('');
        // First pass: correct
        for (let i = 0; i < this.wordLength; i++) {
            if (guessArr[i] === answerArr[i]) {
                status[i] = 'correct';
                answerArr[i] = null;
            }
        }
        // Second pass: present
        for (let i = 0; i < this.wordLength; i++) {
            if (status[i] === 'correct') continue;
            const idx = answerArr.indexOf(guessArr[i]);
            if (idx !== -1) {
                status[i] = 'present';
                answerArr[idx] = null;
            }
        }
        this.statusGrid[this.currentRow] = status;
        // Update keyboard
        for (let i = 0; i < this.wordLength; i++) {
            const k = guessArr[i];
            if (status[i] === 'correct') this.keyboardStatus[k] = 'correct';
            else if (status[i] === 'present' && this.keyboardStatus[k] !== 'correct') this.keyboardStatus[k] = 'present';
            else if (status[i] === 'absent' && !this.keyboardStatus[k]) this.keyboardStatus[k] = 'absent';
        }
        // Win/Lose
        if (guess === answer) {
            this.finished = true;
            this.render();
            if (this.onWin) this.onWin();
            return;
        }
        this.currentRow++;
        this.currentCol = 0;
        if (this.currentRow >= this.maxRows) {
            this.finished = true;
            this.render();
            setTimeout(() => alert(`Out of tries! The word was: ${answer}`), 100);
        }
    }
}

window.WordleGame = WordleGame;
