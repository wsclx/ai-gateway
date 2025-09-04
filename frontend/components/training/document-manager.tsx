'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  FileText, 
  File, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Download
} from 'lucide-react';

interface TrainingDocument {
  id: string;
  filename: string;
  content_type: string;
  file_size: number;
  status: 'uploaded' | 'processing' | 'processed' | 'failed';
  processed_at?: string;
  created_at: string;
}

export function DocumentManager() {
  const [documents, setDocuments] = useState<TrainingDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      acceptedFiles.forEach(file => {
        formData.append('documents', file);
      });
      
      // Add assistant ID (for now, use a default one)
      formData.append('assistant_id', 'default-assistant-id');

      const response = await fetch('/api/proxy/training/documents', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const uploaded = await response.json();
        setDocuments(prev => [...prev, ...uploaded]);
        setUploadProgress(100);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
      'application/json': ['.json']
    },
    multiple: true
  });

  const deleteDocument = async (id: string) => {
    try {
      const response = await fetch(`/api/v1/training/documents/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setDocuments(prev => prev.filter(doc => doc.id !== id));
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-error" />;
      default:
        return <File className="h-4 w-4 text-text-muted" />;
    }
  };

  const variants = {
    uploaded: 'secondary' as const,
    processing: 'secondary' as const,
    processed: 'secondary' as const,
    error: 'destructive' as const,
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'uploaded':
        return 'Hochgeladen';
      case 'processing':
        return 'Verarbeitung';
      case 'processed':
        return 'Verarbeitet';
      case 'error':
        return 'Fehler';
      default:
        return status;
    }
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {getStatusText(status)}
      </Badge>
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Training Dokumente hochladen</span>
          </CardTitle>
          <CardDescription>
            Laden Sie PDF, DOCX, TXT, CSV oder JSON Dateien hoch. 
            Diese werden lokal verarbeitet und für das Training verwendet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-text-muted" />
            {isDragActive ? (
              <p className="text-lg font-medium text-primary">
                Dateien hier ablegen...
              </p>
            ) : (
              <div>
                <p className="text-lg font-medium text-text">
                  Dateien hierher ziehen oder klicken zum Auswählen
                </p>
                <p className="text-sm text-text-muted mt-2">
                  Unterstützte Formate: PDF, DOCX, TXT, CSV, JSON
                </p>
              </div>
            )}
          </div>

          {uploading && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-text-muted mb-2">
                <span>Upload läuft...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Hochgeladene Dokumente</span>
            <Badge variant="secondary">{documents.length}</Badge>
          </CardTitle>
          <CardDescription>
            Übersicht aller für das Training hochgeladenen Dokumente
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8 text-text-muted">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Noch keine Dokumente hochgeladen</p>
              <p className="text-sm">Laden Sie Dokumente hoch, um mit dem Training zu beginnen</p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(doc.status)}
                    <div>
                      <p className="font-medium text-text">{doc.filename}</p>
                      <p className="text-sm text-text-muted">
                        {formatFileSize(doc.file_size)} • {doc.content_type}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(doc.status)}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteDocument(doc.id)}
                      className="text-error hover:text-error hover:bg-error/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
