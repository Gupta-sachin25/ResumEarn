import { PDFParse } from 'pdf-parse';

export const extractTextFromPdf = async (buffer) => {
  try {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();
    
    const text = result?.text || '';
    if (!text.trim()) {
      throw new Error('PDF appears to be empty or unscannable');
    }
    return text.trim();
  } catch (error) {
    console.error('PDF text extraction error:', error);
    throw new Error(error.message || 'Failed to extract text from PDF file');
  }
};

