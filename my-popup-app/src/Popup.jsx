import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import "./Popup.css";

const Popup = ({ show, handleClose }) => {
  const [questions, setQuestions] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    fetch("http://localhost:5000/api/questions")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setQuestions(data);
        } else {
          throw new Error("Expected an array of questions");
        }
      })
      .catch((error) => {
        console.error("Error fetching questions:", error);
        setQuestions([]);
      });
  }, []);

  const currentQuestion = Array.isArray(questions)
    ? questions.find((q) => q.step === currentStep)
    : null;

  if (!currentQuestion) {
    return (
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Body>
          <p>No questions available or an error occurred.</p>
        </Modal.Body>
      </Modal>
    );
  }

  const handleSave = () => {
    if (currentStep === 1 && answers[currentQuestion.text] === "Yes") {
      setCurrentStep(1.1);
    } else if (currentStep === 1.1) {
      setCurrentStep(2);
    } else if (
      currentStep === 8 &&
      answers[currentQuestion.text]?.includes("None of the above") &&
      answers[currentQuestion.text].length === 1
    ) {
      setCurrentStep(9);
    } else if (currentStep === 8) {
      setCurrentStep(8.1);
    } else if (currentStep === 8.1) {
      setCurrentStep(9);
    } else if (currentStep >= Math.max(...questions.map((q) => q.step))) {
      fetch("http://localhost:5000/api/saveResponses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers: Object.keys(answers).map((questionText) => {
            const question = questions.find((q) => q.text === questionText);
            // Send the answers as an array with questionId and answer
            return {
              questionId: question ? question.id : null, // Map question text to question ID
              answer: answers[questionText] || null,
            };
          }),
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Response saved:", data);
        })
        .catch((error) => {
          console.error("Error saving response:", error);
        });

      alert("Your progress has been saved");
      handleClose();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSelect = (question, value, multiple = false) => {
    setAnswers((prev) => {
      if (multiple) {
        const selected = prev[question] || [];
        const updatedSelection = selected.includes(value)
          ? selected.filter((item) => item !== value)
          : [...selected, value];
        return { ...prev, [question]: updatedSelection };
      }
      return { ...prev, [question]: value };
    });
  };

  if (!currentQuestion) return null;

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Body className="popup-body">
        <h4>{currentQuestion.text}</h4>
        <p>
          {currentQuestion.type === "single"
            ? "Select one"
            : "Select all that apply"}
        </p>
        <div className="d-flex flex-column align-items-center gap-2">
          {currentQuestion.options.map((option) => (
            <Button
              key={option.id}
              className={`popup-btn ${
                currentQuestion.type === "multiple"
                  ? answers[currentQuestion.text]?.includes(option.text)
                    ? "selected"
                    : ""
                  : answers[currentQuestion.text] === option.text
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                handleSelect(
                  currentQuestion.text,
                  option.text,
                  currentQuestion.type === "multiple"
                )
              }
            >
              {option.text}
            </Button>
          ))}
        </div>
        <div className="mt-4 d-flex justify-content-center gap-3">
          <Button className="popup-btn save-btn" onClick={handleSave}>
            Save
          </Button>
          <Button className="popup-btn skip-btn" onClick={handleClose}>
            Skip
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default Popup;
