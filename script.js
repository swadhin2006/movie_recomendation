const API_URL = 'http://127.0.0.1:8000';

// DOM Elements
const movieInput = document.getElementById('movieInput');
const searchBtn = document.getElementById('searchBtn');
const loadingSpinner = document.getElementById('loadingSpinner');
const resultsSection = document.getElementById('resultsSection');
const initialState = document.getElementById('initialState');
const errorMessage = document.getElementById('errorMessage');
const matchedMovie = document.getElementById('matchedMovie');
const recommendationsContainer = document.getElementById('recommendationsContainer');

// Event Listeners
searchBtn.addEventListener('click', searchMovie);
movieInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchMovie();
    }
});

// Search Movie Function
async function searchMovie() {
    const movieName = movieInput.value.trim();

    if (!movieName) {
        showError('Please enter a movie name');
        return;
    }

    // Reset UI
    clearError();
    showLoading(true);
    resultsSection.classList.add('hidden');
    initialState.classList.add('hidden');

    try {
        const response = await fetch(`${API_URL}/recommendation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ movie: movieName })
        });

        if (!response.ok) {
            throw new Error('Failed to get recommendations');
        }

        const data = await response.json();
        displayResults(data);
    } catch (error) {
        console.error('Error:', error);
        showError(`Unable to find "${movieName}". Try another movie name!`);
        initialState.classList.remove('hidden');
    } finally {
        showLoading(false);
    }
}

// Display Results
function displayResults(data) {
    // Display matched movie
    displayMatchedMovie(data.matched_movies);

    // Display recommendations
    displayRecommendations(data.recommendations);

    // Show results section
    resultsSection.classList.remove('hidden');
    initialState.classList.add('hidden');

    // Scroll to results
    setTimeout(() => {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// Display Matched Movie
function displayMatchedMovie(movieTitle) {
    matchedMovie.innerHTML = `
        <div class="movie-title">
            ⭐ ${movieTitle}
        </div>
        <p style="color: var(--text-secondary); margin-top: 10px;">
            Based on this movie, we found great recommendations!
        </p>
    `;
}

// Display Recommendations
function displayRecommendations(recommendations) {
    recommendationsContainer.innerHTML = '';

    if (recommendations.length === 0) {
        recommendationsContainer.innerHTML = '<p style="grid-column: 1/-1;">No recommendations found.</p>';
        return;
    }

    recommendations.forEach((movie, index) => {
        const card = document.createElement('div');
        card.className = 'recommendation-card';
        card.innerHTML = `
            <div class="rec-number">${index + 1}</div>
            <div class="rec-title">${movie}</div>
        `;

        // Add staggered animation
        card.style.animation = `fadeIn 0.6s ease-out ${0.1 + index * 0.05}s both`;

        recommendationsContainer.appendChild(card);
    });
}

// Show Loading Spinner
function showLoading(show) {
    if (show) {
        loadingSpinner.classList.remove('hidden');
    } else {
        loadingSpinner.classList.add('hidden');
    }
}

// Show Error Message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    errorMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Clear Error Message
function clearError() {
    errorMessage.classList.add('hidden');
}

// Initialize
window.addEventListener('load', () => {
    movieInput.focus();
});
