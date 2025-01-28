import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import "./Popup.css";

const Popup = ({ show, handleClose }) => {
  const [questions, setQuestions] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    // Fetch questions and options from the backend
    fetch("http://localhost:5000/api/questions")
      .then((response) => response.json())
      .then((data) => setQuestions(data))
      .catch((error) => console.error("Error fetching questions:", error));
  }, []);

  const currentQuestion = questions.find((q) => q.step === currentStep);

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
