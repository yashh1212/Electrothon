export const sampleExam = {
  id: "sample-1",
  title: "Web Development Certification Exam",
  description:
    "Test your knowledge in HTML, CSS, JavaScript, and modern web frameworks",
  code: "SAMPLE-2024",
  createdAt: new Date(),
  questions: [
    {
      id: "1",
      text: "What does HTML stand for?",
      type: "mcq" as const,
      options: [
        { id: "a", text: "Hyper Text Markup Language" },
        { id: "b", text: "High Tech Modern Language" },
        { id: "c", text: "Hyperlink Text Management Language" },
        { id: "d", text: "Home Tool Markup Language" },
      ],
      correctOption: "a",
    },
    {
      id: "2",
      text: "Which CSS property is used to change the text color of an element?",
      type: "mcq" as const,
      options: [
        { id: "a", text: "text-color" },
        { id: "b", text: "font-color" },
        { id: "c", text: "color" },
        { id: "d", text: "text-style" },
      ],
      correctOption: "c",
    },
    {
      id: "3",
      text: 'What is the correct JavaScript syntax to change the content of the HTML element with id="demo"?',
      type: "mcq" as const,
      options: [
        { id: "a", text: 'document.getElement("demo").innerHTML = "Hello";' },
        {
          id: "b",
          text: 'document.getElementById("demo").innerHTML = "Hello";',
        },
        { id: "c", text: '#demo.innerHTML = "Hello";' },
        {
          id: "d",
          text: 'document.getElementByName("demo").innerHTML = "Hello";',
        },
      ],
      correctOption: "b",
    },
    {
      id: "4",
      text: "Which framework is developed and maintained by Facebook?",
      type: "mcq" as const,
      options: [
        { id: "a", text: "Angular" },
        { id: "b", text: "Vue" },
        { id: "c", text: "React" },
        { id: "d", text: "Svelte" },
      ],
      correctOption: "c",
    },
    {
      id: "5",
      text: 'Explain the difference between "localStorage" and "sessionStorage".',
      type: "longanswer" as const,
      answer:
        "localStorage and sessionStorage both allow you to store data on the client side, but localStorage data has no expiration time while sessionStorage data gets cleared when the page session ends (when the browser tab is closed).",
    },
  ],
  settings: {
    negativeMarking: false,
    negativeMarkingValue: 0,
    eyeTracking: false,
    faceDetection: false,
    displayResults: true,
    generateCertificate: true,
  },
};
