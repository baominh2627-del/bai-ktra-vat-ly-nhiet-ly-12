import { examData } from "./data.js";

const loginScreen = document.getElementById("login-screen");
const examScreen = document.getElementById("exam-screen");
const resultScreen = document.getElementById("result-screen");
const timerBar = document.getElementById("timer-bar");
const countdownEl = document.getElementById("countdown");
const questionsContainer = document.getElementById("questions-container");
const questionBoard = document.getElementById("question-board");
const submitBtn = document.getElementById("submit-btn");

let studentData = {};
let timerInterval;
let timeRemaining = 0;
let cheatCount = 0;
let isExamFinished = false;

// Trạng thái bài làm
let userAnswers = {}; // Lưu đáp án đã chọn
let flaggedQuestions = {}; // Lưu các câu đã đánh dấu

// 0. KIỂM TRA DỮ LIỆU ĐANG DỞ
window.onload = () => {
  const savedState = localStorage.getItem("physics_exam_draft");
  if (savedState) {
    document.getElementById("resume-notice").classList.remove("hidden");
  }
};

// 1. INIT
document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const savedState = JSON.parse(localStorage.getItem("physics_exam_draft"));

  if (savedState && !savedState.isExamFinished) {
    // Khôi phục dữ liệu
    studentData = savedState.studentData;
    timeRemaining = savedState.timeRemaining;
    userAnswers = savedState.userAnswers || {};
    flaggedQuestions = savedState.flaggedQuestions || {};
    cheatCount = savedState.cheatCount || 0;
  } else {
    // Tạo mới
    studentData = {
      name: document.getElementById("student-name").value.trim(),
      class: document.getElementById("student-class").value.trim(),
      time: parseInt(document.getElementById("exam-time").value) * 60,
    };
    timeRemaining = studentData.time;
    userAnswers = {};
    flaggedQuestions = {};
  }

  document.getElementById("display-name").innerText = studentData.name;
  document.getElementById("display-class").innerText = studentData.class;

  loginScreen.classList.add("hidden");
  examScreen.classList.remove("hidden");

  renderQuestions();
  renderBoard();
  restoreInputs();
  startTimer(timeRemaining);
  setupAntiCheat();
});

// 2. RENDER CÂU HỎI
function renderQuestions() {
  questionsContainer.innerHTML = "";
  examData.forEach((q, index) => {
    const card = document.createElement("div");
    card.className = "card question-card";
    card.id = `card-${q.id}`;

    let contentHTML = `
      <div class="question-header">
        <div class="question-title">Câu ${index + 1}: ${q.question}</div>
        <button class="btn-flag ${flaggedQuestions[q.id] ? "active" : ""}" data-qid="${q.id}">
          ${flaggedQuestions[q.id] ? "Bỏ đánh dấu" : "Đánh dấu"}
        </button>
      </div>`;

    if (q.type === 1) {
      contentHTML += `<ul class="options-list">`;
      q.options.forEach((opt, optIdx) => {
        contentHTML += `
          <li class="option-item" id="opt-${q.id}-${optIdx}">
            <label><input type="radio" name="ans-${q.id}" value="${optIdx}"> ${opt}</label>
          </li>`;
      });
      contentHTML += `</ul>`;
    } else if (q.type === 2) {
      q.statements.forEach((stmt, stmtIdx) => {
        contentHTML += `
          <div class="tf-row" id="row-${q.id}-${stmtIdx}">
            <div class="tf-stmt">${stmt.text}</div>
            <div class="tf-controls">
              <label><input type="radio" name="tf-${q.id}-${stmtIdx}" value="true"> Đúng</label>
              <label><input type="radio" name="tf-${q.id}-${stmtIdx}" value="false"> Sai</label>
            </div>
          </div>`;
      });
    } else if (q.type === 3) {
      contentHTML += `<div class="form-group"><input type="text" id="ans-${q.id}" placeholder="Nhập đáp án..."></div>`;
    }

    contentHTML += `<div class="explanation hidden" id="exp-${q.id}">${q.explanation}</div>`;
    card.innerHTML = contentHTML;
    questionsContainer.appendChild(card);
  });

  // Gắn sự kiện lưu đáp án
  document.querySelectorAll("input").forEach((input) => {
    input.addEventListener("change", (e) => {
      saveInputData(e.target);
      updateBoardUI();
      saveDraft();
    });
  });

  // Gắn sự kiện đánh dấu (Flag)
  document.querySelectorAll(".btn-flag").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const qid = e.target.getAttribute("data-qid");
      flaggedQuestions[qid] = !flaggedQuestions[qid];
      e.target.classList.toggle("active");
      e.target.innerText = flaggedQuestions[qid] ? "Bỏ đánh dấu" : "Đánh dấu";
      updateBoardUI();
      saveDraft();
    });
  });

  if (window.MathJax) MathJax.typesetPromise([questionsContainer]);
}

// 3. RENDER & UPDATE BẢNG ĐIỀU HƯỚNG
function renderBoard() {
  questionBoard.innerHTML = "";
  examData.forEach((q, index) => {
    const box = document.createElement("div");
    box.className = "q-box";
    box.id = `qbox-${q.id}`;
    box.innerText = index + 1;
    box.addEventListener("click", () => {
      document
        .getElementById(`card-${q.id}`)
        .scrollIntoView({ behavior: "smooth", block: "center" });
    });
    questionBoard.appendChild(box);
  });
  updateBoardUI();
}

function updateBoardUI() {
  examData.forEach((q) => {
    const box = document.getElementById(`qbox-${q.id}`);
    box.className = "q-box"; // reset
    if (flaggedQuestions[q.id]) {
      box.classList.add("flagged");
    } else if (isAnswered(q)) {
      box.classList.add("done");
    }
  });
}

function isAnswered(q) {
  if (q.type === 1) return userAnswers[q.id] !== undefined;
  if (q.type === 2)
    return userAnswers[q.id] && Object.keys(userAnswers[q.id]).length === 4;
  if (q.type === 3) return userAnswers[q.id] && userAnswers[q.id].trim() !== "";
  return false;
}

// 4. XỬ LÝ LƯU & KHÔI PHỤC TIẾN ĐỘ
function saveInputData(target) {
  const name = target.name;
  if (name && name.startsWith("ans-")) {
    const qid = name.replace("ans-", "");
    userAnswers[qid] = parseInt(target.value);
  } else if (name && name.startsWith("tf-")) {
    const parts = name.split("-");
    const qid = parts[1];
    const stmtIdx = parts[2];
    if (!userAnswers[qid]) userAnswers[qid] = {};
    userAnswers[qid][stmtIdx] = target.value;
  } else if (target.id && target.id.startsWith("ans-")) {
    const qid = target.id.replace("ans-", "");
    userAnswers[qid] = target.value;
  }
}

function restoreInputs() {
  examData.forEach((q) => {
    if (q.type === 1 && userAnswers[q.id] !== undefined) {
      const radio = document.querySelector(
        `input[name="ans-${q.id}"][value="${userAnswers[q.id]}"]`,
      );
      if (radio) radio.checked = true;
    } else if (q.type === 2 && userAnswers[q.id]) {
      for (let i = 0; i < 4; i++) {
        if (userAnswers[q.id][i]) {
          const radio = document.querySelector(
            `input[name="tf-${q.id}-${i}"][value="${userAnswers[q.id][i]}"]`,
          );
          if (radio) radio.checked = true;
        }
      }
    } else if (q.type === 3 && userAnswers[q.id]) {
      document.getElementById(`ans-${q.id}`).value = userAnswers[q.id];
    }
  });
}

function saveDraft() {
  const state = {
    studentData,
    timeRemaining,
    userAnswers,
    flaggedQuestions,
    cheatCount,
    isExamFinished,
  };
  localStorage.setItem("physics_exam_draft", JSON.stringify(state));
}

// 5. ĐỒNG HỒ & CẢNH BÁO
function startTimer(seconds) {
  timeRemaining = seconds;
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    timeRemaining--;
    updateTimerDisplay();
    saveDraft(); // Auto-save mỗi giây

    // Thông báo 30s cuối
    if (timeRemaining === 30) {
      alert("CẢNH BÁO: Bài thi chỉ còn 30 giây! Vui lòng kiểm tra lại đáp án.");
      timerBar.classList.add("timer-danger");
    }

    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      finishExam();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const m = Math.floor(timeRemaining / 60)
    .toString()
    .padStart(2, "0");
  const s = (timeRemaining % 60).toString().padStart(2, "0");
  countdownEl.innerText = `${m}:${s}`;
}

// 6. ANTI-CHEAT
function setupAntiCheat() {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && !isExamFinished) {
      cheatCount++;
      alert(
        `Cảnh báo gian lận! Bạn vừa thoát khỏi màn hình bài thi. (Vi phạm lần ${cheatCount})`,
      );
      saveDraft();
    }
  });
}

// 7. CHẤM & NỘP BÀI
submitBtn.addEventListener("click", () => {
  if (confirm("Bạn có chắc chắn muốn nộp bài?")) finishExam();
});

function finishExam() {
  if (isExamFinished) return;
  isExamFinished = true;
  clearInterval(timerInterval);
  timerBar.classList.remove("timer-danger");

  document
    .querySelectorAll("input, .btn-flag")
    .forEach((el) => (el.disabled = true));
  submitBtn.style.display = "none";
  localStorage.removeItem("physics_exam_draft"); // Nộp xong xóa nháp

  let totalPoints = 0;
  const maxScore = 10 / examData.length;

  examData.forEach((q) => {
    let earned = 0;
    document.getElementById(`exp-${q.id}`).classList.remove("hidden");

    if (q.type === 1) {
      const selectedVal = userAnswers[q.id];
      document
        .getElementById(`opt-${q.id}-${q.correctAnswer}`)
        .classList.add("correct-ans");
      if (selectedVal === q.correctAnswer) earned = maxScore;
      else if (selectedVal !== undefined && selectedVal !== q.correctAnswer) {
        document
          .getElementById(`opt-${q.id}-${selectedVal}`)
          .classList.add("wrong-ans");
      }
    } else if (q.type === 2) {
      let correctCount = 0;
      q.statements.forEach((stmt, idx) => {
        const row = document.getElementById(`row-${q.id}-${idx}`);
        const ans = userAnswers[q.id] ? userAnswers[q.id][idx] : null;
        if (ans === stmt.correct.toString()) {
          correctCount++;
          row.classList.add("correct-ans");
        } else {
          row.classList.add("wrong-ans");
        }
      });
      if (correctCount === 4) earned = maxScore;
      else if (correctCount === 3) earned = maxScore * 0.5;
      else if (correctCount === 2) earned = maxScore * 0.25;
    } else if (q.type === 3) {
      const inputEl = document.getElementById(`ans-${q.id}`);
      const val = (userAnswers[q.id] || "").trim().toLowerCase();
      if (val === q.correctAnswer.toLowerCase()) {
        earned = maxScore;
        inputEl.classList.add("correct-ans");
      } else {
        inputEl.classList.add("wrong-ans");
      }
    }
    totalPoints += earned;
  });

  document.getElementById("final-score").innerText = totalPoints.toFixed(2);
  document.getElementById("cheat-display").innerText = cheatCount;

  examScreen.classList.add("hidden");
  resultScreen.classList.remove("hidden");
}

document.getElementById("review-btn").addEventListener("click", () => {
  resultScreen.classList.add("hidden");
  examScreen.classList.remove("hidden");
});
