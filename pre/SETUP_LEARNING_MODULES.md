# 🚀 Quick Setup: Learning Modules

## Step 1: Run Database Migration

```bash
npx prisma db push
```

This adds the `imageUrl` column to the `learning_questions` table.

---

## Step 2: Restart Your Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

---

## Step 3: Create Your First Module (Admin)

1. **Go to**: http://localhost:3001/admin/learn
2. **Click**: "Create New Module"
3. **Fill in**:
   ```
   Title: Introduction to Algebra
   Description: Learn basic algebra concepts
   Topic: algebra
   Video URL: https://www.youtube.com/watch?v=YOUR_VIDEO_ID
   Thumbnail: (optional)
   Duration: 300 (5 minutes in seconds)
   Gem Reward: 10
   Active: ✓ Yes
   Order: 1
   ```
4. **Click**: "Create Module"

---

## Step 4: Add Questions

1. **Select** your module from the list
2. **Click**: "Add Question"
3. **Add 5 questions** like this:

**Question 1:**
```
Prompt: What is 2 + 2?
Choice A: 3
Choice B: 4 ✓ (correct)
Choice C: 5
Choice D: 6
Explanation: 2 + 2 equals 4
Image URL: (optional)
Order: 1
```

**Question 2:**
```
Prompt: Solve for x: x + 5 = 10
Choice A: 3
Choice B: 4
Choice C: 5 ✓ (correct)
Choice D: 6
Explanation: x = 10 - 5 = 5
Order: 2
```

(Add 3 more similar questions)

---

## Step 5: Test as Student

1. **Go to**: http://localhost:3001/learn
2. **Click** on your module
3. **Watch video** (or wait for 90% progress)
4. **Click** "Start Quiz"
5. **Answer all questions**
6. **Click** "Submit Quiz"
7. **See results** and gem reward! 🎉

---

## 🎯 Quick Tips

### For YouTube Videos:
- Use format: `https://www.youtube.com/watch?v=VIDEO_ID`
- Or: `https://youtu.be/VIDEO_ID`
- System auto-converts to embed format

### For Images in Questions:
- Upload to Cloudinary first
- Copy the URL
- Paste in "Image URL" field
- Supports: JPG, PNG, GIF, WebP

### For Gem Rewards:
- Set to 0 for no reward
- Students must score 70%+ to earn gems
- Gems auto-added to wallet

---

## 🔧 Troubleshooting

### "Can't reach database"
```bash
# Check your .env has correct Supabase URLs
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
```

### "Module not found"
- Make sure module is set to "Active"
- Refresh the page
- Check admin panel

### "Video won't play"
- Check video URL is correct
- Try YouTube embed format
- Check video is public

### "Gems not awarded"
- Check score is 70% or higher
- Check module has gem reward set
- Check wallet exists for user

---

## ✅ You're Done!

Your Learning Modules feature is now live and ready to use! 🎓

**Next**: Create more modules and questions to build your course library!
