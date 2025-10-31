// Frontend/src/Components/services/excelParser.js
export const excelParser = {
  validateExcelFile: (file) => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    return validTypes.includes(file.type);
  },
  
  getFileSizeMB: (file) => {
    return (file.size / (1024 * 1024)).toFixed(2);
  },

  getFileSizeDisplay: (file) => {
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB < 1) {
      return `${(file.size / 1024).toFixed(2)} KB`;
    }
    return `${sizeInMB.toFixed(2)} MB`;
  },

  getFileNameWithoutExtension: (file) => {
    return file.name.replace(/\.[^/.]+$/, "");
  },

  validateFileWithMessage: (file, maxSizeMB = 10) => {
    if (!file) {
      return 'No file selected';
    }

    if (!this.validateExcelFile(file)) {
      const validExtensions = ['.xlsx', '.xls'];
      return `Invalid file type. Please select an Excel file (${validExtensions.join(', ')})`;
    }

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      return `File size must be less than ${maxSizeMB}MB`;
    }

    return null;
  }
};

export default excelParser;