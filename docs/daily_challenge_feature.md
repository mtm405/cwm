# Daily Challenge Feature Documentation

## Overview

The Daily Challenge feature provides students with a daily programming problem or quiz to solve, earning XP and PyCoins upon completion. Challenges help reinforce learning, build consistency through streaks, and encourage daily engagement with the platform.

## Features

### For Students

- **Daily Challenge**: A new challenge becomes available each day
- **Multiple Challenge Types**: 
  - Code Challenges (write and test code)
  - Quizzes (multiple choice questions)
  - Text Questions (written answers)
- **Instant Feedback**: Get immediate feedback on challenge solutions
- **Rewards**: Earn XP and PyCoins for completing challenges
- **Streaks**: Build a streak by completing challenges on consecutive days
- **Achievement Tracking**: Unlock achievements for challenge milestones

### For Instructors/Admins

- **Challenge Management**: Create and edit daily challenges
- **Challenge Monitoring**: Track student engagement and completion rates
- **Progress Tracking**: View student progress and streak statistics
- **Rewards Customization**: Adjust XP/PyCoin rewards based on difficulty

## Technical Implementation

### Frontend Components

- **DashboardChallengeManager.js**: Manages the display and interaction with daily challenges on the dashboard
- **DailyChallenge.js**: Handles fetching, rendering, and validating challenge solutions
- **DashboardStreakTracker.js**: Visualizes and tracks user challenge streaks

### Backend Services

- **challenge_api.py**: API endpoints for fetching, submitting, and validating daily challenges
- **user_streak_api.py**: API endpoints for managing user streaks and challenge completion data
- **AppUtils.js**: Utility functions for streak calculation, time display, and reward formatting

### Data Models

- **Challenge Model**: Defines the structure of challenge data
- **User Challenge History**: Tracks completed challenges, streaks, and rewards
- **Achievements**: Defines milestones related to daily challenges

## Challenge Types

### Code Challenges

Students write code to solve a programming problem with:
- Instructions
- Initial code template
- Test cases for validation
- Hints (optional)

### Quizzes

Multiple choice questions with:
- Question text
- Multiple options
- Single correct answer per question
- Overall passing score threshold

### Text Questions

Open-ended questions with:
- Question text
- Expected answer patterns or keywords
- Case-insensitive matching

## Streak System

- **Daily Streak**: Consecutive days of challenge completion
- **Streak Counter**: Visual display of current and longest streaks
- **Calendar View**: Visualization of challenge activity over time
- **Streak Bonuses**: Additional rewards for milestone streaks (7, 14, 30 days)

## Firebase Integration

- **daily_challenges** collection: Stores all challenge data
- **user_challenges** collection: Tracks user completion and progress
- **users** collection: Stores streak data, XP, and PyCoins

## Getting Started

### For Developers

1. Review the code in DailyChallenge.js and DashboardChallengeManager.js
2. Add new challenge types by extending the challengeHandlers object
3. Upload sample challenges using upload_daily_challenges.py

### For Instructors

1. Access the dashboard to view student challenge progress
2. Create new challenges via the admin interface
3. Monitor student engagement and streaks

## Customization

- Adjust challenge difficulty and rewards in the challenge data
- Customize streak thresholds and bonus rewards
- Add new achievement types related to challenges

## Troubleshooting

- **Challenge Not Loading**: Check that the daily_challenges collection has entries for the current date
- **Streak Not Updating**: Verify that the update_streak function is being called on successful submissions
- **Rewards Not Applied**: Ensure the record_challenge_completion function is working correctly
