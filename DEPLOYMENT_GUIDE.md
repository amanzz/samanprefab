# 🚀 Saman Prefab - Vercel Deployment Guide
**Kid-Friendly Step-by-Step Guide to Make Your Website Live!**

---

## 📋 What You'll Need (Prerequisites)

Before we start, make sure you have:
- ✅ A **GitHub account** (free at github.com)
- ✅ A **Vercel account** (free at vercel.com)
- ✅ Your project code on GitHub
- ✅ A database (we'll use Vercel Postgres - it's free!)

---

## 🎯 Step 1: Push Your Code to GitHub

1. **Open your terminal** (command prompt)
2. **Go to your project folder:**
   ```bash
   cd /Applications/XAMPP/xamppfiles/htdocs/saman-prefab
   ```

3. **Initialize Git** (if not already done):
   ```bash
   git init
   ```

4. **Create a .gitignore file** to exclude unnecessary files:
   ```bash
   echo "node_modules
   .env
   .env.local
   .next
   dist
   *.log
   .turbo" > .gitignore
   ```

5. **Add all your files:**
   ```bash
   git add .
   ```

6. **Commit your changes:**
   ```bash
   git commit -m "Initial commit"
   ```

7. **Create a new repository on GitHub** (go to github.com → New repository)
8. **Link your local repo to GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

---

## 🎯 Step 2: Set Up Database on Vercel

Your project needs a database to store products, blogs, etc. We'll use **Vercel Postgres** (it's free and easy!).

1. **Go to Vercel Dashboard** (vercel.com/dashboard)
2. **Click "Storage"** in the left sidebar
3. **Click "Create Database"**
4. **Select "Postgres"** and click "Continue"
5. **Choose a region** (pick the one closest to your users)
6. **Click "Create"**
7. **Wait for it to be created** (takes about 1-2 minutes)

---

## 🎯 Step 3: Get Your Database Connection Details

1. **Click on your new database** in Vercel Storage
2. **Go to the ".env" tab**
3. **Copy the connection string** - it looks like:
   ```
   postgresql://user:password@host/database
   ```
4. **Save this somewhere safe** - you'll need it later!

---

## 🎯 Step 4: Create Environment Variables

Your project needs environment variables to work. Let's set them up!

1. **In Vercel Dashboard, go to your project settings**
2. **Click "Environment Variables"** in the left sidebar
3. **Add these variables:**

   | Variable Name | Value |
   |--------------|-------|
   | `DATABASE_URL` | Your Vercel Postgres connection string |
   | `NEXT_PUBLIC_API_URL` | Your future Vercel URL (we'll set this later) |
   | `API_URL` | Your future Vercel URL (we'll set this later) |
   | `JWT_SECRET` | A random secret string (generate one at: https://generate-random.org/api-key-generator) |

4. **For now, set:**
   - `NEXT_PUBLIC_API_URL` = `https://your-project.vercel.app/api/v1`
   - `API_URL` = `https://your-project.vercel.app`

5. **Click "Save"**

---

## 🎯 Step 5: Deploy Your Project to Vercel

Now the exciting part - making your website live! 🎉

### Option A: Connect from Vercel (Easiest!)

1. **Go to Vercel Dashboard**
2. **Click "Add New..." → "Project"**
3. **Click "Import"** next to your GitHub repository
4. **Configure your project:**
   - **Framework Preset:** Next.js
   - **Root Directory:** `./` (leave as is)
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

5. **Click "Deploy"**
6. **Wait for the deployment** (takes 2-5 minutes)
7. **Your site is now live!** 🎊

### Option B: Using Vercel CLI (For Advanced Users)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

---

## 🎯 Step 6: Run Database Migrations

Your database needs tables to store data. Let's create them!

1. **Go to your Vercel project dashboard**
2. **Click "Storage"** → your database
3. **Click "Query"** tab
4. **Copy your migration files** from:
   - `packages/db/src/schema/`
5. **Run each migration SQL file** in the Query editor
6. **Or use Drizzle Kit** (if you have it set up):
   ```bash
   npm run db:migrate
   ```

---

## 🎯 Step 7: Update Environment Variables with Real URL

Now that your site is deployed, update the URLs:

1. **Copy your Vercel URL** (like: `https://saman-prefab.vercel.app`)
2. **Go back to Environment Variables**
3. **Update:**
   - `NEXT_PUBLIC_API_URL` = `https://saman-prefab.vercel.app/api/v1`
   - `API_URL` = `https://saman-prefab.vercel.app`
4. **Redeploy your project** (click "Redeploy" in Vercel)

---

## 🎯 Step 8: Deploy Your API Backend

Your project has a separate API backend. Let's deploy it too!

### Option A: Deploy API as Separate Vercel Project

1. **Create a new Vercel project** for the API
2. **Import the same GitHub repo**
3. **Set Root Directory to:** `apps/api`
4. **Set Build Command to:** `npm run build`
5. **Add the same environment variables**
6. **Deploy!**

### Option B: Use Serverless Functions (Recommended)

Since you're using Next.js, you can integrate the API into your main project:

1. **Move your API routes** to `apps/web/src/app/api/`
2. **Update your API calls** to use Next.js API routes
3. **Deploy everything together** (simpler!)

---

## 🎯 Step 9: Test Your Live Website

1. **Open your Vercel URL** in the browser
2. **Check if the homepage loads**
3. **Try accessing admin panel** (if you have one)
4. **Test creating a product or blog post**
5. **Check if database is working**

---

## 🔧 Troubleshooting (Common Issues)

### ❌ "Build Failed" Error
- **Solution:** Check the build logs in Vercel. Make sure all dependencies are installed.

### ❌ "Database Connection Failed"
- **Solution:** Verify your `DATABASE_URL` is correct. Check Vercel Postgres status.

### ❌ "Environment Variables Not Working"
- **Solution:** Make sure you added them in the correct environment (Production, not just Development).

### ❌ "API Calls Failing"
- **Solution:** Check that `NEXT_PUBLIC_API_URL` and `API_URL` are set correctly.

---

## 🎉 Congratulations! 

Your Saman Prefab website is now live on Vercel! 🚀

**What's Next?**
- 🔗 **Share your URL** with friends and family
- 📊 **Monitor your site** in Vercel Dashboard
- 🔄 **Set up automatic deployments** (every time you push to GitHub, it auto-deploys!)
- 📧 **Add a custom domain** (like `saman-prefab.com`)

---

## 📞 Need Help?

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **GitHub Issues:** Check your repo's Issues section

---

**Made with ❤️ for easy deployment!**
