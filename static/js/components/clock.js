/**
 * Clock Component
 * Handles live clock updates and user interactions.
 */

function showClockOptions() {
    // Placeholder for showing clock options
    console.log('Clock options triggered.');
    // You can expand this to show a modal with timezone settings, etc.
}

function updateLiveClock() {
    const timeDisplay = document.querySelector('.live-clock .time-display');
    const periodDisplay = document.querySelector('.live-clock .period-display');

    if (timeDisplay && periodDisplay) {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';

        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        const hoursStr = hours.toString().padStart(2, '0');

        timeDisplay.textContent = `${hoursStr}:${minutes}:${seconds}`;
        periodDisplay.textContent = ampm;
    }
}

// Initialize clock
setInterval(updateLiveClock, 1000);
