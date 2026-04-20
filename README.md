# 📧 Gmail Analyzer

## 🔎 About the Project

Gmail Analyzer is a small web app built with **Node.js and Express** that lets you:

* Login with your Gmail using OAuth
* Search your Gmail inbox for emails by keyword
* See sender, subject, snippet and date of emails
* Save results to a MongoDB database
* View results in a simple HTML table

---

## ✨ Features

* 🔐 Gmail OAuth login  
* 🔍 Search mails by keyword  
* 🗂️ View email details  
* 💾 Store emails in MongoDB  
* 🧑‍💻 Simple UI with EJS templates

---

## ⚙️ How to Run Locally

1. Clone the repository:

```
git clone https://github.com/Tejaswini-1407/gmail-analyzer.git
cd gmail-analyzer
```

2. Install dependencies:

```
npm install
```

3. Setup Google API Credentials:  
   * Go to **Google Cloud Console**
   * Create OAuth 2.0 credentials (Web App)
   * Set **Authorized Redirect URI** to:
     ```
     http://localhost:3000/callback
     ```
   * Download and rename the JSON to `credentials.json`
   * Put it in the root of the project folder

⚠️ Make sure `credentials.json` is added to `.gitignore` so it doesn’t get uploaded to GitHub.

4. Make sure MongoDB is running locally (or remotely).

5. Start the app:

```
npm start
```

---

## ▶️ Open in Browser

Go to:

```
http://localhost:3000
```

Click **Login with Gmail**, allow access, then search emails by keyword (e.g., “Amazon”).

---

## 📁 Project Structure

```
gmail-analyzer/
├─ views/           # HTML templates
│   └─ emails.ejs
├─ server.js        # Main server file
├─ package.json     # Project config
├─ .gitignore
└─ README.md        # This file
```

## 🧠 Tech Used

* **Node.js** – JavaScript server runtime  
* **Express.js** – Web server framework  
* **Google APIs (Gmail API)** – To fetch emails  
* **MongoDB** – Database to store searched emails  
* **EJS** – For rendering HTML views
