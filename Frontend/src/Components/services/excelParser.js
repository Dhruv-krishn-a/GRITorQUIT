// Excel parsing utilities
export const excelParser = {
  // This would be used if parsing in the frontend, but we're doing it in backend
  validateExcelFile: (file) => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    return validTypes.includes(file.type);
  },
  
  getFileSizeMB: (file) => {
    return (file.size / (1024 * 1024)).toFixed(2);
  }
};