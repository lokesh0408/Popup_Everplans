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

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
