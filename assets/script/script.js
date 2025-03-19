// Mood Emojis Dictionary
const moodEmojis = {
  happy: "😊",
  sad: "😢",
  frustrated: "😠",
  sleepy: "😴",
  excited: "🤩",
  relaxed: "😌",
  bored: "🥱",
  thoughtful: "🤔",
  celebrating: "🥳",
  loved: "❤️",
};

// Get the container for mood buttons
const moodButtonsContainer = document.getElementById("moodButtons");

// Create and add mood buttons dynamically
for (const mood in moodEmojis) {
  const button = document.createElement("button");
  button.textContent = `${moodEmojis[mood]} ${
    mood.charAt(0).toUpperCase() + mood.slice(1)
  }`;
  button.onclick = () => setMood(mood);
  moodButtonsContainer.appendChild(button);
}

// Get DOM elements for the calendar and navigation
const calendar = document.getElementById("calendar");
const currentDateElem = document.getElementById("currentDate");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const todayBtn = document.getElementById("todayBtn");
const modeToggleBtn = document.getElementById("modeToggle");

// Initial state
let currentDate = new Date();
let currentView = "month";
let moodStorage = JSON.parse(localStorage.getItem("moods")) || {}; // Load saved moods

// Dark Mode Toggle
modeToggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark-mode") ? "dark" : "light"
  );
});

// Apply saved dark mode preference
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-mode");
  modeToggleBtn.textContent = "Light Mode";
}

// Function to update the calendar display
function updateCalendar() {
  calendar.innerHTML = "";
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  if (currentView === "day") {
    const dateKey = getDateKey(currentDate);
    const moodName = moodStorage[dateKey] || "";
    const moodEmoji = moodEmojis[moodName] || "-";

    calendar.innerHTML = `<div class="single-day">${currentDate.toLocaleDateString(
      "en-GB",
      options
    )}
       <span class="txt-xl">${moodEmoji}</span></div>`;
  } else if (currentView === "week") {
    updateWeekView();
  } else {
    updateMonthView();
  }

  // Update current date display
  currentDateElem.textContent = currentDate.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

// Function to generate a key for storing moods (YYYY-MM-DD format)
function getDateKey(date) {
  return date.toISOString().split("T")[0];
}

// Function to save mood for the selected date
function setMood(moodName) {
  const dateKey = getDateKey(currentDate);
  moodStorage[dateKey] = moodName;
  localStorage.setItem("moods", JSON.stringify(moodStorage));
  updateCalendar();
}

// Function to update the week view
function updateWeekView() {
  let startOfWeek = new Date(currentDate);
  startOfWeek.setDate(startOfWeek.getDate() - ((startOfWeek.getDay() + 6) % 7)); // Adjust to Monday
  let weekHTML = "<div class='calendar-grid'>";

  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    const dateKey = getDateKey(day);
    const moodEmoji = moodEmojis[moodStorage[dateKey]] || "";

    weekHTML += `<div class='day-box'>${day.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
    })}
      <span class="txt-xl">${moodEmoji}</span></div>`;
  }

  weekHTML += "</div>";
  calendar.innerHTML = weekHTML;
}

// Function to update the month view
function updateMonthView() {
  let firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  let lastDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );
  let monthHTML = "<div class='calendar-grid'>";

  // Add week day headers
  ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].forEach((day) => {
    monthHTML += `<div class='day-name-box'>${day}</div>`;
  });

  // Fill in empty spaces for days before the first day
  let startOffset = (firstDay.getDay() + 6) % 7;
  for (let i = 0; i < startOffset; i++) {
    monthHTML += `<div class='day-box'></div>`;
  }

  // Fill in the actual days
  for (let day = 1; day <= lastDay.getDate(); day++) {
    let dayDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    let dateKey = getDateKey(dayDate);
    let moodEmoji = moodEmojis[moodStorage[dateKey]] || "";
    let todayClass = dateKey === getDateKey(new Date()) ? "today" : "";

    monthHTML += `<div class='day-box ${todayClass}'>${day}  <span class="txt-lg">${moodEmoji}</span></div>`;
  }

  monthHTML += "</div>";
  calendar.innerHTML = monthHTML;
}

// Function to change the calendar view
function changeView(view) {
  currentView = view;
  updateCalendar();
}

// Navigation functions
prevBtn.addEventListener("click", () => {
  if (currentView === "day") {
    currentDate.setDate(currentDate.getDate() - 1);
  } else if (currentView === "week") {
    currentDate.setDate(currentDate.getDate() - 7);
  } else {
    currentDate.setMonth(currentDate.getMonth() - 1);
  }
  updateCalendar();
});

nextBtn.addEventListener("click", () => {
  if (currentView === "day") {
    currentDate.setDate(currentDate.getDate() + 1);
  } else if (currentView === "week") {
    currentDate.setDate(currentDate.getDate() + 7);
  } else {
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  updateCalendar();
});

todayBtn.addEventListener("click", () => {
  currentDate = new Date();
  updateCalendar();
});

// Initialize calendar on page load
updateCalendar();

function updateMoodSummary() {
  const moodCounts = {};

  // Count occurrences of each mood
  Object.values(moodStorage).forEach((mood) => {
    moodCounts[mood] = (moodCounts[mood] || 0) + 1;
  });

  // Convert to array, sort by count (descending)
  const sortedMoods = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]);

  // Display the summary
  const moodList = document.getElementById("moodList");

  if (sortedMoods.length > 0) {
    moodList.innerHTML = "";
    // moodList.innerHTML = ""; // Clear previous list

    sortedMoods.forEach(([mood, count]) => {
      const listItem = document.createElement("li");
      listItem.textContent = `${moodEmojis[mood]} ${
        count > 1 ? count + " times" : count + " time"
      } : ${mood}`;
      moodList.appendChild(listItem);
    });
  }
}

// Call this function inside `setMood()`
function setMood(moodName) {
  let dateKey = getDateKey(currentDate);
  moodStorage[dateKey] = moodName;
  localStorage.setItem("moods", JSON.stringify(moodStorage));

  updateCalendar(); // Refresh calendar
  updateMoodSummary(); // Update mood counts
}

// Call this function on page load to show saved moods
updateMoodSummary();

// function to reset local storrage
function resetLocalStorage() {
  localStorage.clear();
  // alert("Local storage has been reset!");
  location.reload(); // Reload the page to apply changes
}

const resetBtn = document.getElementById("resetall");
resetBtn.addEventListener("click", () => {
  if (confirm("Are you sure to reset all data?") == true) {
    resetLocalStorage();
  }
});

// this function just for testing, it adds random emojis in back dates to test
function addTestMoods(days = 10) {
  let testMoods = JSON.parse(localStorage.getItem("moods")) || {};

  const moodKeys = Object.keys(moodEmojis); // Get mood names (keys)

  for (let i = 0; i < days; i++) {
    let pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - Math.floor(Math.random() * 30)); // Random past day in last 30 days
    let dateKey = pastDate.toISOString().split("T")[0]; // Format as YYYY-MM-DD

    let randomMood = moodKeys[Math.floor(Math.random() * moodKeys.length)]; // Pick a random mood
    testMoods[dateKey] = randomMood; // Store mood by name

    console.log(
      `Added mood: ${moodEmojis[randomMood]} ${randomMood} on ${dateKey}`
    );

    location.reload();
  }

  localStorage.setItem("moods", JSON.stringify(testMoods));
  updateCalendar(); // Refresh the calendar
  updateMoodSummary(); // Refresh the mood summary

  // alert("Test moods added! Check your calendar and summary.");
}

const testData = document.getElementById("testData");
testData.addEventListener("click", () => {
  if (
    confirm("Are you sure to add dummy data in back dates to test?") == true
  ) {
    addTestMoods();
  }
});
