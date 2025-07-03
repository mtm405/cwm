// Entry point for lesson system

import { transformLessonDataToBlocks, normalizeLessonData } from './lessonData.js';
import { renderLessonBlocks } from './lessonRenderer.js';
import { updateProgressDisplay } from './lessonProgress.js';
import { showNotification } from './lessonNotifications.js';
import { initSubtopicNavigation } from './lessonSubtopicNavigation.js';
import { initInteractiveElements } from './lessonInteractiveElements.js';
import { showLessonFallback, hideLessonFallback } from './lessonFallback.js';


try {
  hideLessonFallback();
  // Get lesson data from injected variable (replace as needed)
  const rawLessonData = window.lessonData || {};
  const DataStructureNormalizer = window.DataStructureNormalizer;
  const lessonData = normalizeLessonData(transformLessonDataToBlocks(rawLessonData), DataStructureNormalizer);
  const lessonProgress = window.lessonProgress || { completed_blocks: [], progress: 0, current_block: 0 };

  // Render blocks
  renderLessonBlocks(lessonData.blocks, lessonProgress);
  updateProgressDisplay(lessonData, lessonProgress);

  // Initialize modular features
  initSubtopicNavigation();
  initInteractiveElements();

  // Example notification
  showNotification('Lesson loaded!', 'success');

  // Optionally: expose for debugging (remove in production)
  // window.lessonData = lessonData;
  // window.lessonProgress = lessonProgress;
} catch (err) {
  console.error('Lesson system error:', err);
  showLessonFallback('A problem occurred loading the lesson. Please try again or contact support.');
}
