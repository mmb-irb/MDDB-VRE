export const getCurrentDateString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

export const  getExpirationDate = (daysToAdd) => {
  // Step 1: Get the current date
  const currentDate = new Date();
  // Step 2: Add [daysToAdd + 1] days to the current date
  currentDate.setDate(currentDate.getDate() + parseInt(daysToAdd) + 1);
  // Step 3: Set the time to midnight (00:00:00)
  currentDate.setHours(0, 0, 0, 0);
  // Step 4: Output the result
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(currentDate.getDate()).padStart(2, '0');
  const hours = String(currentDate.getHours()).padStart(2, '0');
  const minutes = String(currentDate.getMinutes()).padStart(2, '0');
  const seconds = String(currentDate.getSeconds()).padStart(2, '0');
  // format date to ISO 8601
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}