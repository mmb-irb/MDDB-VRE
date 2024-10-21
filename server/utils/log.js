import { promises as fs } from 'fs';

export const logMessage = async (logFilePath, content) => { 
  try {
    // Check if the file exists
    try {
      await fs.access(logFilePath);
    } catch (error) {
      // If the file does not exist, create it
      await fs.writeFile(logFilePath, '[]', 'utf8');
    }

    // Read the existing content of the file
    const fileContent = await fs.readFile(logFilePath, 'utf8');
    let logArray;

    try {
      // Parse the content as a JSON array
      logArray = JSON.parse(fileContent);
      if (!Array.isArray(logArray)) {
        throw new Error('Log file content is not a valid JSON array');
      }
    } catch (error) {
      // If parsing fails, initialize with an empty array
      logArray = [];
    }

    // Append the new message to the JSON array
    logArray.push({ timestamp: new Date().toISOString(), ...content });

    // Append the message to the file
    await fs.writeFile(logFilePath, JSON.stringify(logArray, null, 2), 'utf8');
  } catch (error) {
    console.error('Error logging message:', error);
  }
}