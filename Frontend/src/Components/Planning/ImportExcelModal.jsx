import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { uploadAPI } from '../services/api';
import { excelParser } from '../services/excelParser';

const ImportExcelModal = ({ isOpen, onClose, onImport }) => {
  const [file, setFile] = useState(null);
  const [planName, setPlanName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!excelParser.validateExcelFile(selectedFile)) {
        setError('Please select a valid Excel file (.xlsx, .xls)');
        setFile(null);
        return;
      }
      
      if (parseFloat(excelParser.getFileSizeMB(selectedFile)) > 10) {
        setError('File size must be less than 10MB');
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
      setError('');
      
      // Set default plan name from filename
      if (!planName) {
        const fileName = selectedFile.name.replace(/\.[^/.]+$/, "");
        setPlanName(fileName);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !planName) {
      setError('Please select a file and enter a plan name');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('excelFile', file);
      formData.append('planName', planName);

      const importedPlan = await uploadAPI.importPlan(formData);
      onImport(importedPlan);
      setFile(null);
      setPlanName('');
      onClose();
    } catch (err) {
      setError('Failed to import plan: ' + (err.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Plan from Excel">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Plan Name
          </label>
          <input
            type="text"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            placeholder="Enter plan name"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Excel File
          </label>
          <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-gray-600 transition-colors">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".xlsx,.xls"
              className="hidden"
              id="excel-file"
            />
            <label htmlFor="excel-file" className="cursor-pointer">
              <div className="text-gray-400 mb-2">
                {file ? file.name : 'Choose Excel file to upload'}
              </div>
              <Button type="button" variant="secondary" size="sm">
                Browse Files
              </Button>
            </label>
            {file && (
              <div className="mt-2 text-sm text-gray-500">
                Size: {excelParser.getFileSizeMB(file)} MB
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <h4 className="text-white font-medium mb-2">Excel Format Requirements:</h4>
          <ul className="text-gray-400 text-sm space-y-1">
            <li>• First row: Day headers (Day 1, Day 2, etc.)</li>
            <li>• Task rows: Marked as "Task 1", "Task 2", etc.</li>
            <li>• Subtask rows: Marked with "→" prefix</li>
            <li>• Status and Priority rows for each day</li>
          </ul>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading || !file}>
            {isLoading ? 'Importing...' : 'Import Plan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ImportExcelModal;