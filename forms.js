import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";

// Set your Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyDR3bpYN3tVSn3a-cYXlqnCSZSve8abKq0",
  authDomain: "feedbackxpert-86d7c.firebaseapp.com",
  projectId: "feedbackxpert-86d7c",
  storageBucket: "feedbackxpert-86d7c.appspot.com",
  messagingSenderId: "859190774604",
  appId: "1:859190774604:web:e225ace4e28e784d9d5de9",
  measurementId: "G-HWMRT75G17"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Set the base URL directly
const BASE_URL = "https://feedbackxpert-86d7c.web.app";

// Target div to display forms
const formList = document.getElementById("form-list");

// Listen to authentication state changes
onAuthStateChanged(auth, async (user) => {
  console.log("User state:", user);  // Log user status
  if (user) {
    const formQuery = query(
      collection(db, "form"),
      where("ownerId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(formQuery);
    if (querySnapshot.empty) {
      formList.innerHTML = "<p>No forms created yet.</p>";
      return;
    }

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const formCard = document.createElement("div");
      formCard.className = "form-card";

      formCard.innerHTML = `
        <h3>${data.formTitle}</h3>
        <p>${data.formDescription || "No description provided."}</p>
        <p>Status: <strong>${data.status}</strong></p>
        <p>Created: ${data.createdAt?.toDate().toLocaleString()}</p>
        <a href="${BASE_URL}/formDetails.html?id=${doc.id}">View Form</a>
      `;

      formList.appendChild(formCard);
    });
  } 
});
