import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBVJMXI3zu1p84m-ocki1hFhA2P4R9nNFg",
  authDomain: "carivioadmin.firebaseapp.com",
  projectId: "carivioadmin",
  storageBucket: "carivioadmin.appspot.com",
  messagingSenderId: "534591240427",
  appId: "1:534591240427:web:333c04a377d06ebfbce6ae",
  measurementId: "G-D6RSZ95PQT"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
onAuthStateChanged(auth, user => {
  if (user) {
    currentUser = user;
  } else {
    alert("Please login to take the quiz.");
    window.location.href = "../admin/login.html";
  }
});

// Quiz logic starts here (same as before)
const quizForm = document.getElementById('quizForm');
const quizResult = document.getElementById('quizResult');
const progressBar = document.getElementById('progressBar');
const quizTitle = document.getElementById('quizTitle');

const questions = [ /* your existing question array */ ];

let currentStep = 0;
const answers = {};

function renderQuestion(index) {
  quizForm.innerHTML = "";
  const q = questions[index];
  const wrapper = document.createElement("div");
  wrapper.className = "question active";
  wrapper.dataset.step = index + 1;

  wrapper.innerHTML = `
    <h3>${index + 1}. ${q.q}</h3>
    <div class="options">
      ${q.options.map(opt => `
        <label><input type="radio" name="${q.name}" value="${opt}" required> ${opt}</label>
      `).join('')}
    </div>
    <button type="button" class="btn">${index === questions.length - 1 ? 'Get Result' : 'Next'}</button>
  `;

  quizForm.appendChild(wrapper);

  wrapper.querySelector(".btn").addEventListener("click", () => {
    const selected = wrapper.querySelector("input[type='radio']:checked");
    if (!selected) {
      alert("Please select an option to proceed.");
      return;
    }
    answers[q.name] = selected.value;

    if (index < questions.length - 1) {
      currentStep++;
      updateProgressBar();
      renderQuestion(currentStep);
    } else {
      showResult();
    }
  });
}

function updateProgressBar() {
  progressBar.style.width = `${((currentStep + 1) / questions.length) * 100}%`;
}

async function showResult() {
  quizForm.style.display = "none";
  quizTitle.textContent = "Your Career Recommendation";
  quizResult.classList.add("active");

  // Simple logic to determine recommendation
  const scoreMap = {
    commerce: 0,
    science: 0,
    arts: 0,
    tech: 0,
    vocational: 0
  };

  if (answers.q1 === "Commerce") scoreMap.commerce++;
  if (answers.q1 === "Science") scoreMap.science++;
  if (answers.q1 === "Arts") scoreMap.arts++;
  if (answers.q1 === "Computers/Tech") scoreMap.tech++;
  if (answers.q1 === "None") scoreMap.vocational++;

  if (answers.q3.includes("code")) scoreMap.tech++;
  if (answers.q3.includes("creating") || answers.q7.includes("social media")) scoreMap.arts++;
  if (answers.q3.includes("analyzing") || answers.q7.includes("money")) scoreMap.commerce++;
  if (answers.q3.includes("healing") || answers.q7.includes("surgery")) scoreMap.science++;
  if (answers.q7.includes("legal")) scoreMap.arts++;

  const best = Object.entries(scoreMap).sort((a, b) => b[1] - a[1])[0][0];

  let recommendation = "Chartered Accountant (CA)";
  if (best === "science") recommendation = "Doctor (MBBS)";
  if (best === "arts") recommendation = "Journalist";
  if (best === "tech") recommendation = "App Developer";
  if (best === "vocational") recommendation = "Hotel Management";

  // Show result to user
  quizResult.innerHTML = `
    <p style="font-size: 1.2rem;">Based on your answers, we recommend:</p>
    <h3>${recommendation}</h3>
    <p>Redirecting you to your dashboard...</p>
  `;

  // Save to Firestore
  try {
    const userRef = doc(db, "users", currentUser.uid);
    await updateDoc(userRef, {
      quizResult: recommendation,
      activity: [
        ...(currentUser.activity || []),
        {
          action: `Completed quiz - got "${recommendation}"`,
          timestamp: new Date()
        }
      ]
    });
    setTimeout(() => {
      window.location.href = "/admin/user-dashboard.html";
    }, 2500);
  } catch (error) {
    alert("Error saving quiz result. Please try again.");
    console.error(error);
  }
}

// Start the quiz
renderQuestion(currentStep);
updateProgressBar();
