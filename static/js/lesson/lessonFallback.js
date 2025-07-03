// Handles fallback UI and error display for lessons
export function showLessonFallback(message = 'An error occurred loading this lesson.') {
  const fallback = document.getElementById('lesson-fallback');
  if (fallback) {
    fallback.textContent = message;
    fallback.style.display = 'block';
  } else {
    alert(message);
  }
}

export function hideLessonFallback() {
  const fallback = document.getElementById('lesson-fallback');
  if (fallback) fallback.style.display = 'none';
}
