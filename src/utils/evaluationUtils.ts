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

    Always include this exact phrase in your response: "Grade: X" where X is the numeric grade.
    
    Always include this exact phrase in your response: "Explanation: " followed by your explanation.

    Format:
    Grade: [1-5]
    Explanation: [Your detailed explanation here]
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

  // More flexible check for correctness to handle Gemini's varying response formats
  const isCorrect =
    correctnessResponse.toLowerCase().includes("correctness: true") ||
    correctnessResponse.toLowerCase().includes("mostly true") ||
    correctnessResponse.toLowerCase().includes("partially true");

  if (isCorrect) {
    const matchResponse = await matchDesiredAnswer(
      desiredAnswer,
      studentAnswer
    );
    console.log("\nDesired Answer Matching:");
    console.log(matchResponse);

    // More robust grade extraction
    const gradeMatch = matchResponse.match(/Grade:\s*(\d+)/i);

    // More flexible analysis extraction
    let analysisMatch = matchResponse.match(/Explanation:\s*(.*?)(?=$|\n\n)/is);
    if (!analysisMatch) {
      // Try to get anything after "Grade: X"
      analysisMatch = matchResponse.match(/Grade:\s*\d+\s*(.*?)(?=$|\n\n)/is);
    }

    if (gradeMatch) {
      grade = parseInt(gradeMatch[1], 10);
    } else {
      // Fallback: try to find any number between 1-5 if the exact format isn't found
      const anyNumberMatch = matchResponse.match(/\b([1-5])\b/);
      if (anyNumberMatch) {
        grade = parseInt(anyNumberMatch[1], 10);
      } else {
        grade = isCorrect ? 3 : 1; // Default grade based on correctness
      }
    }

    if (analysisMatch && analysisMatch[1]) {
      analysis = analysisMatch[1].trim();
    } else {
      // Fallback: use the whole response as analysis if we can't extract it properly
      analysis = matchResponse.replace(/Grade:\s*\d+/i, "").trim();
    }
  } else {
    // If the answer is not correct, extract the explanation for why it's incorrect
    const explanationMatch = correctnessResponse.match(
      /Explanation:\s*(.*?)(?=$|\n\n)/is
    );
    if (explanationMatch && explanationMatch[1]) {
      analysis = explanationMatch[1].trim();
    } else {
      analysis = "The student's answer is factually incorrect.";
    }
  }

  return { grade, analysis };
};
