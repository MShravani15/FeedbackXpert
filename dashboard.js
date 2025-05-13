// const firebaseConfig = {
//   apiKey: "AIzaSyDR3bpYN3tVSn3a-cYXlqnCSZSve8abKq0",
//   authDomain: "feedbackxpert-86d7c.firebaseapp.com",
//   projectId: "feedbackxpert-86d7c",
//   storageBucket: "feedbackxpert-86d7c.appspot.com",
//   messagingSenderId: "859190774604",
//   appId: "1:859190774604:web:e225ace4e28e784d9d5de9",
//   measurementId: "G-HWMRT75G17"
// };

// // Initialize Firebase
// firebase.initializeApp(firebaseConfig);
// const auth = firebase.auth();
// const db = firebase.firestore();

// // DOM Elements
// const logoutLink = document.getElementById('logoutLink');
// const feedbackFormsLink = document.getElementById('feedbackFormsLink');
// const settingsLink = document.getElementById('settingsLink');
// const analyticsLink = document.getElementById('analyticsLink');
// const excelUploadBtn = document.getElementById('excelUploadBtn');
// const excelUploadModal = new bootstrap.Modal(document.getElementById('excelUploadModal'));
// const excelFile = document.getElementById('excelFile');
// const uploadBtn = document.getElementById('uploadBtn');
// const previewSection = document.getElementById('previewSection');
// const excelPreview = document.getElementById('excelPreview');
// const analyzeBtn = document.getElementById('analyzeBtn');
// const analysisResults = document.getElementById('analysisResults');
// const uploadProgress = document.getElementById('uploadProgress');
// const progressContainer = document.querySelector('.progress');
// const resultsContainer = document.getElementById('results');

// // Navigation Handlers
// function setupNavigation() {
//   // Logout
//   logoutLink.addEventListener('click', (e) => {
//     e.preventDefault();
//     auth.signOut().then(() => {
//       window.location.href = 'index.html';
//     }).catch((error) => {
//       console.error('Logout error:', error);
//       alert('Failed to logout. Please try again.');
//     });
//   });

//   // Feedback Forms - Navigate to forms page
//   feedbackFormsLink.addEventListener('click', (e) => {
//     e.preventDefault();
//     window.location.href = 'forms.html';
//   });

//   // Settings - Navigate to settings page
//   settingsLink.addEventListener('click', (e) => {
//     e.preventDefault();
//     window.location.href = 'settings.html';
//   });

//   // Analytics - Navigate to analytics page
//   analyticsLink.addEventListener('click', (e) => {
//     e.preventDefault();
//     window.location.href = 'analytics.html';
//   });

//   // Excel Upload Button Click (stays on same page)
//   excelUploadBtn.addEventListener('click', () => {
//     excelUploadModal.show();
//     resultsContainer.innerHTML = '';
//     excelFile.value = ''; // Reset file input
//     previewSection.style.display = 'none';
//     analysisSection.style.display = 'none';
//     uploadProgress.style.width = '0%';
//     progressContainer.style.display = 'none';
//   });
// }

// // File Input Change Handler (unchanged)
// excelFile.addEventListener('change', (e) => {
//   const file = e.target.files[0];
//   if (!file) return;

//   const reader = new FileReader();
//   reader.onload = (e) => {
//     try {
//       const data = new Uint8Array(e.target.result);
//       const workbook = XLSX.read(data, { type: 'array' });
//       const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
//       const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

//       displayExcelPreview(jsonData);
//     } catch (error) {
//       console.error('Error parsing Excel:', error);
//       alert('Error reading Excel file. Please check the format.');
//     }
//   };
//   reader.onerror = () => {
//     alert('Error reading file. Please try again.');
//   };
//   reader.readAsArrayBuffer(file);
// });

// // Display Excel Preview (unchanged)
// function displayExcelPreview(data) {
//   excelPreview.innerHTML = '';
  
//   if (!data || data.length === 0) {
//     excelPreview.innerHTML = '<tr><td colspan="10" class="text-center">No data found</td></tr>';
//     return;
//   }

//   // Create table headers
//   const thead = document.createElement('thead');
//   const headerRow = document.createElement('tr');
//   if (data.length > 0) {
//     data[0].forEach(cell => {
//       const th = document.createElement('th');
//       th.textContent = cell || 'Column';
//       headerRow.appendChild(th);
//     });
//   }
//   thead.appendChild(headerRow);
//   excelPreview.appendChild(thead);

//   // Create table body
//   const tbody = document.createElement('tbody');
//   const rowCount = Math.min(data.length, 6); // Show first 5 rows of data
//   for (let i = 1; i < rowCount; i++) {
//     const row = document.createElement('tr');
//     data[i].forEach(cell => {
//       const td = document.createElement('td');
//       td.textContent = cell || '';
//       row.appendChild(td);
//     });
//     tbody.appendChild(row);
//   }
//   excelPreview.appendChild(tbody);

//   previewSection.style.display = 'block';
//   uploadBtn.disabled = false;
// }

// // Upload Button Click Handler (unchanged)
// uploadBtn.addEventListener('click', () => {
//   const file = excelFile.files[0];
//   if (!file) {
//     alert('Please select a file first');
//     return;
//   }

//   // Reset UI
//   analysisResults.innerHTML = '';
//   progressContainer.style.display = 'block';
//   uploadBtn.disabled = true;

//   // Start progress animation
//   let progress = 0;
//   const progressInterval = setInterval(() => {
//     progress += 10;
//     uploadProgress.style.width = `${progress}%`;
    
//     if (progress >= 100) {
//       clearInterval(progressInterval);
//       // Start actual file processing after animation completes
//       setTimeout(() => processExcelUpload(file), 300);
//     }
//   }, 150);
// });

// // Process Excel File Upload (unchanged)
// async function processExcelUpload(file) {
//   try {
//     analysisResults.innerHTML = '<div class="text-center my-4"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div><p>Analyzing data...</p></div>';
    
//     const formData = new FormData();
//     formData.append('file', file);

//     const response = await fetch('http://localhost:5000/analyze', {
//       method: 'POST',
//       body: formData
//     });

//     if (!response.ok) {
//       throw new Error(`Server returned ${response.status} status`);
//     }

//     const results = await response.json();
//     renderVisualizations(results);
//     analysisSection.style.display = 'block';
//   } catch (error) {
//     console.error('Analysis error:', error);
//     analysisResults.innerHTML = `
//       <div class="alert alert-danger">
//         <h5>Analysis Failed</h5>
//         <p>${error.message || 'Please try again later'}</p>
//       </div>
//     `;
//   } finally {
//     uploadBtn.disabled = false;
//   }
// }

// // Render Visualization Charts (unchanged)
// function renderVisualizations(data) {
//   analysisResults.innerHTML = '';
  
//   if (!data || (!data.multiple_choice && !data.text_analysis)) {
//     analysisResults.innerHTML = '<div class="alert alert-info">No analyzable data found in the file</div>';
//     return;
//   }

//   // Process multiple choice questions
//   if (data.multiple_choice && Object.keys(data.multiple_choice).length > 0) {
//     const mcSection = document.createElement('div');
//     mcSection.innerHTML = '<h4 class="mb-4">Multiple Choice Results</h4>';
//     analysisResults.appendChild(mcSection);

//     for (const [question, counts] of Object.entries(data.multiple_choice)) {
//       const card = document.createElement('div');
//       card.className = 'card mb-4';
//       card.innerHTML = `
//         <div class="card-header bg-light">
//           <h5 class="mb-0">${question}</h5>
//         </div>
//         <div class="card-body">
//           <div class="chart-container" style="height: 300px">
//             <canvas id="chart-${question.replace(/\W+/g, '-')}"></canvas>
//           </div>
//         </div>
//       `;
//       analysisResults.appendChild(card);
      
//       new Chart(document.getElementById(`chart-${question.replace(/\W+/g, '-')}`), {
//         type: 'pie',
//         data: {
//           labels: Object.keys(counts.options),
//           datasets: [{
//             data: Object.values(counts.options),
//             backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
//           }]
//         },
//         options: {
//           responsive: true,
//           maintainAspectRatio: false,
//           plugins: {
//             tooltip: {
//               callbacks: {
//                 label: function(context) {
//                   const label = context.label || '';
//                   const value = context.raw || 0;
//                   const percentage = counts.percentages[context.label] || 0;
//                   return `${label}: ${value} (${percentage}%)`;
//                 }
//               }
//             },
//             legend: {
//               position: 'right'
//             }
//           }
//         }
//       });
//     }
//   }

//   // Process text responses
//   if (data.text_analysis && Object.keys(data.text_analysis).length > 0) {
//     const textSection = document.createElement('div');
//     textSection.innerHTML = '<h4 class="mb-4">Text Analysis Results</h4>';
//     analysisResults.appendChild(textSection);

//     for (const [question, analysis] of Object.entries(data.text_analysis)) {
//       const card = document.createElement('div');
//       card.className = 'card mb-4';
//       card.innerHTML = `
//         <div class="card-header bg-light">
//           <h5 class="mb-0">${question}</h5>
//         </div>
//         <div class="card-body">
//           <div class="row">
//             <div class="col-md-6">
//               <div class="chart-container" style="height: 300px">
//                 <canvas id="sentiment-chart-${question.replace(/\W+/g, '-')}"></canvas>
//               </div>
//             </div>
//             <div class="col-md-6">
//               <h6>Sample Responses</h6>
//               <div class="sample-responses" style="max-height: 300px; overflow-y: auto">
//                 ${analysis.sample_responses.map(r => 
//                   `<div class="mb-2 p-2 border rounded">${r || 'No text'}</div>`
//                 ).join('')}
//               </div>
//             </div>
//           </div>
//         </div>
//       `;
//       analysisResults.appendChild(card);
      
//       new Chart(document.getElementById(`sentiment-chart-${question.replace(/\W+/g, '-')}`), {
//         type: 'bar',
//         data: {
//           labels: ['Positive', 'Negative', 'Neutral'],
//           datasets: [{
//             label: 'Response Count',
//             data: [
//               analysis.sentiment_distribution.positive || 0,
//               analysis.sentiment_distribution.negative || 0,
//               analysis.sentiment_distribution.neutral || 0
//             ],
//             backgroundColor: ['#4BC0C0', '#FF6384', '#FFCE56']
//           }]
//         },
//         options: {
//           responsive: true,
//           maintainAspectRatio: false,
//           scales: {
//             y: {
//               beginAtZero: true,
//               ticks: {
//                 precision: 0
//               }
//             }
//           }
//         }
//       });
//     }
//   }
// }

// // Check Auth State
// auth.onAuthStateChanged((user) => {
//   if (!user) {
//     window.location.href = 'index.html';
//   } else {
//     // Initialize navigation
//     setupNavigation();
    
//     // Only initialize dashboard-specific features if we're on the dashboard
//     if (window.location.pathname.includes('dashboard.html')) {
//       // Initialize any dashboard-specific features here
//     }
//   }
// });

// // Initialize the dashboard
// if (window.location.pathname.includes('dashboard.html')) {
//   // Any additional initialization for dashboard page
// }

// Initialize Firebase (replace with your config)
const firebaseConfig = {
  apiKey: "AIzaSyDR3bpYN3tVSn3a-cYXlqnCSZSve8abKq0",
  authDomain: "feedbackxpert-86d7c.firebaseapp.com",
  projectId: "feedbackxpert-86d7c",
  storageBucket: "feedbackxpert-86d7c.appspot.com",
  messagingSenderId: "859190774604",
  appId: "1:859190774604:web:e225ace4e28e784d9d5de9",
  measurementId: "G-HWMRT75G17"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Handle logout
document.getElementById('logoutLink').addEventListener('click', () => {
  auth.signOut().then(() => {
    window.location.href = "login.html"; // Redirect to login
  });
});

// Handle Excel upload button click
document.getElementById('excelUploadBtn').addEventListener('click', () => {
  const modal = new bootstrap.Modal(document.getElementById('excelUploadModal'));
  modal.show();
});

// Handle Excel file upload
document.getElementById('uploadBtn').addEventListener('click', () => {
  const fileInput = document.getElementById('excelFile');
  const file = fileInput.files[0];
  if (!file) {
    alert("Please select a file.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

    // Show preview
    const previewTable = document.getElementById('excelPreview');
    previewTable.innerHTML = '';
    jsonData.forEach((row, i) => {
      const tr = document.createElement('tr');
      row.forEach(cell => {
        const cellElement = document.createElement(i === 0 ? 'th' : 'td');
        cellElement.textContent = cell;
        tr.appendChild(cellElement);
      });
      previewTable.appendChild(tr);
    });

    document.getElementById('previewSection').style.display = 'block';
    document.getElementById('analysisSection').style.display = 'block';
  };

  reader.readAsArrayBuffer(file);
});

// Handle Analyze button
document.getElementById('analyzeBtn').addEventListener('click', () => {
  // You can call your sentiment analysis or ML model logic here
  document.getElementById('analysisResults').innerHTML = "<p>Analysis result will appear here...</p>";
});
