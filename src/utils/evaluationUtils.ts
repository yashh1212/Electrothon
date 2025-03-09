import axios from "axios";

const GEMINI_API_KEY = "AIzaSyBtDxlYRB1spRgvEoFbo0y-rMUdarZkDgM";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

/**
 * Verify if the student's answer is factually correct using Gemini's web access.
 */
export const verifyCorrectness = async (
  question: string,
  studentAnswer: string
) => {
  const prompt = `
    Question: ${question}
    Student Answer: ${studentAnswer}

    Using web access, verify if the student's answer is factually correct for the given question.
    Provide a response in the following format:
    - Correctness: True/False
    - Explanation: Brief explanation of why the answer is correct or incorrect.
  `;

  const response = await axios.post(
    GEMINI_API_URL,
    {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
      params: {
        key: GEMINI_API_KEY,
      },
    }
  );

  return response.data.candidates[0].content.parts[0].text;
};

/**
 * Compare the student's answer with the desired answer on a scale of 1 to 5.
 */
export const matchDesiredAnswer = async (
  correctAnswer: string,
  studentAnswer: string
) => {
  const prompt = `
    Correct Answer: ${correctAnswer}
    Student Answer: ${studentAnswer}

    Compare the student's answer with the desired answer based on meaning, depth, and relevance.
    Provide a grade between 1 and 5, where:
    - 1: The answer is completely incorrect or irrelevant.
    - 2: The answer is partially correct but lacks significant meaning or relevance.
    - 3: The answer is somewhat correct but has minor inaccuracies or omissions.
    - 4: The answer is mostly correct and conveys the meaning well.
    - 5: The answer is fully correct and perfectly matches the meaning of the correct answer.

    Also, provide a brief explanation for the grade.
  `;

  const response = await axios.post(
    GEMINI_API_URL,
    {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
      params: {
        key: GEMINI_API_KEY,
      },
    }
  );

  return response.data.candidates[0].content.parts[0].text;
};

/**
 * Main function to evaluate the student's answer.
 */
export const evaluateAnswer = async (
  question: string,
  desiredAnswer: string,
  studentAnswer: string
) => {
  // Step 1: Verify correctness
  const correctnessResponse = await verifyCorrectness(question, studentAnswer);
  console.log("Correctness Verification:");
  console.log(correctnessResponse);

  // Step 2: Match with desired answer
  let grade = 0;
  let analysis = "";

  if (correctnessResponse.includes("Correctness: True")) {
    const matchResponse = await matchDesiredAnswer(
      desiredAnswer,
      studentAnswer
    );
    console.log("\nDesired Answer Matching:");
    console.log(matchResponse);

    // Extract grade and analysis from the matchResponse
    const gradeMatch = matchResponse.match(/Grade: (\d+)/);
    const analysisMatch = matchResponse.match(/Explanation: (.+)/);

    if (gradeMatch && analysisMatch) {
      grade = parseInt(gradeMatch[1], 10);
      analysis = analysisMatch[1];
    }
  } else {
    analysis = "The student's answer is factually incorrect.";
  }

  return { grade, analysis };
};
