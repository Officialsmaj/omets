import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Briefcase, FileText, Save, CheckCircle2, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function ProfileSettings() {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    role: (user as any)?.role || 'Engineer',
    bio: (user as any)?.bio || 'Experienced mechanical engineer specializing in industrial heat transfer systems and thermal modelling.',
    industry: (user as any)?.industry || 'Mechanical Engineering',
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-12">
        {/* Navigation */}
        <Link to="/dashboard" className="flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
          <ChevronLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        {/* Header */}
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Profile Settings</h1>
          <p className="text-lg text-slate-600">Update your personal and professional information on OMETS.</p>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-8">
          {/* Profile Picture Mockup */}
          <div className="flex items-center gap-8 p-8 rounded-3xl bg-slate-50 border border-black/5">
             <div className="relative h-24 w-24 overflow-hidden rounded-full bg-slate-200 border-4 border-white shadow-sm">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-full w-full p-6 text-slate-400" />
                )}
             </div>
             <div className="flex flex-col gap-2">
                <button type="button" className="text-sm font-bold text-emerald-600 hover:underline">Change Profile Photo</button>
                <p className="text-xs text-slate-500">JPG, GIF or PNG. Max size of 2MB.</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                 <User className="h-4 w-4 text-emerald-600" /> Full Name
              </label>
              <input 
                type="text" 
                value={formData.displayName}
                onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm focus:border-emerald-600 focus:outline-none transition-all"
                placeholder="John Doe"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                 <Mail className="h-4 w-4 text-emerald-600" /> Email Address
              </label>
              <input 
                type="email" 
                value={user?.email || ''} 
                disabled
                className="rounded-xl border border-black/5 bg-slate-50 px-4 py-3 text-sm text-slate-500 cursor-not-allowed"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                 <Briefcase className="h-4 w-4 text-emerald-600" /> Professional Role
              </label>
              <input 
                type="text" 
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm focus:border-emerald-600 focus:outline-none transition-all"
                placeholder="Senior Mechanical Engineer"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                 <Briefcase className="h-4 w-4 text-emerald-600" /> Industry
              </label>
              <select 
                value={formData.industry}
                onChange={(e) => setFormData({...formData, industry: e.target.value})}
                className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm focus:border-emerald-600 focus:outline-none transition-all"
              >
                <option>Mechanical Engineering</option>
                <option>Automotive</option>
                <option>Aerospace</option>
                <option>Energy & Utilities</option>
                <option>Manufacturing</option>
                <option>Robotics</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
               <FileText className="h-4 w-4 text-emerald-600" /> Professional Bio
            </label>
            <textarea 
              rows={4}
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm focus:border-emerald-600 focus:outline-none transition-all resize-none"
              placeholder="Tell us about your engineering background..."
            />
          </div>

          <div className="flex items-center justify-end gap-4 border-t border-black/5 pt-8">
            {saveSuccess && (
              <span className="flex items-center gap-2 text-sm font-bold text-emerald-600 animate-in fade-in slide-in-from-right-2">
                <CheckCircle2 className="h-4 w-4" /> Profile updated successfully
              </span>
            )}
            <button 
              type="submit" 
              disabled={isSaving}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
            >
              {isSaving ? 'Saving Changes...' : <><Save className="h-4 w-4" /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
