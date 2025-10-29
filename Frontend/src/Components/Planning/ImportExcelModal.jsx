import React, { useState, useRef } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { uploadAPI } from '../services/api';
import { Upload, X, FileSpreadsheet } from 'lucide-react';
import excelParser from '../services/excelParser';

const ImportExcelModal = ({ isOpen, onClose, onImport }) => {
  const [file, setFile] = useState(null);
  const [planName, setPlanName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };
  
  const validateFile = (selectedFile) => {
    // Check file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/vnd.ms-excel.sheet.macroEnabled.12'
    ];
    
    const validExtensions = ['.xlsx', '.xls'];
    const fileExtension = selectedFile.name.toLowerCase().slice(selectedFile.name.lastIndexOf('.'));
    
    if (!validTypes.includes(selectedFile.type) && !validExtensions.includes(fileExtension)) {
      return 'Please select a valid Excel file (.xlsx, .xls)';
    }
    
    // Check file size (10MB limit)
    if (selectedFile.size > 10 * 1024 * 1024) {
      return 'File size must be less than 10MB';
    }
    
    return null;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validationError = validateFile(selectedFile);
      if (validationError) {
        setError(validationError);
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
      setError('');
      
      // Set default plan name from filename
      if (!planName.trim()) {
        const fileName = selectedFile.name.replace(/\.[^/.]+$/, "");
        setPlanName(fileName);
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      const validationError = validateFile(droppedFiles[0]);
      if (validationError) {
        setError(validationError);
        return;
      }
      
      setFile(droppedFiles[0]);
      setError('');
      
      if (!planName.trim()) {
        const fileName = droppedFiles[0].name.replace(/\.[^/.]+$/, "");
        setPlanName(fileName);
      }
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!file) {
    setError('Please select a file first');
    return;
  }

  if (!planName.trim()) {
    setError('Please enter a plan name');
    return;
  }

  setIsLoading(true);
  setError('');

  try {
    console.log('Starting import...', { 
      file: file.name, 
      planName,
      size: excelParser.getFileSizeDisplay(file)
    });
    
    const formData = new FormData();
    formData.append('excelFile', file);
    formData.append('planName', planName.trim());

    const importedPlan = await uploadAPI.importPlan(formData);
    console.log('Import successful:', importedPlan);
    
    if (onImport) {
      onImport(importedPlan);
    }
    handleClose();
  } catch (err) {
    console.error('Import error details:', err);
    let errorMessage = 'Failed to import plan';
    
    // FIXED: Use err.response.data instead of err.data
    if (err.response?.data?.details) {
      // Show validation errors from backend
      errorMessage = `Validation error: ${Array.isArray(err.response.data.details) ? err.response.data.details.join(', ') : err.response.data.details}`;
    } else if (err.response?.data?.message) {
      errorMessage = err.response.data.message;
    } else if (err.message) {
      errorMessage = err.message;
    } else if (err.code === 'ECONNABORTED') {
      errorMessage = 'Request timeout. Please try again.';
    } else if (err.request) {
      errorMessage = 'Cannot connect to server. Please make sure the backend is running on http://localhost:5000';
    }
    
    setError(errorMessage);
  } finally {
    setIsLoading(false);
  }
};

  const handleClose = () => {
    setFile(null);
    setPlanName('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const getFileSizeMB = (file) => {
    return (file.size / 1024 / 1024).toFixed(2);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Import Plan from Excel">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Plan Name Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Plan Name
          </label>
          <input
            type="text"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            placeholder="Enter plan name"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={isLoading}
          />
        </div>

        {/* File Upload Section */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Excel File
          </label>
          
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            className="hidden"
            disabled={isLoading}
          />

          {/* Drop Zone */}
          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={handleBrowseClick}
              className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-gray-600 transition-colors group"
            >
              <Upload size={48} className="mx-auto text-gray-500 group-hover:text-gray-400 mb-4 transition-colors" />
              <p className="text-gray-400 mb-2">
                Click to browse or drag & drop your Excel file
              </p>
              <p className="text-sm text-gray-500">
                Supports .xlsx, .xls (Max 10MB)
              </p>
              
              {/* Browse Files Button */}
              <div className="mt-4">
                <Button 
                  type="button" 
                  variant="secondary" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBrowseClick();
                  }}
                  disabled={isLoading}
                >
                  Browse Files
                </Button>
              </div>
            </div>
          ) : (
            /* Selected File Display */
            <div className="border border-gray-700 rounded-lg p-4 bg-gray-800/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileSpreadsheet size={24} className="text-green-500" />
                  <div>
                    <p className="font-medium text-white">
                      {file.name}
                    </p>
                    <p className="text-sm text-gray-400">
                      {getFileSizeMB(file)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1 hover:bg-gray-700 rounded transition-colors"
                  disabled={isLoading}
                >
                  <X size={16} className="text-gray-400" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Format Requirements */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <h4 className="text-white font-medium mb-2">Excel Format Requirements:</h4>
          <ul className="text-gray-400 text-sm space-y-1">
            <li>• First row: Day headers (Day 1, Day 2, etc.)</li>
            <li>• Task rows: Marked as "Task 1", "Task 2", etc.</li>
            <li>• Subtask rows: Marked with "→" prefix</li>
            <li>• Include Description, Status, and Priority rows</li>
            <li>• Maximum file size: 10MB</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={handleClose} 
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            disabled={isLoading || !file}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Importing...</span>
              </div>
            ) : (
              'Import Plan'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ImportExcelModal;