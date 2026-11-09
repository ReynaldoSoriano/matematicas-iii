/*
 * Mejoras para la práctica interactiva.
 * Inclúyase después del script principal con:
 * <script src="quiz-enhancements.js"></script>
 */
(() => {
    const shuffle = (items) => {
        const shuffled = [...items];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    let questionOrder = [];
    let runScore = 0;
    let bestScore = 0;
    let runComplete = false;

    function updateScoreBadge() {
        document.getElementById('quiz-score-badge').innerText = `${runScore} / ${quizBank.length}`;
    }

    function getOrCreateSummary() {
        let summary = document.getElementById('quiz-summary-box');
        if (!summary) {
            summary = document.createElement('div');
            summary.id = 'quiz-summary-box';
            summary.className = 'hidden mt-5 p-5 rounded-xl border border-indigo-200 bg-indigo-50 text-center';
            document.getElementById('quiz-card').appendChild(summary);
        }
        return summary;
    }

    function finishQuiz() {
        runComplete = true;
        bestScore = Math.max(bestScore, runScore);
        document.getElementById('quiz-next-btn').classList.add('hidden');
        const summary = getOrCreateSummary();
        summary.innerHTML = `
            <h3 class="text-lg font-bold text-indigo-900">¡Práctica terminada!</h3>
            <p class="mt-2 text-sm text-indigo-800">Aciertos en este intento: <strong>${runScore} de ${quizBank.length}</strong></p>
            <p class="text-xs text-indigo-700 mt-1">Mejor puntuación: <strong>${bestScore} de ${quizBank.length}</strong></p>
            <button id="quiz-retry-btn" type="button" class="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2 rounded-xl text-sm shadow transition">
                <i class="fa-solid fa-rotate-right mr-1"></i> Responder de nuevo
            </button>`;
        summary.classList.remove('hidden');
        document.getElementById('quiz-retry-btn').addEventListener('click', startNewRun);
    }

    function startNewRun() {
        runScore = 0;
        runComplete = false;
        questionOrder = shuffle(quizBank.map((_, index) => index));
        updateScoreBadge();
        getOrCreateSummary().classList.add('hidden');
        loadQuizQuestion();
    }

    window.loadQuizQuestion = function() {
        if (!questionOrder.length) questionOrder = shuffle(quizBank.map((_, index) => index));
        quizAnswered = false;
        quizIdx = questionOrder.shift();
        const question = quizBank[quizIdx];

        document.getElementById('quiz-category').innerText = question.type;
        document.getElementById('quiz-question-text').innerHTML = question.q;

        const optionsGrid = document.getElementById('quiz-options-grid');
        optionsGrid.innerHTML = '';
        const shuffledOptions = shuffle(question.options.map((text, originalIndex) => ({
            text,
            isCorrect: originalIndex === question.correct
        })));

        shuffledOptions.forEach((option) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'w-full text-left p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition font-medium text-slate-700 flex justify-between items-center text-sm';
            button.innerHTML = `<span>${option.text}</span> <i class="fa-regular fa-circle text-slate-300"></i>`;
            button.onclick = () => answerQuiz(option.isCorrect, button, shuffledOptions);
            optionsGrid.appendChild(button);
        });

        document.getElementById('quiz-feedback-box').className = 'hidden p-4 rounded-xl text-xs md:text-sm font-medium';
        document.getElementById('quiz-next-btn').classList.add('hidden');
        getOrCreateSummary().classList.add('hidden');
        updateScoreBadge();
        renderMath(document.getElementById('quiz-card'));
    };

    window.answerQuiz = function(isCorrect, selectedButton, shuffledOptions) {
        if (quizAnswered || runComplete) return;
        quizAnswered = true;
        const question = quizBank[quizIdx];
        const buttons = [...document.getElementById('quiz-options-grid').children];

        if (isCorrect) {
            runScore++;
            selectedButton.className = 'w-full text-left p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50 text-emerald-900 font-bold flex justify-between items-center text-sm';
            selectedButton.innerHTML = `<span>${selectedButton.querySelector('span').textContent}</span> <i class="fa-solid fa-circle-check text-emerald-600"></i>`;
        } else {
            selectedButton.className = 'w-full text-left p-4 rounded-xl border-2 border-rose-500 bg-rose-50 text-rose-900 font-bold flex justify-between items-center text-sm';
            selectedButton.innerHTML = `<span>${selectedButton.querySelector('span').textContent}</span> <i class="fa-solid fa-circle-xmark text-rose-600"></i>`;
            const correctIndex = shuffledOptions.findIndex((option) => option.isCorrect);
            buttons[correctIndex].className = 'w-full text-left p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50 text-emerald-900 font-bold flex justify-between items-center text-sm';
            buttons[correctIndex].innerHTML = `<span>${shuffledOptions[correctIndex].text}</span> <i class="fa-solid fa-circle-check text-emerald-600"></i>`;
        }

        updateScoreBadge();
        const feedback = document.getElementById('quiz-feedback-box');
        feedback.className = isCorrect
            ? 'p-4 rounded-xl text-xs md:text-sm font-medium bg-emerald-50 text-emerald-800 border border-emerald-200'
            : 'p-4 rounded-xl text-xs md:text-sm font-medium bg-rose-50 text-rose-800 border border-rose-200';
        feedback.innerHTML = `<strong>Explicación:</strong> ${question.exp}`;
        feedback.classList.remove('hidden');
        renderMath(feedback);

        if (questionOrder.length > 0) {
            document.getElementById('quiz-next-btn').classList.remove('hidden');
        } else {
            finishQuiz();
        }
    };

    window.loadNextQuiz = function() {
        if (!quizAnswered || runComplete) return;
        loadQuizQuestion();
    };

    window.addEventListener('load', startNewRun);
})();
