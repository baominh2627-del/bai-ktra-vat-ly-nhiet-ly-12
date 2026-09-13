import { examData } from "./data.js";
import { db, collection, addDoc, serverTimestamp } from "./firebase-config.js";

// DOM Elements
const loginScreen = document.getElementById("login-screen");
const examScreen = document.getElementById("exam-screen");
const resultScreen = document.getElementById("result-screen");
const loginForm = document.getElementById("login-form");
const timerBar = document.getElementById("timer-bar");
const countdownEl = document.getElementById("countdown");
const questionsContainer = document.getElementById("questions-container");
const submitBtn = document.getElementById("submit-btn");

// State Variables
let studentData = {};
let timerInterval;
let timeRemaining = 0;
let cheatCount = 0;
let isExamFinished = false;

// 1. INIT & BẮT ĐẦU LÀM BÀI
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  studentData = {
    name: document.getElementById("student-name").value.trim(),
    class: document.getElementById("student-class").value.trim(),
    time: parseInt(document.getElementById("exam-time").value) * 60,
  };

  document.getElementById("display-name").innerText = studentData.name;
  document.getElementById("display-class").innerText = studentData.class;

  loginScreen.classList.add("hidden");
  examScreen.classList.remove("hidden");

  renderQuestions();
  startTimer(studentData.time);
  setupAntiCheat();
});

// 2. RENDER GIAO DIỆN CÂU HỎI
function renderQuestions() {
  questionsContainer.innerHTML = "";

  examData.forEach((q, index) => {
    const card = document.createElement("div");
    card.className = "card question-card";
    card.id = `card-${q.id}`;

    let contentHTML = `<div class="question-title">Câu ${index + 1}: ${q.question}</div>`;

    if (q.type === 1) {
      contentHTML += `<ul class="options-list">`;
      q.options.forEach((opt, optIdx) => {
        contentHTML += `
                    <li class="option-item" id="opt-${q.id}-${optIdx}">
                        <label>
                            <input type="radio" name="ans-${q.id}" value="${optIdx}">
                            ${opt}
                        </label>
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
      contentHTML += `
                <div class="form-group" style="margin-top:15px;">
                    <input type="text" id="ans-${q.id}" placeholder="Nhập đáp án của bạn...">
                </div>`;
    }

    contentHTML += `<div class="explanation hidden" id="exp-${q.id}">${q.explanation}</div>`;
    card.innerHTML = contentHTML;
    questionsContainer.appendChild(card);
  });

  // Gọi lại MathJax để render công thức LaTeX cho các element mới
  if (window.MathJax) {
    MathJax.typesetPromise([questionsContainer]);
  }
}

// 3. ĐỒNG HỒ ĐẾM NGƯỢC
function startTimer(seconds) {
  timeRemaining = seconds;
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    timeRemaining--;
    updateTimerDisplay();

    // Nhấp nháy cảnh báo khi thời gian < 5 phút (300 giây)
    if (timeRemaining <= 300) {
      timerBar.classList.add("timer-warning");
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

// 4. ANTI-CHEAT (Visibility Change)
function setupAntiCheat() {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && !isExamFinished) {
      cheatCount++;
      alert(
        `Cảnh báo gian lận! Bạn vừa thoát khỏi màn hình bài thi. (Vi phạm lần ${cheatCount})`,
      );
    }
  });
}

// 5. AUTO-GRADING & SUBMIT
submitBtn.addEventListener("click", finishExam);

async function finishExam() {
  if (isExamFinished) return;
  isExamFinished = true;
  clearInterval(timerInterval);
  timerBar.classList.remove("timer-warning");

  // Disable inputs
  document
    .querySelectorAll("input")
    .forEach((input) => (input.disabled = true));
  submitBtn.disabled = true;
  submitBtn.innerText = "Đang xử lý...";

  let totalPoints = 0;
  const maxScorePerQuestion = 10 / examData.length;
  const userAnswers = {};

  examData.forEach((q) => {
    let earned = 0;
    document.getElementById(`exp-${q.id}`).classList.remove("hidden");

    if (q.type === 1) {
      const selected = document.querySelector(
        `input[name="ans-${q.id}"]:checked`,
      );
      const selectedVal = selected ? parseInt(selected.value) : null;
      userAnswers[q.id] = selectedVal;

      // Mark correct answer
      document
        .getElementById(`opt-${q.id}-${q.correctAnswer}`)
        .classList.add("correct-ans");

      if (selectedVal === q.correctAnswer) {
        earned = maxScorePerQuestion;
      } else if (selectedVal !== null) {
        document
          .getElementById(`opt-${q.id}-${selectedVal}`)
          .classList.add("wrong-ans");
      }
    } else if (q.type === 2) {
      let correctCount = 0;
      const tfAnswers = [];
      q.statements.forEach((stmt, stmtIdx) => {
        const selected = document.querySelector(
          `input[name="tf-${q.id}-${stmtIdx}"]:checked`,
        );
        const selectedVal = selected ? selected.value === "true" : null;
        tfAnswers.push(selectedVal);

        const row = document.getElementById(`row-${q.id}-${stmtIdx}`);
        if (selectedVal === stmt.correct) {
          correctCount++;
          row.classList.add("correct-ans");
        } else {
          row.classList.add("wrong-ans");
        }
      });
      userAnswers[q.id] = tfAnswers;

      // Tính điểm bậc thang (Quy chuẩn của bộ GD: 4 ý=100%, 3 ý=50%, 2 ý=25%, <2 ý=0%)
      if (correctCount === 4) earned = maxScorePerQuestion;
      else if (correctCount === 3) earned = maxScorePerQuestion * 0.5;
      else if (correctCount === 2) earned = maxScorePerQuestion * 0.25;
    } else if (q.type === 3) {
      const inputEl = document.getElementById(`ans-${q.id}`);
      const inputVal = inputEl.value.trim().toLowerCase();
      userAnswers[q.id] = inputVal;

      if (inputVal === q.correctAnswer.toLowerCase()) {
        earned = maxScorePerQuestion;
        inputEl.classList.add("correct-ans");
      } else {
        inputEl.classList.add("wrong-ans");
      }
    }
    totalPoints += earned;
  });

  const finalScore = parseFloat(totalPoints.toFixed(2));

  // Lưu lên Firestore
  try {
    if (db) {
      await addDoc(collection(db, "exam_results"), {
        name: studentData.name,
        class: studentData.class,
        score: finalScore,
        cheatCount: cheatCount,
        answers: userAnswers,
        timestamp: serverTimestamp(),
      });
    }
  } catch (e) {
    console.error("Lỗi khi lưu dữ liệu lên Firebase: ", e);
  }

  // Hiển thị kết quả
  document.getElementById("final-score").innerText = finalScore;
  document.getElementById("cheat-display").innerText = cheatCount;

  examScreen.classList.add("hidden");
  resultScreen.classList.remove("hidden");

  // Nút xem lại chi tiết
  document.getElementById("review-btn").addEventListener("click", () => {
    resultScreen.classList.add("hidden");
    examScreen.classList.remove("hidden");
    submitBtn.style.display = "none"; // Ẩn nút nộp bài khi xem lại
  });
}
