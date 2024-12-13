import fs from 'fs';
import pdf from 'pdf-parse';


async function extractTextFromPdfBuffer(dataBuffer: Buffer): Promise<string> {
  try {
    const pdfData = await pdf(dataBuffer);
    return pdfData.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    return '';
  }
}

function cleanText(text: string): string {
  // Remove extra whitespace
  text = text.replace(/\s+/g, ' ');
  // Remove page numbers
  text = text.replace(/\n\s*\d+\s*\n/g, '\n');
  return text;
}

function prepareForLlm(text: string, maxTokens: number = 180000): string {
  // Truncate text to fit within token limit (approximate)
  return text.slice(0, maxTokens * 4);  // Assuming average of 4 characters per token
}

export async function getText(dataBuffer: Buffer): Promise<string> {
  const extractedText = await extractTextFromPdfBuffer(dataBuffer);
  const cleanedText = cleanText(extractedText);
  const llmReadyText = prepareForLlm(cleanedText);
  return llmReadyText;
}

// const pdfPath = 'meta.pdf';
// // Example usage
// async function main() {
//   try {
//     const text = await getLlmText(pdfPath);
//     console.log(text);
//   } catch (error) {
//     console.error('Error processing PDF:', error);
//   }
// }

// main();
