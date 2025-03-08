import html2pdf from "html2pdf.js";

/**
 * Generates a PDF from an HTML element
 * @param element The HTML element to convert to PDF
 * @param filename The name of the PDF file to download
 */
export const generatePDF = async (
  element: HTMLElement,
  filename: string
): Promise<void> => {
  const options = {
    margin: 0.5,
    filename: filename,
    image: { type: "jpeg", quality: 1 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: "in", format: "letter", orientation: "landscape" },
  };

  try {
    await html2pdf().set(options).from(element).save();
    return Promise.resolve();
  } catch (error) {
    console.error("Error generating PDF:", error);
    return Promise.reject(error);
  }
};

/**
 * Formats a date in a readable format
 * @param date The date to format
 * @returns Formatted date string
 */
export const formatCertificateDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
