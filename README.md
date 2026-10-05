# 🎓 Student Feedback System

A complete full-stack **Student Feedback System** built with **Angular**, **Forms**, **Express.js**, and **MongoDB**.
Designed with a **clean light background**, **high-contrast visible text**, and completely optimized for **1-click deployment on Vercel** as well as local execution.

---

## 🍃 1. How to Add Your MongoDB Connection String

### For Local Development:
1. Open the [`.env`](file:///c:/Users/gaurav/Documents/ip%20project/.env) file located in the root of the project.
2. Replace `MONGODB_URI` with your MongoDB connection string (from MongoDB Atlas or your local MongoDB):
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/studentFeedbackDB?retryWrites=true&w=majority
   PORT=3000
   ```
3. Save the file.
4. Run:
   ```bash
   npm start
   ```
   Open **http://localhost:3000** in your browser. The navbar indicator will switch to **🟢 MongoDB Connected**.

---

## 🚀 2. Deploying to Vercel

The repository is pre-configured with [`vercel.json`](file:///c:/Users/gaurav/Documents/ip%20project/vercel.json), serverless connection caching in [`api/db.js`](file:///c:/Users/gaurav/Documents/ip%20project/api/db.js), and Express API routing in [`api/index.js`](file:///c:/Users/gaurav/Documents/ip%20project/api/index.js).

### Option A: Deploy via GitHub (Recommended)
1. Initialize a git repository and push your project to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Student Feedback System"
   git branch -M main
   git remote add origin https://github.com/<your-username>/student-feedback-system.git
   git push -u origin main
   ```
2. Go to **[vercel.com](https://vercel.com)** and click **"Add New Project"** &rarr; **"Import"** your GitHub repository.
3. In the Vercel **Configure Project** screen:
   - **Framework Preset**: *Other*
   - **Root Directory**: `./` (leave default)
   - Expand **Environment Variables**:
     - **Name**: `MONGODB_URI`
     - **Value**: Your MongoDB Atlas connection URI:
       ```
       mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/studentFeedbackDB?retryWrites=true&w=majority
       ```
4. Click **Deploy**. Vercel will provide your live URL (e.g. `https://student-feedback-system.vercel.app`).

### Option B: Deploy via Vercel CLI
If you have the Vercel CLI installed:
```bash
npm i -g vercel
vercel login
vercel
```
When prompted for environment variables, add `MONGODB_URI`.
To deploy to production:
```bash
vercel --prod
```

---

## 🌟 Key Application Features

1. **Angular-Powered Frontend**:
   - **Comprehensive Feedback Form**:
     - Student Full Name, Roll No / Student ID, and Email.
     - Academic Department dropdown and Subject / Course module name.
     - Faculty / Instructor name and current semester selection.
     - **Interactive 5-Star Rating Control** with real-time hover previews and dynamic descriptor tags (*Outstanding*, *Very Good*, *Good*, etc.).
     - **Detailed Criteria Matrix**: Evaluation for *Course Syllabus*, *Teaching Delivery*, *Lab Guidance*, and *Doubt Resolution*.
     - Written comments and suggestions for improvements.
     - **Angular Form Validation**: Real-time error messages, required flags (`*`), pattern checking, and clean UX.
   - **Feedback Explorer & Management**:
     - Instant search by student name, ID, faculty, or course.
     - Filter by Department and Minimum Star Rating (5★, 4★, 3★, etc.).
     - Student avatar cards displaying timestamp, rating badges, criteria breakdown, and comments.
     - One-click deletion with confirmation.
   - **Analytics & Statistical Dashboard**:
     - Real-time metric cards: Total Submissions, Average Rating (/5.0), 5-Star Excellence Ratio, and Active Departments.
     - Visual rating distribution progress bars.
     - Department-wise breakdown table.
   - **Live Database Status Badge**: Shows live connection state directly in the navigation bar.

2. **Serverless MongoDB Architecture**:
   - Connection pooling and promise caching in [`api/db.js`](file:///c:/Users/gaurav/Documents/ip%20project/api/db.js) ensures zero connection leaks in serverless functions.
   - Hot-reload model guard prevents Mongoose OverwriteModelErrors.
   - Automatic fallback protects against unhandled errors if MongoDB is temporarily connecting or provisioning.

3. **Styling & Accessibility**:
   - **Light Theme**: Soft `#f8fafc` slate background with pure white cards.
   - **Visible Typography**: Crisp, dark slate typography (`#0f172a`, `#334155`) for maximum contrast and readability.
   - **Responsive**: Fully responsive across mobile, tablet, and desktop screens.

---

## 📁 Repository Structure

```
.
├── api/
│   ├── db.js                 # Serverless MongoDB connection manager with caching
│   ├── index.js              # Express app exported for Vercel Serverless Functions
│   ├── models/
│   │   └── Feedback.js       # Mongoose Schema & Model for MongoDB
│   └── routes/
│       └── feedback.js       # RESTful API routes (GET, POST, DELETE, /stats)
├── public/                   # Frontend assets served by Vercel CDN
│   ├── css/
│   │   └── style.css         # Light background & high-contrast visible styles
│   ├── js/
│   │   └── app.js            # Angular module, controller, form validation & API calls
│   └── index.html            # Main Single Page Application interface
├── .env                      # Local environment variables (add your MONGODB_URI here)
├── .env.example              # Template for environment variables
├── .gitignore                # Ignores node_modules and .env
├── package.json              # Express, Mongoose, CORS, Dotenv dependencies
├── server.js                 # Local development server runner
├── vercel.json               # Vercel deployment and routing configuration
└── README.md                 # Complete documentation
```
