const express = require("express");
const { google } = require("googleapis");
const mongoose = require("mongoose");
const fs = require("fs");

const app = express();
app.use(express.json());

// set view engine
app.set("view engine", "ejs");

// ------------------ DATABASE SETUP ------------------

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/gmailDB");

// Mail schema
const Mail = mongoose.model("Mail", {
  from: String,
  subject: String,
  snippet: String,
  date: String,
});

// ------------------ GMAIL API SETUP ------------------

// Load OAuth credentials
const credentials = JSON.parse(fs.readFileSync("credentials.json"));
const { client_secret, client_id, redirect_uris } = credentials.web;

const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);

const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

// ------------------ ROUTES ------------------

// Gmail Login
app.get("/login", (req, res) => {
  const url = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/gmail.readonly"],
    prompt: "consent",
  });
  res.redirect(url);
});

// Gmail Callback
app.get("/callback", async (req, res) => {
  try {
    const { code } = req.query;
    const { tokens } = await oAuth2Client.getToken(code);

    // Save tokens
    fs.writeFileSync("token.json", JSON.stringify(tokens));
    oAuth2Client.setCredentials(tokens);

    res.send("Gmail connected! You can now search mails.");
  } catch (error) {
    console.error(error);
    res.send("Error connecting Gmail.");
  }
});

// Search and display mails
app.get("/search/:keyword", async (req, res) => {
  try {
    // Load saved tokens
    if (fs.existsSync("token.json")) {
      const saved = JSON.parse(fs.readFileSync("token.json"));
      oAuth2Client.setCredentials(saved);
    }

    const keyword = req.params.keyword;

    const response = await gmail.users.messages.list({
      userId: "me",
      q: keyword,
      maxResults: 5,
    });

    const messages = response.data.messages || [];
    let results = [];

    for (let msg of messages) {
      const mail = await gmail.users.messages.get({
        userId: "me",
        id: msg.id,
      });

      const headers = mail.data.payload.headers;
      const from = headers.find((h) => h.name === "From")?.value;
      const subject = headers.find((h) => h.name === "Subject")?.value;
      const snippet = mail.data.snippet;
      const date = headers.find((h) => h.name === "Date")?.value;

      // Save to DB
      const mailData = { from, subject, snippet, date };
      await Mail.create(mailData);

      results.push(mailData);
    }

    // Render UI with EJS
    res.render("emails", { keyword, results });
  } catch (error) {
    console.error(error);
    res.send("Failed to search mails.");
  }
});

// Home Page
app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Gmail Analyzer</title>
        <style>
          body {
            margin: 0;
            font-family: 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea, #764ba2);
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
          }
          .card {
            background: white;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.25);
            text-align: center;
            width: 380px;
          }
          h2 {
            margin-bottom: 20px;
            color: #333;
          }
          input {
            width: 100%;
            padding: 12px;
            margin: 10px 0;
            border-radius: 6px;
            border: 1px solid #ccc;
            font-size: 14px;
          }
          button {
            width: 100%;
            padding: 12px;
            border: none;
            border-radius: 6px;
            background: #667eea;
            color: white;
            font-size: 15px;
            cursor: pointer;
            transition: 0.3s;
          }
          button:hover {
            background: #5a67d8;
          }
          .login {
            margin-top: 15px;
            display: block;
            text-decoration: none;
            color: #667eea;
            font-weight: 500;
          }
          .login:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>📫 Gmail Analyzer</h2>
          <form onsubmit="location.href='/search/'+ this.keyword.value; return false;">
            <input type="text" name="keyword" placeholder="Enter keyword like Amazon" required/>
            <button type="submit">Search Emails</button>
          </form>
          <a href="/login" class="login">Login with Gmail</a>
        </div>
      </body>
    </html>
  `);
});

// Start server
app.listen(3000, () => console.log("Server running on port 3000"));