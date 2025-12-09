import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';
import { ShieldAlert, RefreshCcw, Clock, AlertTriangle, Skull, UserPlus, X, Save, Upload, Image as ImageIcon } from 'lucide-react';

interface AdminPanelProps {
  onTimeTravel: (hours: number) => void;
  onReset: () => void;
  onForceError: (type: 'double' | 'invalid') => void;
  onTamper: () => void;
  onAddCandidate: (name: string, party: string, manifesto: string, imageUrl?: string) => Promise<void>;
  electionStatus: 'active' | 'ended' | 'not_started';
  isLoading: boolean;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  onTimeTravel, 
  onReset, 
  onForceError,
  onTamper,
  onAddCandidate,
  electionStatus,
  isLoading
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCandidate, setNewCandidate] = useState({ name: '', party: '', manifesto: '' });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCandidate.name || !newCandidate.party || !newCandidate.manifesto) return;
    
    setIsSubmitting(true);
    try {
      await onAddCandidate(newCandidate.name, newCandidate.party, newCandidate.manifesto, selectedImage || undefined);
      setNewCandidate({ name: '', party: '', manifesto: '' });
      setSelectedImage(null);
      setShowAddModal(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 shadow-lg mb-8">
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-dark-700">
        <ShieldAlert className="text-red-500" size={20} />
        <h2 className="text-lg font-bold text-white">Admin & Validation Controls</h2>
        <span className="ml-auto text-xs px-2 py-1 rounded bg-red-900/30 text-red-400 border border-red-900/50">
          Demo Mode
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Time Control */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-400 flex items-center gap-2">
            <Clock size={16} /> Time Travel
          </h3>
          <p className="text-[10px] text-slate-500">Manipulate timestamp.</p>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={() => onTimeTravel(-48)}
              disabled={isLoading || electionStatus === 'ended'}
              className="text-xs w-full px-1"
              title="End Election"
            >
              End
            </Button>
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={() => onTimeTravel(48)}
              disabled={isLoading}
              className="text-xs w-full px-1"
              title="Restart Clock"
            >
              Extend
            </Button>
          </div>
        </div>

        {/* Validation Tests */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-400 flex items-center gap-2">
            <AlertTriangle size={16} /> Logic Tests
          </h3>
          <p className="text-[10px] text-slate-500">Verify constraints.</p>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={() => onForceError('double')}
              disabled={isLoading}
              className="text-xs w-full px-1"
            >
              Double Vote
            </Button>
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={() => onForceError('invalid')}
              disabled={isLoading}
              className="text-xs w-full px-1"
            >
              Invalid ID
            </Button>
          </div>
        </div>

        {/* Security Attacks */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-400 flex items-center gap-2">
            <Skull size={16} /> Attacks
          </h3>
          <p className="text-[10px] text-slate-500">Simulate breaches.</p>
          <Button 
            size="sm" 
            variant="danger" 
            onClick={onTamper}
            disabled={isLoading}
            className="w-full text-xs"
          >
            Tamper DB
          </Button>
        </div>

        {/* Management */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-400 flex items-center gap-2">
            <UserPlus size={16} /> Manage
          </h3>
          <p className="text-[10px] text-slate-500">Contract interactions.</p>
          <Button 
            size="sm" 
            variant="primary" 
            onClick={() => setShowAddModal(true)}
            disabled={isLoading || electionStatus === 'ended'}
            className="w-full text-xs"
          >
            Add Candidate
          </Button>
        </div>

        {/* Global Reset */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-400 flex items-center gap-2">
            <RefreshCcw size={16} /> System
          </h3>
          <p className="text-[10px] text-slate-500">Reset state.</p>
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

    {/* Add Candidate Modal */}
    {showAddModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-dark-800 border border-dark-600 rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
                <div className="p-4 border-b border-dark-700 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <UserPlus size={18} className="text-brand-500" />
                        New Candidate
                    </h3>
                    <button 
                        onClick={() => setShowAddModal(false)}
                        className="text-slate-500 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmitCandidate} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Candidate Name</label>
                        <input 
                            type="text"
                            required
                            className="w-full bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-brand-500 outline-none"
                            placeholder="e.g. Satoshi Nakamoto"
                            value={newCandidate.name}
                            onChange={(e) => setNewCandidate({...newCandidate, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Party Affiliation</label>
                        <input 
                            type="text"
                            required
                            className="w-full bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-brand-500 outline-none"
                            placeholder="e.g. Genesis Block Party"
                            value={newCandidate.party}
                            onChange={(e) => setNewCandidate({...newCandidate, party: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Manifesto</label>
                        <textarea 
                            required
                            rows={3}
                            className="w-full bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-brand-500 outline-none resize-none"
                            placeholder="A brief statement..."
                            value={newCandidate.manifesto}
                            onChange={(e) => setNewCandidate({...newCandidate, manifesto: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Profile Picture</label>
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-lg bg-dark-900 border border-dark-700 flex items-center justify-center overflow-hidden relative group">
                                {selectedImage ? (
                                    <img src={selectedImage} alt="Preview" className="h-full w-full object-cover" />
                                ) : (
                                    <ImageIcon size={24} className="text-dark-600" />
                                )}
                            </div>
                            <label className="cursor-pointer bg-dark-800 hover:bg-dark-700 border border-dark-600 text-slate-300 px-3 py-2 rounded-lg text-xs flex items-center gap-2 transition-colors">
                                <Upload size={14} />
                                Upload Image
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                            </label>
                        </div>
                    </div>

                    <div className="pt-2 flex gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            className="flex-1"
                            onClick={() => setShowAddModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            className="flex-1"
                            isLoading={isSubmitting}
                        >
                            <Save size={16} className="mr-2" />
                            Add Candidate
                        </Button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    )}
    </>
  );
};