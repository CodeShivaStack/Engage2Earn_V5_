import React from 'react';
import { X } from 'lucide-react';

interface VerificationModalProps {
  platform: string;
  username: string;
  onClose: () => void;
  onVerify: () => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  platform,
  username,
  onClose,
  onVerify,
}) => {
  const verificationPost = `Hi, all I am ready to engage socially! #engage2earn`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Verify {platform} Account</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-gray-600">
            To verify your {platform} account, please post the following message:
          </p>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-medium break-words">{verificationPost}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-500">Steps to verify:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>Copy the message above</li>
              <li>Post it on your {platform} account</li>
              <li>Click the verify button below</li>
            </ol>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={onVerify}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg
                hover:bg-purple-700 transition-colors"
            >
              Verify Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};