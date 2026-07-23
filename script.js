
const bgMusic = document.getElementById("bgMusic");
const musicButton = document.getElementById("musicButton");
const musicTitle = document.getElementById("musicTitle");
const musicSubtitle = document.getElementById("musicSubtitle");
let musicFadeTimer;

function fadeAudio(targetVolume, duration = 1600) {
  window.clearInterval(musicFadeTimer);
  const startVolume = bgMusic.volume;
  const steps = 32;
  const difference = targetVolume - startVolume;
  let step = 0;

  musicFadeTimer = window.setInterval(() => {
    step += 1;
    bgMusic.volume = Math.max(0, Math.min(1, startVolume + difference * (step / steps)));

    if (step >= steps) {
      window.clearInterval(musicFadeTimer);
      bgMusic.volume = targetVolume;

      if (targetVolume === 0) {
        bgMusic.pause();
      }
    }
  }, duration / steps);
}

musicButton.addEventListener("click", async () => {
  if (bgMusic.paused) {
    try {
      bgMusic.volume = 0;
      await bgMusic.play();
      fadeAudio(0.42);
      musicButton.classList.add("playing");
      musicButton.setAttribute("aria-pressed", "true");
      musicButton.setAttribute("aria-label", "Pause background music");
      musicTitle.textContent = "Music is playing";
      musicSubtitle.textContent = "tap here whenever you want a quiet moment";
    } catch (error) {
      musicTitle.textContent = "Add journey.mp3 first";
      musicSubtitle.textContent = "place it inside assets/audio";
    }
  } else {
    fadeAudio(0, 850);
    musicButton.classList.remove("playing");
    musicButton.setAttribute("aria-pressed", "false");
    musicButton.setAttribute("aria-label", "Play background music");
    musicTitle.textContent = "Let us add some music";
    musicSubtitle.textContent = "while you scroll through this little journey";
  }
});

bgMusic.addEventListener("error", () => {
  musicTitle.textContent = "Add journey.mp3 first";
  musicSubtitle.textContent = "place it inside assets/audio";
});

const enterButton = document.getElementById("enterMuseum");
const loader = document.getElementById("archiveLoader");
const loaderLines = document.getElementById("loaderLines");
const firstSection = document.querySelector("main .section");
const secretToast = document.getElementById("secretToast");

const loadingMessages = [
  "Collecting conversations...",
  "Finding recommendations...",
  "Dusting off old jokes...",
  "Brewing tea... ☕",
  "Archive ready."
];

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

enterButton.addEventListener("click", async () => {
  loaderLines.innerHTML = "";
  loader.classList.add("visible");
  loader.setAttribute("aria-hidden", "false");

  for (const message of loadingMessages) {
    const line = document.createElement("p");
    line.className = "loader-line";
    line.textContent = message;
    loaderLines.appendChild(line);
    await wait(180);
    line.classList.add("show");
    await wait(280);
  }

  await wait(280);
  loader.classList.remove("visible");
  loader.setAttribute("aria-hidden", "true");
  await wait(300);
  firstSection.scrollIntoView({ behavior: "smooth" });
});

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach(section => observer.observe(section));

document.addEventListener("pointermove", event => {
  const glow = document.querySelector(".cursor-glow");
  glow.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
});

function showSecret(message) {
  secretToast.textContent = message;
  secretToast.classList.add("show");
  clearTimeout(showSecret.timer);
  showSecret.timer = setTimeout(() => secretToast.classList.remove("show"), 2600);
}

document.querySelector(".tea-card").addEventListener("dblclick", () => {
  showSecret("Secret found: emergency tea break unlocked. ☕");
});

document.querySelector(".bird-card").addEventListener("click", event => {
  if (event.detail === 3) showSecret("A tiny bird approves of this investigation. 🐦");
});

document.querySelectorAll(".gif-card").forEach(card => {
  card.addEventListener("click", () => {
    card.classList.toggle("playing");
    const type = card.dataset.gif;
    const messages = {
      kelly: "Kelly Kapoor energy activated.",
      dhappa: "Dhappa mode activated.",
      reaction: "Exactly the correct reaction."
    };
    showSecret(messages[type]);
  });
});

const quiz = [
  {
    question: "Which item belongs on the recommendation shelf?",
    options: ["Tea", "Yellow Tail Merlot", "A cute bird", "B12"],
    answer: 1,
    feedback: "Correct. Tea has its own permanent exhibit."
  },
  {
    question: "What happens when detective mode begins?",
    options: ["One tab closes", "The question is forgotten", "Twelve tabs mysteriously appear", "Tea disappears"],
    answer: 2,
    feedback: "Correct. The investigation always expands."
  },
  {
    question: "Who is the spirit animal of the reaction archive?",
    options: ["Kelly Kapoor", "A skeleton", "The bird", "The moisturizer"],
    answer: 0,
    feedback: "There was never any real competition."
  },
  {
    question: "What belongs in its own room instead of the finished-art wall?",
    options: ["The Merlot", "The doodle and sketch page", "The GIFs", "The photographs"],
    answer: 1,
    feedback: "Correct. Unfinished thoughts deserve space too."
  }
];

let questionIndex = 0;
const progress = document.getElementById("quizProgress");
const question = document.getElementById("quizQuestion");
const options = document.getElementById("quizOptions");
const feedback = document.getElementById("quizFeedback");

function renderQuestion() {
  const item = quiz[questionIndex];
  progress.textContent = `Question ${questionIndex + 1} of ${quiz.length}`;
  question.textContent = item.question;
  feedback.textContent = "";
  options.innerHTML = "";

  item.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.className = "quiz-option";
    button.textContent = option;
    button.addEventListener("click", () => answerQuestion(index));
    options.appendChild(button);
  });
}

async function answerQuestion(selected) {
  const item = quiz[questionIndex];
  options.querySelectorAll("button").forEach(button => button.disabled = true);

  if (selected === item.answer) {
    feedback.textContent = item.feedback;
  } else {
    feedback.textContent = "Not quite. The archive respectfully disagrees.";
  }

  await wait(1250);

  if (questionIndex < quiz.length - 1) {
    questionIndex += 1;
    renderQuestion();
  } else {
    progress.textContent = "Assessment complete";
    question.textContent = "Result: 100% FS";
    options.innerHTML = "";
    feedback.textContent = "No known substitute. No further testing required. 😊";
    showSecret("Quiz completed. +31 archive points.");
  }
}

renderQuestion();

let keyBuffer = "";
document.addEventListener("keydown", event => {
  keyBuffer = (keyBuffer + event.key.toLowerCase()).slice(-8);

  if (keyBuffer.endsWith("tea")) {
    showSecret("You typed tea. A completely reasonable decision. ☕");
  }

  if (event.key.toLowerCase() === "b") {
    showSecret("Friendly reminder discovered: B12. 🙂");
  }
});
