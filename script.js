window.initBkQuiz = function () {
  // State Pengaturan
  const config = {
    num1: { min: 1, max: 9, isCustom: false },
    num2: { min: 1, max: 9, isCustom: false },
    qType: "plain", // 'plain' | 'story' | 'mixed'
    aMode: "essay"  // 'essay' | 'mc'
  };

  let currentQ = { a: 0, b: 0, answer: 0 };

  // Elemen DOM
  const setupView = document.getElementById("bk-setup-view");
  const practiceView = document.getElementById("bk-practice-view");
  const startBtn = document.getElementById("bk-start-btn");
  const backBtn = document.getElementById("bk-back-btn");
  const nextBtn = document.getElementById("bk-next-btn");
  const checkBtn = document.getElementById("bk-check-btn");
  const essayInput = document.getElementById("bk-essay-input");
  const essayArea = document.getElementById("bk-essay-area");
  const mcArea = document.getElementById("bk-mc-area");
  const questionText = document.getElementById("bk-question-text");
  const modeIndicator = document.getElementById("bk-mode-indicator");
  const feedbackBox = document.getElementById("bk-feedback-box");
  const feedbackTitle = document.getElementById("bk-feedback-title");
  const feedbackDesc = document.getElementById("bk-feedback-desc");
  const hintBox = document.getElementById("bk-hint-box");

  // Jika elemen kuis belum ada di halaman, hentikan agar tidak error
  if (!setupView) return;

  // Handler Pilihan Range (Num 1 & Num 2)
  document.querySelectorAll(".bk-pill-group[data-target]").forEach(group => {
    const target = group.getAttribute("data-target");
    const customBox = document.getElementById(`${target}-custom-box`);

    group.querySelectorAll(".bk-pill").forEach(btn => {
      btn.addEventListener("click", () => {
        group.querySelectorAll(".bk-pill").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        if (btn.dataset.custom === "true") {
          config[target].isCustom = true;
          customBox.classList.remove("hidden");
        } else {
          config[target].isCustom = false;
          config[target].min = parseInt(btn.dataset.min, 10);
          config[target].max = parseInt(btn.dataset.max, 10);
          customBox.classList.add("hidden");
        }
      });
    });
  });

  // Handler Pilihan Jenis Soal & Mode Jawaban
  function setupSinglePillGroup(groupId, configKey) {
    const group = document.getElementById(groupId);
    if (!group) return;
    group.querySelectorAll(".bk-pill").forEach(btn => {
      btn.addEventListener("click", () => {
        group.querySelectorAll(".bk-pill").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        config[configKey] = btn.dataset.val;
      });
    });
  }
  setupSinglePillGroup("question-type-group", "qType");
  setupSinglePillGroup("answer-mode-group", "aMode");

  // Helper Format Angka Ribuan (Indonesia)
  function formatNum(n) {
    return n.toLocaleString("id-ID");
  }

  // Helper Random Integer
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Template Soal Cerita
  function buildStoryQuestion(a, b) {
    const fA = formatNum(a);
    const fB = formatNum(b);
    const templates = [
      `Sebuah minimarket menerima kiriman <strong>${fA}</strong> kardus mi instan. Jika setiap kardus berisi <strong>${fB}</strong> bungkus, berapa total seluruh bungkus mi instan tersebut?`,
      `Seorang pekerja menempuh perjalanan pulang-pergi sejauh <strong>${fA}</strong> km setiap hari. Berapa total jarak yang ia tempuh dalam <strong>${fB}</strong> hari kerja?`,
      `Sebuah gudang logistik menyusun <strong>${fA}</strong> palet barang. Jika setiap palet memuat <strong>${fB}</strong> kotak komponen, berapa jumlah seluruh kotak komponen yang ada?`,
      `Harga satu porsi makanan di kantin adalah Rp<strong>${fA}</strong>. Jika kamu memesan sebanyak <strong>${fB}</strong> porsi untuk acara rapat, berapa total biaya yang harus dibayar?`,
      `Sebuah lahan perkebunan ditanami <strong>${fA}</strong> baris pohon. Jika setiap baris terdiri dari <strong>${fB}</strong> pohon, berapa total pohon di perkebunan tersebut?`
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  // Logika Petunjuk Pintar Sesuai Artikel Blog
  function getSmartHint(a, b) {
    if (a >= 6 && a <= 10 && b >= 6 && b <= 10) {
      return `💡 <strong>Petunjuk Trik Jari:</strong> Buka jari sesuai pola angka ${a} dan ${b}. Jumlahkan jari yang terangkat sebagai puluhan, lalu kalikan jari yang tertutup sebagai satuan.`;
    }
    if (a === 25 || b === 25) {
      const other = a === 25 ? b : a;
      return `💡 <strong>Petunjuk Perkalian 25:</strong> Bagi angka <strong>${formatNum(other)}</strong> dengan 4, lalu kalikan hasilnya dengan 100 (ingat sisa pembagian: sisa 1 = +25, sisa 2 = +50, sisa 3 = +75).`;
    }
    if (a === b) {
      if (a >= 10 && a <= 99) {
        const puluhan = Math.floor(a / 10) * 10;
        const satuan = a % 10;
        return `💡 <strong>Petunjuk Kuadrat Puluhan:</strong> Pecah ${a} menjadi (${puluhan} + ${satuan}), lalu gunakan pola aljabar <em>a² + 2ab + b²</em>.`;
      }
      return `💡 <strong>Petunjuk Kuadrat:</strong> Gunakan rumus <em>a² = (a + b)(a - b) + b²</em> dengan membulatkan ${formatNum(a)} ke puluhan/ratusan terdekat.`;
    }
    if ((a % 2 === 0 && b % 5 === 0) || (b % 2 === 0 && a % 5 === 0)) {
      const genap = a % 2 === 0 ? a : b;
      const kelipatanLima = a % 2 === 0 ? b : a;
      return `💡 <strong>Petunjuk Halving & Doubling:</strong> Bagi dua angka genap (<strong>${formatNum(genap)} ÷ 2 = ${formatNum(genap / 2)}</strong>) dan kalikan dua angka pasangannya (<strong>${formatNum(kelipatanLima)} × 2 = ${formatNum(kelipatanLima * 2)}</strong>) agar muncul angka berakhiran nol!`;
    }
    const lastDigitA = a % 10;
    const lastDigitB = b % 10;
    if (lastDigitA === 1 || lastDigitA === 9 || lastDigitB === 1 || lastDigitB === 1) {
      return `💡 <strong>Petunjuk Sifat Distributif (Pembulatan):</strong> Bulatkan angka yang dekat dengan puluhan terdekat (misal ke kelipatan 10), kalikan, lalu tambah atau kurangi dengan selisihnya.`;
    }
    return `💡 <strong>Petunjuk Metode Gasing / Distributif:</strong> Pecah angka berdasarkan nilai tempatnya (ratusan, puluhan, satuan), kalikan secara bertahap dari nilai terbesar ke terkecil, lalu jumlahkan hasilnya.`;
  }

  // Generate Opsi Pilihan Ganda yang Masuk Akal
  function generateChoices(correct) {
    const choices = new Set([correct]);
    while (choices.size < 4) {
      const offsetType = getRandomInt(1, 3);
      let distractor = correct;
      if (offsetType === 1) {
        const step = correct > 100 ? 10 : 2;
        distractor = correct + (getRandomInt(-3, 3) * step);
      } else if (offsetType === 2) {
        distractor = correct + getRandomInt(-5, 5);
      } else {
        const delta = Math.max(1, Math.floor(correct * 0.1));
        distractor = correct + (Math.random() > 0.5 ? delta : -delta);
      }
      if (distractor > 0 && distractor !== correct) {
        choices.add(distractor);
      }
    }
    return Array.from(choices).sort(() => Math.random() - 0.5);
  }

  // Generate Soal Baru
  function generateQuestion() {
    feedbackBox.classList.add("hidden");
    feedbackBox.classList.remove("success", "error");
    hintBox.classList.add("hidden");
    nextBtn.classList.add("hidden");
    essayInput.value = "";
    essayInput.disabled = false;
    checkBtn.disabled = false;

    let min1 = config.num1.isCustom ? parseInt(document.getElementById("num1-min").value, 10) || 1 : config.num1.min;
    let max1 = config.num1.isCustom ? parseInt(document.getElementById("num1-max").value, 10) || 10 : config.num1.max;
    let min2 = config.num2.isCustom ? parseInt(document.getElementById("num2-min").value, 10) || 1 : config.num2.min;
    let max2 = config.num2.isCustom ? parseInt(document.getElementById("num2-max").value, 10) || 10 : config.num2.max;

    if (min1 > max1) [min1, max1] = [max1, min1];
    if (min2 > max2) [min2, max2] = [max2, min2];

    const a = getRandomInt(min1, max1);
    const b = getRandomInt(min2, max2);
    currentQ = { a, b, answer: a * b };

    let activeType = config.qType;
    if (activeType === "mixed") {
      activeType = Math.random() > 0.5 ? "plain" : "story";
    }

    if (activeType === "plain") {
      modeIndicator.textContent = "Soal Polos";
      questionText.innerHTML = `Tentukan nilai dari <strong>${formatNum(a)} × ${formatNum(b)} = ...</strong>`;
    } else {
      modeIndicator.textContent = "Soal Cerita";
      questionText.innerHTML = buildStoryQuestion(a, b);
    }

    if (config.aMode === "essay") {
      essayArea.classList.remove("hidden");
      mcArea.classList.add("hidden");
      setTimeout(() => essayInput.focus(), 100);
    } else {
      essayArea.classList.add("hidden");
      mcArea.classList.remove("hidden");
      mcArea.innerHTML = "";
      const choices = generateChoices(currentQ.answer);
      choices.forEach(val => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "bk-mc-option";
        btn.textContent = formatNum(val);
        btn.addEventListener("click", () => handleMcAnswer(btn, val));
        mcArea.appendChild(btn);
      });
    }
  }

  // Evaluasi Jawaban
  function evaluateAnswer(userVal, clickedBtn = null) {
    const isCorrect = userVal === currentQ.answer;
    feedbackBox.classList.remove("hidden", "success", "error");

    if (isCorrect) {
      feedbackBox.classList.add("success");
      feedbackTitle.textContent = "🎉 Tepat Sekali!";
      feedbackDesc.innerHTML = `Hasil dari <strong>${formatNum(currentQ.a)} × ${formatNum(currentQ.b)}</strong> memang <strong>${formatNum(currentQ.answer)}</strong>.`;
      hintBox.classList.add("hidden");
      if (clickedBtn) clickedBtn.classList.add("correct");
    } else {
      feedbackBox.classList.add("error");
      feedbackTitle.textContent = "❌ Kurang Tepat";
      feedbackDesc.innerHTML = `Jawaban yang benar untuk <strong>${formatNum(currentQ.a)} × ${formatNum(currentQ.b)}</strong> adalah <strong>${formatNum(currentQ.answer)}</strong>.`;
      hintBox.innerHTML = getSmartHint(currentQ.a, currentQ.b);
      hintBox.classList.remove("hidden");

      if (clickedBtn) {
        clickedBtn.classList.add("wrong");
        mcArea.querySelectorAll(".bk-mc-option").forEach(btn => {
          if (parseInt(btn.textContent.replace(/\./g, ""), 10) === currentQ.answer) {
            btn.classList.add("correct");
          }
        });
      }
    }
    nextBtn.classList.remove("hidden");
  }

  checkBtn.addEventListener("click", () => {
    const raw = essayInput.value.trim();
    if (raw === "") return;
    const userVal = parseInt(raw, 10);
    essayInput.disabled = true;
    checkBtn.disabled = true;
    evaluateAnswer(userVal);
  });

  essayInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !checkBtn.disabled) {
      checkBtn.click();
    }
  });

  function handleMcAnswer(btn, val) {
    mcArea.querySelectorAll(".bk-mc-option").forEach(b => (b.disabled = true));
    evaluateAnswer(val, btn);
  }

  startBtn.addEventListener("click", () => {
    setupView.classList.add("hidden");
    practiceView.classList.remove("hidden");
    generateQuestion();
  });

  backBtn.addEventListener("click", () => {
    practiceView.classList.add("hidden");
    setupView.classList.remove("hidden");
  });

  nextBtn.addEventListener("click", generateQuestion);
};

// Auto-run jika file dibuka langsung
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function() {
    if (typeof window.initBkQuiz === "function") window.initBkQuiz();
  });
} else {
  if (typeof window.initBkQuiz === "function") window.initBkQuiz();
}
