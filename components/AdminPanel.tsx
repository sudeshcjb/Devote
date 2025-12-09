import React from 'react';
import { Button } from './Button';
import { ShieldAlert, RefreshCcw, Clock, AlertTriangle, Skull } from 'lucide-react';

interface AdminPanelProps {
  onTimeTravel: (hours: number) => void;
  onReset: () => void;
  onForceError: (type: 'double' | 'invalid') => void;
  onTamper: () => void;
  electionStatus: 'active' | 'ended' | 'not_started';
  isLoading: boolean;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  onTimeTravel, 
  onReset, 
  onForceError,
  onTamper,
  electionStatus,
  isLoading
}) => {
  return (
    <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 shadow-lg mb-8">
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-dark-700">
        <ShieldAlert className="text-red-500" size={20} />
        <h2 className="text-lg font-bold text-white">Admin & Validation Controls</h2>
        <span className="ml-auto text-xs px-2 py-1 rounded bg-red-900/30 text-red-400 border border-red-900/50">
          Demo Mode
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Time Control */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-400 flex items-center gap-2">
            <Clock size={16} /> Time Travel
          </h3>
          <p className="text-xs text-slate-500">Manipulate block.timestamp to validate election period logic.</p>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={() => onTimeTravel(-48)}
              disabled={isLoading || electionStatus === 'ended'}
              className="text-xs w-full"
              title="Fast forward to end of election"
            >
              End Election
            </Button>
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={() => onTimeTravel(48)}
              disabled={isLoading}
              className="text-xs w-full"
              title="Reset election timer to 48h from now"
            >
              Restart Clock
            </Button>
          </div>
        </div>

        {/* Validation Tests */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-400 flex items-center gap-2">
            <AlertTriangle size={16} /> Logic Tests
          </h3>
          <p className="text-xs text-slate-500">Trigger smart contract errors to verify security constraints.</p>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={() => onForceError('double')}
              disabled={isLoading}
              className="text-xs w-full"
            >
              Test Double Vote
            </Button>
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={() => onForceError('invalid')}
              disabled={isLoading}
              className="text-xs w-full"
            >
              Invalid ID
            </Button>
          </div>
        </div>

        {/* Security Attacks */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-400 flex items-center gap-2">
            <Skull size={16} /> Attack Simulation
          </h3>
          <p className="text-xs text-slate-500">Simulate a database breach that modifies votes without proof.</p>
          <Button 
            size="sm" 
            variant="danger" 
            onClick={onTamper}
            disabled={isLoading}
            className="w-full text-xs"
          >
            Tamper with DB
          </Button>
        </div>

        {/* Global Reset */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-400 flex items-center gap-2">
            <RefreshCcw size={16} /> System Reset
          </h3>
          <p className="text-xs text-slate-500">Reset blockchain state (votes & voters) to initial values.</p>
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={onReset}
            isLoading={isLoading}
            className="w-full text-xs"
          >
            Reset Election
          </Button>
        </div>
      </div>
    </div>
  );
};