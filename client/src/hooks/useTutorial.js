// useTutorial.js
import { useState, useEffect } from "react";

export const useTutorial = () => {
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem("tutorialCompleted") === "true";
    setHasCompletedTutorial(completed);
  }, []);

  const completeTutorial = () => {
    localStorage.setItem("tutorialCompleted", "true");
    setHasCompletedTutorial(true);
  };

  const resetTutorial = () => {
    localStorage.removeItem("tutorialCompleted");
    setHasCompletedTutorial(false);
  };

  return { hasCompletedTutorial, completeTutorial, resetTutorial };
};
