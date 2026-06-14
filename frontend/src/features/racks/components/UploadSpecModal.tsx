import { useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useUploadRackSpec } from '../hooks/useRackAttachments';

interface UploadSpecModalProps {
  rackId: number;
  onClose: () => void;
}

export function UploadSpecModal({ rackId, onClose }: UploadSpecModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { mutate: uploadSpec, isPending } = useUploadRackSpec();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Only PDF files are allowed');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    uploadSpec({ rackId, file: selectedFile }, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Specification</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* File input */}
          <div className="border-2 border-dashed border-gray-300 dark:border-dark-border rounded-lg p-6 text-center cursor-pointer hover:border-sky-500 dark:hover:border-sky-500 transition-colors">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="pdf-input"
            />
            <label htmlFor="pdf-input" className="cursor-pointer flex flex-col items-center gap-2">
              <Upload size={24} className="text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {selectedFile ? selectedFile.name : 'Choose a PDF file'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">or drag and drop (Max 5MB)</p>
              </div>
            </label>
          </div>

          {/* File info */}
          {selectedFile && (
            <div className="bg-gray-50 dark:bg-dark-bg p-3 rounded text-sm">
              <p className="text-gray-900 dark:text-white font-medium">{selectedFile.name}</p>
              <p className="text-gray-600 dark:text-gray-400">{(selectedFile.size / 1024).toFixed(2)} KB</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isPending}
            className="gap-2"
          >
            {isPending && <Loader2 size={16} className="animate-spin" />}
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
