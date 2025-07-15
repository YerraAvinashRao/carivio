import { getFirestore, doc, getDoc, getDocs, collection, query, where } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import firebaseConfig from "../firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const careerSelect = document.getElementById("careerSelect");
const courseSelect = document.getElementById("courseSelect");
const collegeSelect = document.getElementById("collegeSelect");
const resultContainer = document.getElementById("comparisonResult");

// 1. Load Careers
async function loadCareers() {
  const careers = await getDocs(collection(db, "careers"));
  careers.forEach(docSnap => {
    const opt = new Option(docSnap.data().name, docSnap.id);
    careerSelect.appendChild(opt);
  });
}

// 2. On Career Change → Load Courses
careerSelect.addEventListener("change", async () => {
  courseSelect.innerHTML = `<option>Select a course</option>`;
  const careerId = careerSelect.value;
  const courses = await getDocs(collection(db, `careers/${careerId}/courses`));
  courses.forEach(courseDoc => {
    const opt = new Option(courseDoc.data().name, courseDoc.id);
    courseSelect.appendChild(opt);
  });
});

// 3. On Course Change → Load Colleges
courseSelect.addEventListener("change", async () => {
  collegeSelect.innerHTML = `<option>Select a college</option>`;
  const courseId = courseSelect.value;

  const q = query(collection(db, "colleges"), where("offeredCourses", "array-contains", courseId));
  const colleges = await getDocs(q);

  colleges.forEach(college => {
    const opt = new Option(college.data().name, college.id);
    collegeSelect.appendChild(opt);
  });
});

// 4. Final Compare Logic
document.getElementById("compareForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const [careerId, courseId, collegeId] = [
    careerSelect.value,
    courseSelect.value,
    collegeSelect.value
  ];

  const careerData = (await getDoc(doc(db, "careers", careerId))).data();
  const courseData = (await getDoc(doc(db, "courses", courseId))).data();
  const collegeData = (await getDoc(doc(db, "colleges", collegeId))).data();

  resultContainer.innerHTML = `
    <div class="career-box">
      <h3>Career: ${careerData.name}</h3>
      <p>${careerData.description}</p>
      <strong>Avg. Salary:</strong> ₹${careerData.averageSalary}
    </div>

    <div class="career-box">
      <h3>Course: ${courseData.name}</h3>
      <p>Duration: ${courseData.duration || "N/A"}</p>
      <p>Linked Career: ${careerData.name}</p>
    </div>

    <div class="career-box">
      <h3>College: ${collegeData.name}</h3>
      <p>Location: ${collegeData.location}</p>
      <p>Offers: ${courseData.name}</p>
    </div>
  `;
});
