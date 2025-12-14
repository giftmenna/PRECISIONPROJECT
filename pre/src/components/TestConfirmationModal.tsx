"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, Shield, X, Lock } from "lucide-react";

interface TestConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  testType: 'practice' | 'competition';
  questionCount?: number;
  timeLimit?: number;
  timeDisplay?: string;
  entryFee?: number;
}

export default function TestConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  testType,
  questionCount = 10,
  timeLimit = 60,
  timeDisplay,
  entryFee = 0
}: TestConfirmationModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    // Prevent going back
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', window.location.href);
      window.addEventListener('popstate', () => {
        window.history.pushState(null, '', window.location.href);
      });
      
      // Prevent screenshots
      document.addEventListener('contextmenu', (e) => e.preventDefault());
      document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 's' || e.key === 'c')) {
          e.preventDefault();
        }
      });
    }
    
    onConfirm();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-orange-500" />
            Test Confirmation
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-6 border border-orange-200">
            <h4 className="text-lg font-semibold text-orange-800 dark:text-orange-200 mb-4">
              Important Rules
            </h4>
            <ul className="space-y-2 text-sm text-orange-700 dark:text-orange-300">
              <li>• Screen will be locked to prevent navigation</li>
              <li>• Screenshots are disabled</li>
              <li>• Going back will end the test immediately</li>
              <li>• Timer cannot be paused</li>
              <li>• All answers are final</li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Time Limit</p>
              <p className="font-semibold">{timeDisplay || `${timeLimit} min`}</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Shield className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Questions</p>
              <p className="font-semibold">{questionCount}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleConfirm} className="flex-1 bg-orange-600 hover:bg-orange-700">
              <Lock className="h-4 w-4 mr-2" />
              Start Test
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 