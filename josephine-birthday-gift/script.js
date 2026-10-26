const questions = [
  {
    hint: { text: "🥶" },
    answer: "Chilly"
  },
  {
    hint: { text: "February 22, 2027" },
    answer: "01"
  },
  {
    hint: { img: "images/q3.jpg" },
    answer: "Phil"
  },
  {
    hint: { text: "👂🤫" },
    answer: "Rumeur"
  },
  {
    hint: { img: "images/q1.jpg" },
    answer: "23"
  },
  {
    hint: { img: "images/q4.jpg" },
    answer: "Harmonie"
  },
  {
    hint: { img: "images/q6.jpg" },
    answer: "Gonzales"
  }
];

const revealTemplate = [
  { word: "Chilly", blank: true },
  { word: "Gonzales", blank: true },
  { word: "et", blank: false },
  { word: "La", blank: true },
  { word: "Rumeur", blank: true },
  { word: "à", blank: false },
  { word: "La Philharmonie", blank: true },
  { word: "le", blank: false },
  { word: "23", blank: true },
  { word: "/", blank: false },
  { word: "01", blank: true }
];

const startSlide = document.getElementById("start-slide");
const startBtn = document.getElementById("start-btn");
const scatterEl = document.getElementById("scatter-letters");
const form = document.getElementById("quiz-form");
const hintEl = document.getElementById("hint");
const answerEl = document.getElementById("answer");
const revealEl = document.getElementById("reveal");
const finalSlide = document.getElementById("final-slide");
const finalTopEl = document.getElementById("final-top");
const finalImageEl = document.getElementById("final-image");
const wrongImageEl = document.getElementById("wrong-image");
const playAgainBtn = document.getElementById("play-again-btn");

const wrongImages = [
  "images/wrong.jpg",
  "images/wrong2.jpg",
  "images/wrong3.jpg",
  "images/wrong4.jpg"
];

const STORAGE_KEY = "jo-birthday-quiz-state";

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {}
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { currentIndex: 0, completed: false };
    const parsed = JSON.parse(raw);
    return {
      currentIndex: typeof parsed.currentIndex === "number" ? parsed.currentIndex : 0,
      completed: !!parsed.completed
    };
  } catch (e) {
    return { currentIndex: 0, completed: false };
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {}
}

let currentIndex = 0;

function normalize(str) {
  return str
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function renderHint(hint) {
  hintEl.innerHTML = "";

  if (hint.img) {
    const img = document.createElement("img");
    img.src = hint.img;
    img.alt = "indice";
    img.onerror = () => {
      hintEl.innerHTML = "";
      const placeholder = document.createElement("div");
      placeholder.className = "hint-placeholder";
      placeholder.textContent = `Image manquante : ${hint.img}`;
      hintEl.appendChild(placeholder);
    };
    hintEl.appendChild(img);
  } else if (hint.text) {
    const span = document.createElement("div");
    span.className = "hint-text";
    span.textContent = hint.text;
    hintEl.appendChild(span);
  }
}

function createWordGroup(word) {
  const group = document.createElement("div");
  group.className = "answer-word";
  word.split("").forEach(() => {
    const input = document.createElement("input");
    input.type = "text";
    input.autocomplete = "off";
    input.maxLength = 1;
    input.className = "char-input";
    group.appendChild(input);
  });
  return group;
}

function renderAnswerInputs(question) {
  answerEl.innerHTML = "";
  question.answer.split(" ").forEach((word) => {
    answerEl.appendChild(createWordGroup(word));
  });
}

function getCharInputs() {
  return Array.from(answerEl.querySelectorAll(".char-input"));
}

answerEl.addEventListener("input", (e) => {
  if (!e.target.classList.contains("char-input")) return;
  if (e.target.value.length === 0) return;
  const inputs = getCharInputs();
  const idx = inputs.indexOf(e.target);
  if (idx > -1 && idx < inputs.length - 1) {
    inputs[idx + 1].focus();
  }
});

answerEl.addEventListener("keydown", (e) => {
  if (!e.target.classList.contains("char-input")) return;
  if (e.key === "Backspace" && e.target.value === "") {
    const inputs = getCharInputs();
    const idx = inputs.indexOf(e.target);
    if (idx > 0) {
      inputs[idx - 1].focus();
    }
  }
});

answerEl.addEventListener("paste", (e) => {
  if (!e.target.classList.contains("char-input")) return;
  e.preventDefault();
  const pasted = (e.clipboardData || window.clipboardData)
    .getData("text")
    .replace(/\s+/g, "")
    .split("");
  const inputs = getCharInputs();
  let idx = inputs.indexOf(e.target);
  pasted.forEach((ch) => {
    if (idx < inputs.length) {
      inputs[idx].value = ch;
      idx++;
    }
  });
  if (inputs[idx]) inputs[idx].focus();
  else if (inputs[inputs.length - 1]) inputs[inputs.length - 1].focus();
});

function renderQuestion(index) {
  const question = questions[index];
  renderHint(question.hint);
  renderAnswerInputs(question);
  form.classList.remove("wrong", "correct");
  const firstInput = answerEl.querySelector(".char-input");
  if (firstInput) firstInput.focus();
}

function showFinalSlide() {
  form.classList.add("hidden");
  finalSlide.classList.remove("hidden");
  finalTopEl.classList.remove("shift-up");
  finalImageEl.classList.remove("shrink");
  revealEl.classList.remove("show");
  playAgainBtn.classList.remove("show");

  revealEl.innerHTML = "";
  const blankSpans = [];
  revealTemplate.forEach((token) => {
    const span = document.createElement("span");
    span.textContent = token.word;
    if (token.blank) {
      span.className = "reveal-word";
      blankSpans.push(span);
    } else {
      span.className = "answer-text";
    }
    revealEl.appendChild(span);
  });

  const flashDuration = 2500;

  setTimeout(() => {
    finalTopEl.classList.add("shift-up");
    finalImageEl.classList.add("shrink");
    revealEl.classList.add("show");
  }, flashDuration);

  setTimeout(() => {
    blankSpans.forEach((span) => span.classList.add("show"));
  }, flashDuration + 400);

  setTimeout(() => {
    playAgainBtn.classList.add("show");
  }, flashDuration + 400 + 1800 + 300);
}

function handleWrongAnswer() {
  form.classList.remove("correct");
  form.classList.add("wrong");
  wrongImageEl.src = wrongImages[Math.floor(Math.random() * wrongImages.length)];
  wrongImageEl.classList.add("show");
  setTimeout(() => {
    form.classList.remove("wrong");
    wrongImageEl.classList.remove("show");
  }, 600);
}

function handleCorrectAnswer() {
  form.classList.remove("wrong");
  form.classList.add("correct");
  setTimeout(() => {
    currentIndex++;
    if (currentIndex < questions.length) {
      saveState({ currentIndex, completed: false });
      renderQuestion(currentIndex);
    } else {
      saveState({ currentIndex, completed: true });
      showFinalSlide();
    }
  }, 500);
}

function renderScatterLetters() {
  scatterEl.innerHTML = "";
  const letters = questions
    .map((q) => q.answer)
    .join("")
    .replace(/[^a-zA-Z0-9]/g, "")
    .split("");

  const goldenAngle = 137.508;
  const maxRadius = Math.min(window.innerWidth, window.innerHeight) * 0.45;
  const step = maxRadius / Math.sqrt(letters.length || 1);

  letters.forEach((ch, i) => {
    const angleDeg = i * goldenAngle;
    const angleRad = (angleDeg * Math.PI) / 180;
    const radius = step * Math.sqrt(i);
    const x = radius * Math.cos(angleRad);
    const y = radius * Math.sin(angleRad);
    const jitter = Math.random() * 30 - 15;

    const span = document.createElement("span");
    span.className = "scatter-letter";
    span.textContent = ch;
    span.style.top = "50%";
    span.style.left = "50%";
    span.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${angleDeg + jitter}deg)`;
    span.style.fontSize = `${1.1 + Math.random() * 1.4}rem`;
    span.style.opacity = (0.1 + Math.random() * 0.15).toFixed(2);
    scatterEl.appendChild(span);
  });
}

startBtn.addEventListener("click", () => {
  startSlide.classList.add("hidden");
  form.classList.remove("hidden");
});

playAgainBtn.addEventListener("click", () => {
  clearState();
  currentIndex = 0;

  finalSlide.classList.add("hidden");
  finalTopEl.classList.remove("shift-up");
  finalImageEl.classList.remove("shrink");
  revealEl.classList.remove("show");
  playAgainBtn.classList.remove("show");

  form.classList.add("hidden");
  renderQuestion(currentIndex);
  renderScatterLetters();
  startSlide.classList.remove("hidden");
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const question = questions[currentIndex];
  const wordGroups = Array.from(answerEl.querySelectorAll(".answer-word"));
  const givenWords = wordGroups.map((group) =>
    Array.from(group.querySelectorAll(".char-input"))
      .map((input) => input.value)
      .join("")
  );

  const given = normalize(givenWords.join(" "));
  const expected = normalize(question.answer);

  if (given === expected) {
    handleCorrectAnswer();
  } else {
    handleWrongAnswer();
  }
});

const savedState = loadState();
renderScatterLetters();

if (savedState.completed) {
  currentIndex = questions.length;
  startSlide.classList.add("hidden");
  form.classList.add("hidden");
  showFinalSlide();
} else {
  currentIndex = savedState.currentIndex;
  renderQuestion(currentIndex);
  if (currentIndex > 0) {
    startSlide.classList.add("hidden");
    form.classList.remove("hidden");
  }
}
