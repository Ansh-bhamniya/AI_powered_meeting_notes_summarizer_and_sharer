import React, { useState, useEffect } from "react";
import "./HomePointerAnimation.css";

const constantPart = "Ask Ai Agent to Create ";
const variableParts = ["Mobile App...", "Website...", "Prototype Design..."];

const HomePointerAnimation: React.FC = () => {
  const [displayedVariable, setDisplayedVariable] = useState("");
  const [variableIndex, setVariableIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = variableParts[variableIndex];
    let timeout: NodeJS.Timeout;

    if (!isDeleting && charIndex < currentWord.length) {
      // Typing
      timeout = setTimeout(() => {
        setDisplayedVariable(currentWord.substring(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      }, 80);
    } else if (isDeleting && charIndex > 0) {
      // Deleting
      timeout = setTimeout(() => {
        setDisplayedVariable(currentWord.substring(0, charIndex - 1));
        setCharIndex(charIndex - 1);
      }, 40);
    } else if (!isDeleting && charIndex === currentWord.length) {
      // Pause before deleting
      timeout = setTimeout(() => setIsDeleting(true), 1500);
    } else if (isDeleting && charIndex === 0) {
      // Move to next variable part
      setIsDeleting(false);
      setVariableIndex((prev) => (prev + 1) % variableParts.length);
    }

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, variableIndex]);

  return (


    <h2 className="typing-suggestion">
      {constantPart}
      <span className="variable-text">{displayedVariable}</span>
      <span className="cursor">|</span>
    </h2>        


  );
};

export default HomePointerAnimation;
