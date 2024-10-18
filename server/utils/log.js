import { promises as fs } from 'fs';

export const logMessage = async (logFilePath, message) => { 
  try {
    // Check if the file exists
    try {
      await fs.access(logFilePath);
    } catch (error) {
      // If the file does not exist, create it
      await fs.writeFile(logFilePath, '', 'utf8');
    }

    // Append the message to the file
    await fs.appendFile(logFilePath, `${message}\n`, 'utf8');
  } catch (error) {
    console.error('Error logging message:', error);
  }
}