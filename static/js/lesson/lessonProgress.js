// Progress tracking utilities for lesson system

export function updateProgressDisplay(lessonData, lessonProgress) {
    const totalBlocks = lessonData.blocks ? lessonData.blocks.length : 0;
    const completedBlocks = lessonProgress.completed_blocks ? lessonProgress.completed_blocks.length : 0;
    const progress = totalBlocks > 0 ? Math.round((completedBlocks / totalBlocks) * 100) : 0;
    const progressBar = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-percentage');
    const completedText = document.getElementById('completed-blocks-text');
    if (progressBar) progressBar.style.width = progress + '%';
    if (progressText) progressText.textContent = progress + '%';
    if (completedText) completedText.textContent = `${completedBlocks} of ${totalBlocks} blocks completed`;
    lessonProgress.progress = progress;
}
