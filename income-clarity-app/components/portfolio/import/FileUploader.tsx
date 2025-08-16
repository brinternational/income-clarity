'use client';

import React, { useState, useCallback, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  X
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ImportMethod } from '../ImportWizard';

export interface FileUploaderProps {
  method: ImportMethod;
  onDataUpload: (data: string) => Promise<void>;
  loading: boolean;
}

interface FileValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  preview?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = {
  csv: ['.csv', 'text/csv', 'application/csv'],
  json: ['.json', 'application/json'],
  paste: ['text/plain']
};

export function FileUploader({ method, onDataUpload, loading }: FileUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileValidation, setFileValidation] = useState<FileValidation | null>(null);
  const [pastedData, setPastedData] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const validateFile = (file: File): FileValidation => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (10MB)`);
    }

    // Check file type based on method
    const acceptedTypes = ACCEPTED_FILE_TYPES[method.id === 'broker' ? 'csv' : method.id] || [];
    const isValidType = acceptedTypes.some(type => 
      type.startsWith('.') ? file.name.toLowerCase().endsWith(type) : file.type === type
    );

    if (!isValidType) {
      errors.push(`Invalid file type. Expected: ${acceptedTypes.join(', ')}`);
    }

    // File-specific validations
    if (method.id === 'csv' || method.id === 'broker') {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        warnings.push('File should have .csv extension for best compatibility');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  };

  const validateData = (data: string): FileValidation => {
    const errors: string[] = [];
    const warnings: string[] = [];
    let preview = '';

    if (!data.trim()) {
      errors.push('No data provided');
      return { isValid: false, errors, warnings };
    }

    if (method.id === 'csv' || method.id === 'broker') {
      const lines = data.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        errors.push('CSV must contain at least a header row and one data row');
      } else {
        const headers = lines[0].split(',').map(h => h.trim());
        const dataRows = lines.slice(1);
        
        if (headers.length < 2) {
          warnings.push('CSV should have multiple columns for proper import');
        }
        
        // Check for common required columns
        const hasSymbol = headers.some(h => 
          ['symbol', 'ticker', 'stock'].some(term => h.toLowerCase().includes(term))
        );
        const hasShares = headers.some(h => 
          ['shares', 'quantity', 'qty'].some(term => h.toLowerCase().includes(term))
        );
        
        if (!hasSymbol) {
          warnings.push('No symbol/ticker column detected');
        }
        if (!hasShares) {
          warnings.push('No shares/quantity column detected');
        }
        
        preview = `Found ${dataRows.length} holdings with ${headers.length} columns`;
      }
    } else if (method.id === 'json') {
      try {
        const parsed = JSON.parse(data);
        if (parsed.portfolio && Array.isArray(parsed.portfolio)) {
          preview = `Found ${parsed.portfolio.length} holdings in portfolio array`;
        } else if (Array.isArray(parsed)) {
          preview = `Found ${parsed.length} holdings in array`;
        } else {
          warnings.push('JSON structure may not match expected format');
          preview = 'JSON parsed successfully but structure may need mapping';
        }
      } catch (e) {
        errors.push('Invalid JSON format');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      preview
    };
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileSelect = async (file: File) => {
    const validation = validateFile(file);
    setFileValidation(validation);
    setUploadedFile(file);

    if (validation.isValid) {
      try {
        const text = await file.text();
        const dataValidation = validateData(text);
        setFileValidation({
          ...validation,
          ...dataValidation,
          errors: [...validation.errors, ...dataValidation.errors],
          warnings: [...validation.warnings, ...dataValidation.warnings]
        });
      } catch (error) {
        setFileValidation({
          ...validation,
          isValid: false,
          errors: [...validation.errors, 'Failed to read file content']
        });
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handlePastedDataChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const data = e.target.value;
    setPastedData(data);
    
    if (data.trim()) {
      const validation = validateData(data);
      setFileValidation(validation);
    } else {
      setFileValidation(null);
    }
  };

  const handleUpload = async () => {
    if (method.id === 'paste' && pastedData) {
      await onDataUpload(pastedData);
    } else if (uploadedFile) {
      const text = await uploadedFile.text();
      await onDataUpload(text);
    }
  };

  const clearFile = () => {
    setUploadedFile(null);
    setFileValidation(null);
    setPastedData('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (textAreaRef.current) {
      textAreaRef.current.value = '';
    }
  };

  const canUpload = () => {
    if (method.id === 'paste') {
      return pastedData.trim() && fileValidation?.isValid;
    }
    return uploadedFile && fileValidation?.isValid;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Upload Your Data</h2>
        <p className="text-gray-600 dark:text-gray-300">
          {method.id === 'paste' 
            ? 'Paste your portfolio data from Excel, Google Sheets, or any text source.'
            : `Upload your ${method.name.toLowerCase()} file to import your portfolio holdings.`
          }
        </p>
      </div>

      {method.id === 'paste' ? (
        /* Manual Paste Interface */
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Paste Your Portfolio Data
              </label>
              <textarea
                ref={textAreaRef}
                value={pastedData}
                onChange={handlePastedDataChange}
                placeholder={`Paste your data here. Example:
Symbol,Shares,Cost Basis,Purchase Date
AAPL,100,150.00,2024-01-15
MSFT,50,250.00,2024-01-20
JEPI,200,55.00,2024-02-01`}
                className="w-full h-48 p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800"
                disabled={loading}
              />
            </div>
            
            {pastedData && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {pastedData.split('\n').filter(line => line.trim()).length} lines of data
              </div>
            )}
          </div>
        </Card>
      ) : (
        /* File Upload Interface */
        <Card className="p-6">
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${dragOver 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }
              ${loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !loading && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept={ACCEPTED_FILE_TYPES[method.id === 'broker' ? 'csv' : method.id]?.join(',')}
              onChange={handleFileInputChange}
              disabled={loading}
            />
            
            {uploadedFile ? (
              <div className="space-y-2">
                <FileText className="w-12 h-12 text-green-500 mx-auto" />
                <div className="font-medium">{uploadedFile.name}</div>
                <div className="text-sm text-gray-500">
                  {(uploadedFile.size / 1024).toFixed(1)} KB
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFile();
                  }}
                  className="mt-2"
                >
                  <X className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              </div>
            ) : loading ? (
              <div className="space-y-2">
                <Loader2 className="w-12 h-12 text-blue-500 mx-auto animate-spin" />
                <div className="font-medium">Processing...</div>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                <div className="font-medium">
                  Drop your file here or click to browse
                </div>
                <div className="text-sm text-gray-500">
                  Supported formats: {ACCEPTED_FILE_TYPES[method.id === 'broker' ? 'csv' : method.id]?.join(', ')}
                  <br />
                  Maximum file size: 10MB
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Validation Results */}
      {fileValidation && (
        <Card className="p-4">
          <div className="space-y-3">
            {fileValidation.preview && (
              <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{fileValidation.preview}</span>
              </div>
            )}

            {fileValidation.errors.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-red-700 dark:text-red-300">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Errors:</span>
                </div>
                {fileValidation.errors.map((error, index) => (
                  <div key={index} className="text-sm text-red-600 dark:text-red-400 ml-6">
                    • {error}
                  </div>
                ))}
              </div>
            )}

            {fileValidation.warnings.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-yellow-700 dark:text-yellow-300">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Warnings:</span>
                </div>
                {fileValidation.warnings.map((warning, index) => (
                  <div key={index} className="text-sm text-yellow-600 dark:text-yellow-400 ml-6">
                    • {warning}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Upload Button */}
      {(uploadedFile || pastedData) && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {fileValidation?.isValid 
                ? 'Ready to process your data'
                : 'Please fix the errors above before continuing'
              }
            </div>
            <Button
              onClick={handleUpload}
              disabled={!canUpload() || loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Process Data'
              )}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}