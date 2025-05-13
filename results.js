document.addEventListener('DOMContentLoaded', () => {
    const results = JSON.parse(sessionStorage.getItem('predictionResults'));

    if (!results || !results.data) {
        document.querySelector('.results-container').innerHTML = '<p>No results available.</p>';
        return;
    }

    const { multiple_choice, text_analysis } = results.data;

    const container = document.querySelector('.results-container');

    // Create pie charts for multiple choice
    for (const question in multiple_choice) {
        const data = multiple_choice[question];
        const canvas = document.createElement('canvas');
        container.appendChild(document.createElement('hr'));
        container.appendChild(document.createElement('h2')).textContent = question;
        container.appendChild(canvas);

        new Chart(canvas, {
            type: 'pie',
            data: {
                labels: Object.keys(data.percentages),
                datasets: [{
                    data: Object.values(data.percentages),
                    backgroundColor: ['#4caf50', '#f44336', '#ff9800', '#2196f3'],
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'Responses Distribution (%)'
                    }
                }
            }
        });
    }

    // Create bar charts for sentiment analysis
    for (const question in text_analysis) {
        const analysis = text_analysis[question];
        const canvas = document.createElement('canvas');
        container.appendChild(document.createElement('hr'));
        container.appendChild(document.createElement('h2')).textContent = `Sentiment Analysis - ${question}`;
        container.appendChild(canvas);

        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: Object.keys(analysis.sentiment_distribution),
                datasets: [{
                    label: 'Responses',
                    data: Object.values(analysis.sentiment_distribution),
                    backgroundColor: ['#66bb6a', '#ef5350', '#ffa726']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: 'Sentiment Distribution'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // Display sample comments
        if (analysis.sample_responses && analysis.sample_responses.length > 0) {
            const ul = document.createElement('ul');
            ul.innerHTML = analysis.sample_responses.map(resp => `<li>${resp}</li>`).join('');
            container.appendChild(ul);
        }
    }
});
