# TODO: Fix Learning Module and Admin Group Chat Issues

## 1. Admin Join Group Chat
- [x] Fix condition in `pre/src/app/admin/group-chat/control/page.tsx` to show join button when admin is not a member

## 2. Quiz Grading Bug
- [x] Debug grading logic in `pre/src/app/learn/[id]/page.tsx` - add logging to verify answer comparison
- [x] Fix any case sensitivity or data type issues in answer checking

## 3. Show All Questions Before Results
- [x] Modify quiz UI in `pre/src/app/learn/[id]/page.tsx` to display all questions simultaneously
- [x] Remove one-by-one navigation, allow answering all questions at once
- [x] Ensure submit button appears only after all questions answered

## 4. Video Start Button and Proceed Logic
- [x] Add `videoStarted` state in `pre/src/app/learn/[id]/page.tsx`
- [x] Show start button with current progress percentage before video starts
- [x] Start progress tracking only after clicking start
- [x] Hide notes until video is completed
- [x] Add wait time/delay before enabling proceed to quiz option
