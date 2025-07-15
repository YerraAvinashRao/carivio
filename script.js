document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("compareForm");
  const result = document.getElementById("comparisonResult");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const career1 = document.getElementById("career1").value;
      const career2 = document.getElementById("career2").value;

      result.innerHTML = `
        <div style="display: flex; gap: 20px; flex-wrap: wrap;">
          <div style="flex: 1; border: 1px solid #ccc; padding: 15px; border-radius: 8px;">
            <h3>${career1}</h3>
            <p>${getCareerInfo(career1)}</p>
          </div>
          <div style="flex: 1; border: 1px solid #ccc; padding: 15px; border-radius: 8px;">
            <h3>${career2}</h3>
            <p>${getCareerInfo(career2)}</p>
          </div>
        </div>
      `;
    });
  }

  function getCareerInfo(career) {
    switch (career) {
      case "CA":
        return "CA is a prestigious commerce career. Requires CA Foundation, Inter, Final.";
      case "Doctor":
        return "Doctor requires NEET + 5.5 years MBBS. High respect, high effort.";
      case "Lawyer":
        return "Lawyers take CLAT, do 5-year LLB. Great for logical thinkers.";
      case "Engineer":
        return "Engineers do B.Tech after JEE. Multiple streams: CS, Civil, Mech, etc.";
      default:
        return "Info not available.";
    }
  }
});


document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("courseSearchForm");
  const input = document.getElementById("searchInput");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const query = input.value.trim();
    if (query !== "") {
      window.location.href = `search-results.html?q=${encodeURIComponent(query)}`;
    }
  });
});


document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("searchInput");
  const suggestionsBox = document.getElementById("suggestions");
  const button = document.getElementById("searchBtn");
  let searchData = [];

  // Fetch search data
  fetch("search-data.json")
    .then((res) => res.json())
    .then((data) => (searchData = data));

  // Show suggestions as user types
  input.addEventListener("input", () => {
    const query = input.value.toLowerCase();
    suggestionsBox.innerHTML = "";

    if (query.length === 0) {
      suggestionsBox.style.display = "none";
      return;
    }

    const matches = searchData.filter((item) =>
      item.toLowerCase().includes(query)
    );

    if (matches.length > 0) {
      suggestionsBox.style.display = "block";
      matches.forEach((match) => {
        const div = document.createElement("div");
        div.textContent = match;
        div.addEventListener("click", () => {
          input.value = match;
          suggestionsBox.innerHTML = "";
          suggestionsBox.style.display = "none";
        });
        suggestionsBox.appendChild(div);
      });
    } else {
      suggestionsBox.style.display = "none";
    }
  });

  // On search
  button.addEventListener("click", () => {
    const query = input.value.trim();
    if (query) {
      window.location.href = `search-results.html?q=${encodeURIComponent(query)}`;
    }
  });
});

const resultsContainer = document.getElementById("resultsContainer");
const streamFilter = document.getElementById("streamFilter");

const normalize = str => str.toLowerCase().replace(/\s+/g, '');

function renderResults() {
  const query = new URLSearchParams(window.location.search).get("q") || "";
  const selectedStream = streamFilter.value;

  document.getElementById("resultsTitle").textContent = `Search Results for "${query}"`;

  const found = allData.filter(item => {
    const matchesQuery = normalize(item.name).includes(normalize(query));
    const matchesStream = !selectedStream || item.stream === selectedStream;
    return matchesQuery && matchesStream;
  });

  resultsContainer.innerHTML = ""; // Clear existing

  if (found.length === 0) {
    resultsContainer.innerHTML = `<p class="no-results">No results found for "${query}".</p>`;
  } else {
    found.forEach(item => {
      const card = document.createElement("div");
      card.className = "result-card";
      card.innerHTML = `
        <a href="${item.url}" style="text-decoration:none; color:inherit;">
          <h3>${item.name}</h3>
          <p>${item.desc}</p>
        </a>
      `;
      resultsContainer.appendChild(card);
    });
  }
}

streamFilter.addEventListener("change", renderResults);
renderResults(); // Initial render


window.addEventListener('scroll', () => {
  document.body.classList.toggle('window-scrolled', window.scrollY > 0);
});


import { getDocs, collection } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const categoryGrid = document.getElementById("categoryGrid");

async function loadCourseCategories() {
  const snapshot = await getDocs(collection(db, "courseCategories"));
  snapshot.forEach(doc => {
    const data = doc.data();
    const div = document.createElement("div");
    div.className = "category-icon";
    div.innerHTML = `
      <div class="icon-wrapper">
        <img src="${data.iconUrl}" alt="${data.title}" />
      </div>
      <span class="category-label">${data.title}</span>
    `;
    categoryGrid.appendChild(div);
  });
}
loadCourseCategories();
