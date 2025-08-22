import axios from "axios";
import { useCallback, useState } from "react";

const useAskQuestion = (userId) => {
  const [answer, setAnswer] = useState("");

  const AskQuestion = useCallback(
    async (question) => {
      try {
        const response = await axios.post(
          "http://localhost:5000/ask",
          {question,user_id: userId},
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
        
        if (!response.data || !response.data.answer) {
          setAnswer("No answer received from the model.");
          return;
        }

        setAnswer(response.data.answer);
      } catch (error) {
        console.error("Error in AskQuestion:", error);
        setAnswer("Failed to get answer from model. TRY AGAIN!!");
      }
    },
    [userId]
  );

  return { AskQuestion, answer };
};

export default useAskQuestion;
