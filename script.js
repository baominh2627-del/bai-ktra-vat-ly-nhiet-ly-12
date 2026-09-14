import { examData } from "./data.js";

const loginScreen = document.getElementById("login-screen");
const examScreen = document.getElementById("exam-screen");
const resultScreen = document.getElementById("result-screen");
const questionsContainer = document.getElementById("questions-container");
const submitBtn = document.getElementById("submit-btn");

let timeRemaining = 3000; // 50 phút
let timerInterval;
let userAnswers = {};
let isFinished = false;
let cheatCount = 0;

// Bắt đầu
document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  document.getElementById("display-name").innerText =
    document.getElementById("student-name").value;
  document.getElementById("display-class").innerText =
    document.getElementById("student-class").value;

  loginScreen.classList.add("hidden");
  examScreen.classList.remove("hidden");

  renderExam();
  startTimer();
  setupAntiCheat();
});

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

  examData.forEach((q) => {
    // In Header của phần nếu chuyển phần mới
    if (q.part !== currentPart) {
      currentPart = q.part;
      const header = document.createElement("div");
      header.className = "section-header";
      header.innerHTML = `
        <div class="section-title">${partTitles[currentPart].title} <span class="badge">${partTitles[currentPart].score}</span></div>
        <div class="section-subtitle">${partTitles[currentPart].sub}</div>
      `;
      questionsContainer.appendChild(header);
      qCounter = 1; // Reset số thứ tự câu trong mỗi phần
    }

    const card = document.createElement("div");
    card.className = "question-card";

    let contentHTML = `
      <div class="q-layout">
        <div class="q-num">${qCounter}</div>
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
      q.statements.forEach((stmt, idx) => {
        const letters = ["a", "b", "c", "d"];
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
    contentHTML += `</div></div>`; // Đóng q-content và q-layout
    card.innerHTML = contentHTML;
    questionsContainer.appendChild(card);
    qCounter++;
  });

  // Events lưu đáp án & Đếm số câu
  document.querySelectorAll("input").forEach((input) => {
    input.addEventListener("change", (e) => {
      const name = e.target.name;

      // Đổi màu Label được chọn cho phần 1
      if (name.startsWith("ans-") && e.target.type === "radio") {
        const qid = name.replace("ans-", "");
        document.querySelectorAll(`input[name="${name}"]`).forEach((r) => {
          r.closest(".option-label").classList.remove("selected");
        });
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
      updateProgress();
    });
  });

  if (window.MathJax) MathJax.typesetPromise();
}

function updateProgress() {
  let answered = 0;
  examData.forEach((q) => {
    if (q.part === 1 && userAnswers[q.id] !== undefined) answered++;
    if (
      q.part === 2 &&
      userAnswers[q.id] &&
      Object.keys(userAnswers[q.id]).length === 4
    )
      answered++;
    if (q.part === 3 && userAnswers[q.id] && userAnswers[q.id].trim() !== "")
      answered++;
  });
  document.getElementById("answered-count").innerText = `${answered}/28`;
}

function startTimer() {
  timerInterval = setInterval(() => {
    timeRemaining--;
    const m = Math.floor(timeRemaining / 60)
      .toString()
      .padStart(2, "0");
    const s = (timeRemaining % 60).toString().padStart(2, "0");
    document.getElementById("countdown").innerText = `${m}:${s}`;

    if (timeRemaining <= 30) {
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

submitBtn.addEventListener("click", () => {
  if (confirm("Bạn có chắc muốn nộp bài?")) submitExam();
});

function submitExam() {
  isFinished = true;
  clearInterval(timerInterval);
  document.querySelectorAll("input").forEach((el) => (el.disabled = true));
  submitBtn.style.display = "none";
  document.querySelector(".exam-info-bar").style.position = "static";

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
