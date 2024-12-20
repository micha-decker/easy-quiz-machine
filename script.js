// Version 2 - Quiz Application
const questionElement = document.getElementById('question');
const answerButtons = document.getElementById('answer-buttons');
const nextButton = document.getElementById('next-btn');
const questionContainer = document.getElementById('question-container');
const questionsModal = document.getElementById('questions-modal');
const fetchedQuestionsElement = document.getElementById('fetched-questions');
const startQuizButton = document.getElementById('start-quiz-btn');
const welcomeModal = document.getElementById('welcome-modal');
const startWelcomeButton = document.getElementById('start-welcome-btn');
const correctSound = document.getElementById('correctSound');
const incorrectSound = document.getElementById('incorrectSound');

// Create Audio Context
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Create gain nodes (volume control)
const correctGain = audioContext.createGain();
const incorrectGain = audioContext.createGain();

// Set volume to a much lower value
correctGain.gain.value = 0.01;    // Changed from 0.1 to 0.01 (1% volume)
incorrectGain.gain.value = 0.01;  // Changed from 0.1 to 0.01 (1% volume)

// Connect gain nodes to audio context destination
correctGain.connect(audioContext.destination);
incorrectGain.connect(audioContext.destination);

// Create sources once
const correctSource = audioContext.createMediaElementSource(correctSound);
const incorrectSource = audioContext.createMediaElementSource(incorrectSound);

// Connect sources to gain nodes
correctSource.connect(correctGain);
incorrectSource.connect(incorrectGain);

// Function to play sound with Web Audio API
function playSound(audio, gainNode) {
    // Resume AudioContext if it's suspended
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    audio.currentTime = 0;
    audio.play();
}

// ADD DEBUG CODE HERE
console.log('Correct sound loaded:', correctSound?.readyState);
console.log('Incorrect sound loaded:', incorrectSound?.readyState);

incorrectSound.addEventListener('canplaythrough', () => {
    console.log('Incorrect sound is ready to play');
});
correctSound.addEventListener('canplaythrough', () => {
    console.log('Correct sound is ready to play');
});

console.log('Welcome Modal:', welcomeModal);
console.log('Start Welcome Button:', startWelcomeButton);





// Test click handler
startWelcomeButton.addEventListener('click', async () => {
    console.log('Button clicked');
    welcomeModal.classList.add('hidden');
    displayFetchedQuestions(); // Show the questions count modal after welcome modal is hidden
});

let currentQuestionIndex = 0;
let score = 0;
let questions = []; // Declare questions globally

async function fetchQuestions() {
    try {
        const response = await fetch('https://script.googleusercontent.com/macros/echo?user_content_key=zsQJYvVz_MBhtdknOzz1lnp-idDACXvx0as6m7lXnhP33aRhPKQV4A0e7H-s2DMwcVuB6AvnG1Ete55f3dZLzaZBvg5ib2Vym5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnM_myL8iHKko1Pcj3FXFf_-yM_tp3W5Yb4nUTTBf-1qUmvydXpxK2qyrMtyN-wZPHJ4HNzxp9TDcirn6rtlmQDjlAQl5JkaBtQ&lib=MzXRKkwkFe_jAbkGD0bP32FBVJNP6x9cr'); // Replace with your actual URL
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const questions = await response.json();
        return questions;
    } catch (error) {
        console.error('Error fetching questions:', error);
        alert('Failed to load questions. Please check the console for more details.');
        return []; // Return an empty array to prevent errors later
    }
}

async function startQuiz() {
    console.log('startQuiz called');
    welcomeModal.classList.remove('hidden');
    questions = await fetchQuestions();
}

function displayFetchedQuestions() {
    fetchedQuestionsElement.innerHTML = ''; // Clear previous content
    
    // Create and style the count display
    const countDisplay = document.createElement('p');
    countDisplay.textContent = `${questions.length} Questions`;
    countDisplay.className = 'text-4xl font-bold text-center mb-4'; // Add Tailwind classes for big text
    
    fetchedQuestionsElement.appendChild(countDisplay);
    questionsModal.classList.remove('hidden'); // Show the modal
}

startQuizButton.addEventListener('click', () => {
    questionsModal.classList.add('hidden'); // Hide the modal
    questionContainer.classList.remove('hidden'); // Show the question container
    currentQuestionIndex = 0;
    score = 0;
    nextButton.innerHTML = 'Next';
    showQuestion(); // Start showing questions
});

function showQuestion() {
    resetState();
    let currentQuestion = questions[currentQuestionIndex];
    questionElement.innerHTML = currentQuestion.question;

    // Shuffle the answers
    shuffle(currentQuestion.answers);

    currentQuestion.answers.forEach(answer => {
        const button = document.createElement('button');
        button.innerHTML = answer.text;
        button.className = 'w-full p-4 text-left bg-white rounded-xl border-2 border-gray-200 text-lg font-medium';
        answerButtons.appendChild(button);
        if (answer.correct) {
            button.dataset.correct = answer.correct;
        }
        button.addEventListener('click', selectAnswer);
    });
}

function resetState() {
    nextButton.style.display = 'none';
    while (answerButtons.firstChild) {
        answerButtons.removeChild(answerButtons.firstChild);
    }
}

function selectAnswer(e) {
    const selectedButton = e.target;
    const correct = selectedButton.dataset.correct;

    if (correct) {
        if (correctSound) {
            try {
                playSound(correctSound, correctGain);
                score++;
            } catch (error) {
                console.log('Error playing correct sound:', error);
            }
        }
    } else {
        if (incorrectSound) {
            try {
                playSound(incorrectSound, incorrectGain);
            } catch (error) {
                console.log('Error playing incorrect sound:', error);
            }
        }
    }

    Array.from(answerButtons.children).forEach(button => {
        // Remove any previous orange border from all buttons
        button.classList.remove('border-4', 'border-orange-500');

        // Reset background colors for all buttons
        button.classList.remove('bg-green-500', 'bg-red-500', 'text-black', 'text-white');

        // Disable hover effect
        button.classList.add('no-hover'); // Add no-hover class

        // Check if the button is the selected one
        if (button === selectedButton) {
            // Add orange border to the selected button
            button.classList.add('border-4', 'border-orange-500');

            if (correct) {
                // Apply green background for the correct answer
                button.classList.add('bg-green-500', 'text-black');
            } else {
                // Apply red background for the wrong answer that was selected
                button.classList.add('bg-red-500', 'text-white');
            }
        } else if (button.dataset.correct) {
            // Apply green background for the correct answer
            button.classList.add('bg-green-500', 'text-black');
        } else {
            // Apply red background for the wrong answer
            button.classList.add('bg-red-500', 'text-white');
        }
        button.disabled = true; // Disable all buttons after selection
    });

    nextButton.style.display = 'block'; // Show the next button
}

nextButton.addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        questionElement.innerHTML = `Quiz completed! You scored ${score} out of ${questions.length}!`;
        nextButton.innerHTML = 'Restart';
        nextButton.addEventListener('click', startQuiz);
    }
});

startWelcomeButton.addEventListener('click', () => {
    console.log('Start welcome button clicked'); // Debug log
    welcomeModal.classList.add('hidden');
});

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded fired');
    startQuiz();
});

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
