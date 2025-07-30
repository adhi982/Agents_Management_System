import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import uploadService from '../../services/uploadService';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;

    const allowedTypes = ['.csv', '.xlsx', '.xls'];
    const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
    
    if (!allowedTypes.includes(fileExtension)) {
      toast.error('Invalid file type. Only CSV, XLSX, and XLS files are allowed.');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('File size must be less than 5MB.');
      return;
    }

    setFile(selectedFile);
    setUploadResult(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    setUploading(true);

    try {
      const response = await uploadService.uploadFile(file);
      setUploadResult(response);
      setFile(null);
      fileInputRef.current.value = '';
      toast.success('File uploaded and distributed successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setUploadResult(null);
    fileInputRef.current.value = '';
  };

  const handleChooseFile = () => {
    fileInputRef.current.click();
  };

  return (
    <div>
      <h2 className="mb-4">Upload & Distribute CSV/Excel Files</h2>
      
      <div className="card mb-4">
        <h3>Upload File</h3>
        
        <div
          className={`file-upload ${dragOver ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleChooseFile}
        >
          <span className="file-upload-icon">📁</span>
          <div className="file-upload-text">
            {dragOver ? 'Drop your file here!' : 'Drag & Drop your file here'}
          </div>
          <div className="file-upload-hint">
            <strong>Supported formats:</strong> CSV, XLSX, XLS files<br/>
            <strong>Max size:</strong> 5MB<br/>
            <strong>Required columns:</strong> FirstName, Phone (Notes optional)
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv,.xlsx,.xls"
          />
          
          {!file ? (
            <>
              <div className="file-upload-text">
                <strong>Click to choose file</strong> or drag and drop
              </div>
              <div className="file-upload-hint">
                Supported formats: CSV, XLSX, XLS (Max size: 5MB)
              </div>
            </>
          ) : (
            <div>
              <div className="file-upload-text">
                <strong>Selected file:</strong> {file.name}
              </div>
              <div className="file-upload-hint">
                Size: {(file.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
          )}
        </div>

        {file && (
          <div className="mt-3 d-flex justify-content-center" style={{ gap: '10px' }}>
            <button
              className="btn btn-success"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload & Distribute'}
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleRemoveFile}
              disabled={uploading}
            >
              Remove File
            </button>
          </div>
        )}
      </div>

      <div className="card">
        <h3>File Format Requirements</h3>
        <div style={{ lineHeight: '1.6' }}>
          <p>Your file should contain the following columns (case-insensitive):</p>
          <ul>
            <li><strong>FirstName</strong> - The first name of the contact (required)</li>
            <li><strong>Phone</strong> - The phone number (required)</li>
            <li><strong>Notes</strong> - Additional notes (optional)</li>
          </ul>
          <p><strong>Note:</strong> The system will automatically distribute the data equally among all active agents.</p>
        </div>
      </div>

      {uploadResult && (
        <div className="card" style={{ backgroundColor: '#d4edda', borderColor: '#c3e6cb' }}>
          <h3 style={{ color: '#155724' }}>Upload Successful!</h3>
          <div style={{ color: '#155724' }}>
            <p><strong>Total Items:</strong> {uploadResult.totalItems}</p>
            <p><strong>Total Agents:</strong> {uploadResult.totalAgents}</p>
            <h4>Distribution Summary:</h4>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Agent Name</th>
                    <th>Email</th>
                    <th>Items Assigned</th>
                    <th>Upload Date</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadResult.distributions.map((dist, index) => (
                    <tr key={index}>
                      <td>{dist.agentName}</td>
                      <td>{dist.agentEmail}</td>
                      <td>{dist.itemCount}</td>
                      <td>{new Date(dist.uploadDate).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
