import { examData } from "./data.js";

const loginScreen = document.getElementById("login-screen");
const examScreen = document.getElementById("exam-screen");
const resultScreen = document.getElementById("result-screen");
const questionsContainer = document.getElementById("questions-container");
const questionBoard = document.getElementById("question-board");
const submitBtn = document.getElementById("submit-btn");

// Biến trạng thái
let timeRemaining = 3000; // Mặc định 50 phút = 3000 giây
let timerInterval;
let userAnswers = {};
let flaggedQuestions = {};
let isFinished = false;
let cheatCount = 0;

// 1. KIỂM TRA BẢN NHÁP & BẮT ĐẦU
document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();

  document.getElementById("display-name").innerText =
    document.getElementById("student-name").value;
  document.getElementById("display-class").innerText =
    document.getElementById("student-class").value;

  // Khôi phục dữ liệu bài làm dang dở nếu có
  const draft = JSON.parse(localStorage.getItem("examDraft"));
  if (draft && !draft.isFinished) {
    timeRemaining = draft.timeRemaining;
    userAnswers = draft.userAnswers || {};
    flaggedQuestions = draft.flaggedQuestions || {};
    cheatCount = draft.cheatCount || 0;
  }

  loginScreen.classList.add("hidden");
  examScreen.classList.remove("hidden");

  renderExam();
  restoreDOMState();
  renderBoard();
  startTimer();
  setupAntiCheat();
});

// 2. RENDER CÂU HỎI & CHỨC NĂNG ĐÁNH DẤU
function renderExam() {
  questionsContainer.innerHTML = "";
  let currentPart = 0;
  let qCounter = 1;

  const partTitles = {
    1: {
      title: "Phần I — Trắc nghiệm khách quan",
      score: "4.5 điểm",
      sub: "Mỗi câu đúng được 0.25 điểm. Chọn một đáp án duy nhất.",
    },
    2: {
      title: "Phần II — Trắc nghiệm đúng sai",
      score: "4.0 điểm",
      sub: "Trong mỗi ý a, b, c, d, chọn đúng hoặc sai.",
    },
    3: {
      title: "Phần III — Trắc nghiệm trả lời ngắn",
      score: "1.5 điểm",
      sub: "Nhập đáp án (chỉ ghi số hoặc kết quả cuối cùng).",
    },
  };

  examData.forEach((q, index) => {
    // In Header nếu chuyển phần mới
    if (q.part !== currentPart) {
      currentPart = q.part;
      const header = document.createElement("div");
      header.className = "section-header";
      header.innerHTML = `
        <div class="section-title">${partTitles[currentPart].title} <span class="badge">${partTitles[currentPart].score}</span></div>
        <div class="section-subtitle">${partTitles[currentPart].sub}</div>
      `;
      questionsContainer.appendChild(header);
      qCounter = 1;
    }

    const card = document.createElement("div");
    card.className = "question-card";
    card.id = `q-card-${q.id}`;

    let contentHTML = `
      <div class="q-layout">
        <div class="q-header" style="display: flex; justify-content: space-between; margin-bottom: 15px;">
          <div class="q-num">Câu ${qCounter}</div>
          <button class="btn-flag ${flaggedQuestions[q.id] ? "active" : ""}" data-id="${q.id}">
            ${flaggedQuestions[q.id] ? "Bỏ đánh dấu" : "Đánh dấu"}
          </button>
        </div>
        <div class="q-content">
          <div class="q-text">${q.question}</div>
    `;

    if (q.part === 1) {
      const letters = ["A", "B", "C", "D"];
      contentHTML += `<div class="options-list">`;
      q.options.forEach((opt, idx) => {
        contentHTML += `
          <label class="option-label" id="lbl-${q.id}-${idx}">
            <input type="radio" name="ans-${q.id}" value="${idx}">
            <span class="opt-letter">${letters[idx]}.</span> ${opt}
          </label>`;
      });
      contentHTML += `</div>`;
    } else if (q.part === 2) {
      const letters = ["a", "b", "c", "d"];
      q.statements.forEach((stmt, idx) => {
        contentHTML += `
          <div class="tf-row" id="row-${q.id}-${idx}">
            <div><strong>${letters[idx]})</strong> ${stmt.text}</div>
            <div class="tf-controls">
              <label><input type="radio" name="tf-${q.id}-${idx}" value="true"> Đúng</label>
              <label><input type="radio" name="tf-${q.id}-${idx}" value="false"> Sai</label>
            </div>
          </div>`;
      });
    } else if (q.part === 3) {
      contentHTML += `<input type="text" class="short-ans-input" name="ans-${q.id}" placeholder="Nhập đáp án...">`;
    }

    contentHTML += `<div class="explanation hidden" id="exp-${q.id}"><strong>Hướng dẫn giải:</strong> ${q.explanation}</div>`;
    contentHTML += `</div></div>`;
    card.innerHTML = contentHTML;
    questionsContainer.appendChild(card);
    qCounter++;
  });

  // Sự kiện Đánh dấu (Flag)
  document.querySelectorAll(".btn-flag").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const qid = e.target.getAttribute("data-id");
      flaggedQuestions[qid] = !flaggedQuestions[qid];
      e.target.classList.toggle("active");
      e.target.innerText = flaggedQuestions[qid] ? "Bỏ đánh dấu" : "Đánh dấu";
      updateBoard();
      saveDraft();
    });
  });

  // Sự kiện Lưu đáp án
  document.querySelectorAll("input").forEach((input) => {
    input.addEventListener("change", (e) => {
      const name = e.target.name;

      if (name.startsWith("ans-") && e.target.type === "radio") {
        const qid = name.replace("ans-", "");
        document
          .querySelectorAll(`input[name="${name}"]`)
          .forEach((r) =>
            r.closest(".option-label").classList.remove("selected"),
          );
        e.target.closest(".option-label").classList.add("selected");
        userAnswers[qid] = parseInt(e.target.value);
      } else if (name.startsWith("tf-")) {
        const [, qid, idx] = name.split("-");
        if (!userAnswers[qid]) userAnswers[qid] = {};
        userAnswers[qid][idx] = e.target.value;
      } else if (e.target.type === "text") {
        const qid = name.replace("ans-", "");
        userAnswers[qid] = e.target.value;
      }
      updateBoard();
      saveDraft();
    });
  });

  if (window.MathJax) MathJax.typesetPromise();
}

// 3. TẠO & CẬP NHẬT BẢNG ĐIỀU HƯỚNG
function renderBoard() {
  if (!questionBoard) return;
  questionBoard.innerHTML = "";
  examData.forEach((q, index) => {
    const box = document.createElement("div");
    box.className = "q-box";
    box.id = `box-${q.id}`;
    box.innerText = index + 1;
    box.addEventListener("click", () => {
      document
        .getElementById(`q-card-${q.id}`)
        .scrollIntoView({ behavior: "smooth", block: "center" });
    });
    questionBoard.appendChild(box);
  });
  updateBoard();
}

function updateBoard() {
  let answeredCount = 0;
  examData.forEach((q) => {
    let answered = false;
    if (q.part === 1 && userAnswers[q.id] !== undefined) answered = true;
    if (
      q.part === 2 &&
      userAnswers[q.id] &&
      Object.keys(userAnswers[q.id]).length === 4
    )
      answered = true;
    if (q.part === 3 && userAnswers[q.id] && userAnswers[q.id].trim() !== "")
      answered = true;

    if (answered) answeredCount++;

    if (questionBoard) {
      const box = document.getElementById(`box-${q.id}`);
      box.className = "q-box"; // Reset class
      if (flaggedQuestions[q.id]) box.classList.add("flagged");
      else if (answered) box.classList.add("done");
    }
  });

  const countEl = document.getElementById("answered-count");
  if (countEl) countEl.innerText = `${answeredCount}/${examData.length}`;
}

// 4. LƯU & KHÔI PHỤC TIẾN ĐỘ
function saveDraft() {
  localStorage.setItem(
    "examDraft",
    JSON.stringify({
      timeRemaining,
      userAnswers,
      flaggedQuestions,
      cheatCount,
      isFinished,
    }),
  );
}

function restoreDOMState() {
  document.querySelectorAll("input").forEach((input) => {
    const name = input.name;
    const qid = name.split("-")[1];

    if (input.type === "radio" && name.startsWith("ans-")) {
      if (userAnswers[qid] == input.value) {
        input.checked = true;
        input.closest(".option-label").classList.add("selected");
      }
    } else if (input.type === "radio" && name.startsWith("tf-")) {
      const idx = name.split("-")[2];
      if (userAnswers[qid] && userAnswers[qid][idx] === input.value)
        input.checked = true;
    } else if (input.type === "text") {
      input.value = userAnswers[qid] || "";
    }
  });
}

// 5. ĐỒNG HỒ & HẾT GIỜ TỰ NỘP
function startTimer() {
  timerInterval = setInterval(() => {
    timeRemaining--;
    saveDraft();

    const m = Math.floor(timeRemaining / 60)
      .toString()
      .padStart(2, "0");
    const s = (timeRemaining % 60).toString().padStart(2, "0");
    document.getElementById("countdown").innerText = `${m}:${s}`;

    if (timeRemaining === 30) {
      alert("Cảnh báo: Chỉ còn 30 giây!");
      document.querySelector(".timer-pill").classList.add("timer-danger");
    }

    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      submitExam();
    }
  }, 1000);
}

function setupAntiCheat() {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && !isFinished) cheatCount++;
  });
}

// 6. NỘP BÀI VÀ CHẤM ĐIỂM
submitBtn.addEventListener("click", () => {
  if (confirm("Bạn có chắc muốn nộp bài?")) submitExam();
});

function submitExam() {
  isFinished = true;
  clearInterval(timerInterval);
  localStorage.removeItem("examDraft");

  document
    .querySelectorAll("input, .btn-flag")
    .forEach((el) => (el.disabled = true));
  submitBtn.style.display = "none";

  const timerPill = document.querySelector(".timer-pill");
  if (timerPill) timerPill.classList.remove("timer-danger");

  let totalScore = 0;

  examData.forEach((q) => {
    document.getElementById(`exp-${q.id}`).classList.remove("hidden");

    if (q.part === 1) {
      const selected = userAnswers[q.id];
      document
        .getElementById(`lbl-${q.id}-${q.correctAnswer}`)
        .classList.add("correct-ans");
      if (selected === q.correctAnswer) {
        totalScore += 0.25;
      } else if (selected !== undefined) {
        document
          .getElementById(`lbl-${q.id}-${selected}`)
          .classList.add("wrong-ans");
      }
    } else if (q.part === 2) {
      let cCount = 0;
      q.statements.forEach((stmt, idx) => {
        const row = document.getElementById(`row-${q.id}-${idx}`);
        const ans = userAnswers[q.id] ? userAnswers[q.id][idx] : null;
        if (ans === stmt.correct.toString()) {
          cCount++;
          row.classList.add("correct-ans");
        } else if (ans !== null) {
          row.classList.add("wrong-ans");
        }
      });
      if (cCount === 4) totalScore += 1.0;
      else if (cCount === 3) totalScore += 0.5;
      else if (cCount === 2) totalScore += 0.25;
    } else if (q.part === 3) {
      const input = document.querySelector(`input[name="ans-${q.id}"]`);
      if (
        (userAnswers[q.id] || "").trim().toLowerCase() ===
        q.correctAnswer.toLowerCase()
      ) {
        totalScore += 0.25;
        input.classList.add("correct-ans");
      } else {
        input.classList.add("wrong-ans");
      }
    }
  });

  document.getElementById("final-score").innerText = totalScore.toFixed(2);
  document.getElementById("cheat-display").innerText = cheatCount;

  examScreen.classList.add("hidden");
  resultScreen.classList.remove("hidden");
}

document.getElementById("review-btn").addEventListener("click", () => {
  resultScreen.classList.add("hidden");
  examScreen.classList.remove("hidden");
});
