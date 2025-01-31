const express = require("express");
const cors = require("cors");
const db = require("./db.js");
const app = express();
const admin = require("./firebase");
app.use(
  cors({
    origin: "*", // Allow all origins
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type, Authorization",
  })
);

app.use(express.json());

// Fetch all active questions with their options
const { Question, Option, UserToken } = require("./models");

app.get("/api/questions", async (req, res) => {
  try {
    const questions = await Question.findAll({
      where: { active: true },
      include: [
        {
          model: Option,
          where: { active: true },
          required: false, // In case questions don't have options
        },
      ],
      order: [["step", "ASC"]],
    });

    const formattedQuestions = questions.map((q) => ({
      id: q.id,
      text: q.question_text,
      type: q.type,
      step: q.step,
      options: q.Options.map((o) => ({
        id: o.id,
        text: o.option_text,
      })),
    }));

    res.json(formattedQuestions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

// save user responses
// app.post("/api/saveResponses", (req, res) => {
//   let userId = req.body.userId;

//   if (!userId) {
//     const { v4: uuidv4 } = require("uuid");
//     userId = uuidv4(); // Generate a random UUID
//     console.log("Generated User ID:", userId);
//   }

//   const { answers } = req.body;

//   if (!answers || answers.length === 0) {
//     return res.status(400).json({ error: "Answers are missing" });
//   }

//   // save answers into the database
//   const query = `
//     INSERT INTO user_responses (user_id, question_id, answer_text, answer_json)
//     VALUES ?
//   `;

//   const values = answers.map((answer) => {
//     const answerText = Array.isArray(answer.answer)
//       ? answer.answer.join(", ")
//       : answer.answer; // Store multiple choice as a string
//     const answerJson = JSON.stringify(answer.answer);

//     return [userId, answer.questionId, answerText || null, answerJson || null];
//   });

//   db.query(query, [values], (err, results) => {
//     if (err) {
//       console.error("Error saving answers:", err);
//       return res.status(500).json({ error: err.message });
//     }

//     res.json({ message: "User responses saved successfully!", userId });
//   });
// });

const { UserResponse } = require("./models");

app.post("/api/saveResponses", async (req, res) => {
  try {
    const userId = req.body.userId || require("uuid").v4(); // Generate random userId if not provided
    const answers = req.body.answers;

    const responsePromises = answers.map((answer) => {
      let answerText = null;
      let answerJson = null;

      if (Array.isArray(answer.answer) || typeof answer.answer === "object") {
        // Store structured data (arrays/objects) in answer_json
        answerJson = JSON.stringify(answer.answer);
      } else {
        // Store plain string data in answer_text
        answerText = answer.answer;
      }
      return UserResponse.create({
        user_id: userId,
        question_id: answer.questionId,
        answer_text: answerText,
        answer_json: answerJson,
      });
    });

    await Promise.all(responsePromises);

    res.json({ message: "Responses saved successfully", userId });
  } catch (error) {
    console.error("Error saving responses:", error);
    res.status(500).json({ error: "Failed to save responses" });
  }
});

// notification service

// Send notification to a specific user
app.post("/api/sendNotification", async (req, res) => {
  try {
    const { title, body, token, user_id = "default" } = req.body;

    // if (!title || !body || !user_id) {
    if (!title || !body) {
      console.log("error misssing fields");
      return res.status(400).json({ error: "Missing required fields" });
    }

    // const userToken = await UserToken.findOne({ where: { user_id } });
    // if (!userToken) {
    //   return res.status(404).json({ error: "User not found or token missing" });
    // }

    const message = { notification: { title, body }, token: token };
    console.log(message);

    await admin.messaging().send(message);
    console.log(message);

    res.json({ success: true, message: "Notification sent successfully!" });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ error: "Failed to send notification" });
  }
});

// Store FCM Token for a user
app.post("/api/storeToken", async (req, res) => {
  try {
    const { user_id = "defaultUser", token } = req.body;

    if (!user_id || !token) {
      return res.status(400).json({ error: "Missing user_id or token" });
    }

    await UserToken.upsert({ user_id, token });

    res.json({ success: true, message: "Token stored successfully" });
  } catch (error) {
    console.error("Error storing token:", error);
    res.status(500).json({ error: "Failed to store token" });
  }
});

// Send notification to all users
app.post("/api/sendNotificationToAll", async (req, res) => {
  try {
    const { title, body } = req.body;

    if (!title || !body) {
      return res.status(400).json({ error: "Missing title or body" });
    }

    const tokens = await UserToken.findAll({ attributes: ["token"] });

    if (!tokens.length) {
      return res.status(404).json({ error: "No users found with FCM tokens" });
    }

    const messages = tokens.map((t) => ({
      notification: { title, body },
      token: t.token,
    }));

    await admin.messaging().sendEach(messages);

    res.json({ success: true, message: "Notifications sent to all users!" });
  } catch (error) {
    console.error("Error sending notifications:", error);
    res.status(500).json({ error: "Failed to send notifications" });
  }
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
