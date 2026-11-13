// Nonaktifkan pemulihan posisi scroll otomatis browser
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

if (window.location.hash) {
  history.replaceState(null, null, window.location.pathname + window.location.search);
}

window.scrollTo(0, 0);

document.addEventListener("DOMContentLoaded", function () {
  const btnBackToTop = document.getElementById("btnBackToTop");
  if (btnBackToTop) {
    window.onscroll = function () {
      if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
        btnBackToTop.style.display = "block";
      } else {
        btnBackToTop.style.display = "none";
      }
    };

    btnBackToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
});

// ==========================================
// BUNGKUS UTAMA KUIS (Agar aman dipanggil via Fetch)
// ==========================================
window.initAkarQuiz = function() {
    const stepChapter = document.getElementById('step-chapter');
    if (!stepChapter) return; // Pengaman jika elemen belum mendarat

    // Bank Soal
    const bankSoal = {
        bulat: {
            1: [
                { level: "Level 1", question: "Berapakah hasil dari akar kuadrat sempurna dari $\\sqrt{529}$?", options: ["21", "23", "27", "29"], answer: 1, explanation: "Pecah $5 \\mid 29$ (belakang 9). Kuadrat terdekat untuk 5 adalah 2 ($2^2=4$). Jawaban yang tepat adalah 23." },
                { level: "Level 1", question: "Berapakah nilai dari $\\sqrt{576}$?", options: ["24", "26", "16", "34"], answer: 0, explanation: "Pecah $5 \\mid 76$ (belakang 6). Hasil yang tepat adalah 24." },
                { level: "Level 1", question: "Berapakah hasil dari $\\sqrt{676}$?", options: ["24", "26", "34", "36"], answer: 1, explanation: "Pecah $6 \\mid 76$ (belakang 6). Hasil yang tepat adalah 26." },
                { level: "Level 1", question: "Berapakah nilai dari $\\sqrt{729}$?", options: ["23", "27", "37", "21"], answer: 1, explanation: "Pecah $7 \\mid 29$ (belakang 9). Hasil yang tepat adalah 27." },
                { level: "Level 1", question: "Berapakah akar kuadrat dari $\\sqrt{784}$?", options: ["26", "28", "32", "38"], answer: 1, explanation: "Pecah $7 \\mid 84$ (belakang 4). Hasil yang tepat adalah 28." }
            ],
            // ... (lanjutan bab lainnya tetap sama)
        }
    };

    let selectedChapter = '';
    let currentQuestions = [];
    let currentIndex = 0;
    let score = 0;

    window.selectChapter = function(chapterKey) {
        selectedChapter = chapterKey;
        document.getElementById('step-chapter').style.display = 'none';
        document.getElementById('step-level').style.display = 'flex';
        document.getElementById('menu-instruction').innerText = "Pilih tingkat kesulitan (Level):";
    };

    window.selectLevel = function(levelNum) {
        if (!selectedChapter || !bankSoal[selectedChapter] || !bankSoal[selectedChapter][levelNum]) return;
        currentQuestions = [...bankSoal[selectedChapter][levelNum]];
        currentIndex = 0;
        score = 0;

        document.getElementById('step-level').style.display = 'none';
        document.getElementById('quiz-container').style.display = 'block';
        document.getElementById('quiz-result').style.display = 'none';

        loadQuestion();
    };

    function loadQuestion() {
        if (!currentQuestions.length) return;
        const q = currentQuestions[currentIndex];
        
        document.getElementById('question-progress').innerHTML = `Soal ${currentIndex + 1} dari ${currentQuestions.length} &bull; <span style="color:#2563eb; font-weight:600;">${q.level}</span>`;
        document.getElementById('question-text').innerHTML = q.question;

        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';

        q.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'btn-option';
            btn.innerHTML = opt;
            btn.onclick = () => selectOption(idx, btn);
            optionsContainer.appendChild(btn);
        });

        document.getElementById('feedback-box').style.display = 'none';
        document.getElementById('next-btn').style.display = 'none';

        if (window.MathJax && window.MathJax.typeset) {
            window.MathJax.typeset();
        }
    }

    function selectOption(selectedIndex, selectedBtn) {
        const q = currentQuestions[currentIndex];
        const optionButtons = document.querySelectorAll('.btn-option');

        optionButtons.forEach(btn => btn.disabled = true);

        const feedbackBox = document.getElementById('feedback-box');
        feedbackBox.style.display = 'block';

        if (selectedIndex === q.answer) {
            selectedBtn.classList.add('correct');
            feedbackBox.innerHTML = `<strong>✔ Benar!</strong> ${q.explanation}`;
            feedbackBox.style.background = '#f0fdf4';
            feedbackBox.style.color = '#166534';
            score++;
        } else {
            selectedBtn.classList.add('incorrect');
            if (optionButtons[q.answer]) {
                optionButtons[q.answer].classList.add('correct');
            }
            feedbackBox.innerHTML = `<strong>✖ Kurang tepat.</strong> ${q.explanation}`;
            feedbackBox.style.background = '#fef2f2';
            feedbackBox.style.color = '#991b1b';
        }

        if (window.MathJax && window.MathJax.typeset) {
            window.MathJax.typeset();
        }

        document.getElementById('next-btn').style.display = 'block';
    }

    window.nextQuestion = function() {
        currentIndex++;
        if (currentIndex < currentQuestions.length) {
            loadQuestion();
        } else {
            showResult();
        }
    };

    function showResult() {
        document.getElementById('quiz-container').style.display = 'none';
        document.getElementById('quiz-result').style.display = 'block';

        document.getElementById('score-text').innerText = `Skor kamu: ${score} dari ${currentQuestions.length}`;
        
        const messageEl = document.getElementById('score-message');
        if (score === currentQuestions.length) {
            messageEl.innerText = "🏆 Sempurna! Kamu berhasil menjawab semua soal di level ini dengan benar!";
        } else if (score >= 3) {
            messageEl.innerText = "👍 Bagus sekali! Pertahankan ketelitianmu untuk level berikutnya.";
        } else {
            messageEl.innerText = "💪 Tetap semangat! Coba pelajari materinya lagi lalu taklukkan level ini.";
        }
    }

    window.backToChapter = function() {
        document.getElementById('step-chapter').style.display = 'flex';
        document.getElementById('step-level').style.display = 'none';
        document.getElementById('menu-instruction').innerText = "Pilih bab materi yang ingin kamu uji:";
    };

    window.backToLevel = function() {
        document.getElementById('step-level').style.display = 'flex';
        document.getElementById('quiz-container').style.display = 'none';
        document.getElementById('quiz-result').style.display = 'none';
        document.getElementById('menu-instruction').innerText = "Pilih tingkat kesulitan (Level):";
    };
};
