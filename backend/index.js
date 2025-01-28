const express = require("express");
const cors = require("cors");
const db = require("./db.js");
const app = express();
app.use(cors());
app.use(express.json());

// Fetch all active questions with their options
app.get("/api/questions", (req, res) => {
  const query = `
    SELECT 
      q.id AS question_id, q.question_text, q.type, q.step,
      o.id AS option_id, o.option_text
    FROM questions q
    LEFT JOIN options o ON q.id = o.question_id
    WHERE q.active = TRUE AND o.active = TRUE
    ORDER BY q.step ASC;
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    // Group questions and their options
    const questions = results.reduce((acc, row) => {
      const question = acc.find((q) => q.id === row.question_id);
      if (question) {
        question.options.push({ id: row.option_id, text: row.option_text });
      } else {
        acc.push({
          id: row.question_id,
          text: row.question_text,
          type: row.type,
          step: row.step,
          options: [{ id: row.option_id, text: row.option_text }],
        });
      }
      return acc;
    }, []);

    res.json(questions);
  });
});

// save user responses
app.post("/api/saveResponses", (req, res) => {
  let userId = req.body.userId;

  if (!userId) {
    const { v4: uuidv4 } = require("uuid");
    userId = uuidv4(); // Generate a random UUID
    console.log("Generated User ID:", userId);
  }

  const { answers } = req.body;

  if (!answers || answers.length === 0) {
    return res.status(400).json({ error: "Answers are missing" });
  }

  // save answers into the database
  const query = `
    INSERT INTO user_responses (user_id, question_id, answer_text, answer_json)
    VALUES ?
  `;

  const values = answers.map((answer) => {
    const answerText = Array.isArray(answer.answer)
      ? answer.answer.join(", ")
      : answer.answer; // Store multiple choice as a string
    const answerJson = JSON.stringify(answer.answer);

    return [userId, answer.questionId, answerText || null, answerJson || null];
  });

  db.query(query, [values], (err, results) => {
    if (err) {
      console.error("Error saving answers:", err);
      return res.status(500).json({ error: err.message });
    }

    res.json({ message: "User responses saved successfully!", userId });
  });
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
