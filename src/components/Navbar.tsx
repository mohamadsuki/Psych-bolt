import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, FileText, Users, Settings, User, List } from 'lucide-react';
import { getCurrentTherapist, logout, isAdmin } from '../lib/auth';

interface NavbarProps {
  activeSection: string;
  onSectionChange: (section: 'home' | 'parent' | 'evaluator' | 'clients' | 'reports' | 'new-client' | 'admin') => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeSection, onSectionChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const therapist = getCurrentTherapist();
  const userIsAdmin = isAdmin();
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const handleLogout = () => {
    // Perform logout directly without confirmation dialog
    try {
      setIsLoggingOut(true);
      logout();
      // Note: No need for additional logic since logout function handles the redirect
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
      alert('אירעה שגיאה בתהליך ההתנתקות. נא לנסות שוב.');
    }
  };

  if (!therapist) return null;

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="font-semibold text-xl text-blue-600 flex items-center">
              <FileText className="ml-2" size={24} />
              מערכת אבחון דיגיטלית
            </span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4 space-x-reverse">
            <button
              onClick={() => onSectionChange('clients')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${activeSection === 'clients' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              רשימת מטופלים
            </button>
            
            <button
              onClick={() => onSectionChange('new-client')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${activeSection === 'new-client' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              מטופל חדש
            </button>
            
            {userIsAdmin && (
              <button
                onClick={() => onSectionChange('admin')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${activeSection === 'admin' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                ניהול מטפלים
              </button>
            )}
            
            <div className="border-r border-gray-300 h-6 mx-2"></div>
            
            <div className="flex items-center bg-gray-100 px-3 py-1 rounded">
              <User size={16} className="ml-1 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {therapist.name}
                {userIsAdmin && <span className="mr-1 text-xs bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-full">מנהל</span>}
              </span>
            </div>
            
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
              title="התנתק"
            >
              <LogOut size={20} />
            </button>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-gray-700 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white pt-2 pb-4 px-4 shadow-inner">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center bg-gray-100 p-3 rounded mb-2">
              <User size={18} className="ml-2 text-gray-600" />
              <div>
                <div className="font-medium text-gray-800">{therapist.name}</div>
                <div className="text-sm text-gray-500">
                  {userIsAdmin ? 'מנהל מערכת' : 'מטפל'}
                </div>
              </div>
            </div>
            
            <button
              onClick={() => {
                onSectionChange('clients');
                closeMenu();
              }}
              className={`px-3 py-2 rounded-md text-right flex items-center ${activeSection === 'clients' ? 'text-blue-600 bg-blue-50' : 'text-gray-700'}`}
            >
              <List size={18} className="ml-2" />
              רשימת מטופלים
            </button>
            
            <button
              onClick={() => {
                onSectionChange('new-client');
                closeMenu();
              }}
              className={`px-3 py-2 rounded-md text-right flex items-center ${activeSection === 'new-client' ? 'text-blue-600 bg-blue-50' : 'text-gray-700'}`}
            >
              <Users size={18} className="ml-2" />
              מטופל חדש
            </button>
            
            {userIsAdmin && (
              <button
                onClick={() => {
                  onSectionChange('admin');
                  closeMenu();
                }}
                className={`px-3 py-2 rounded-md text-right flex items-center ${activeSection === 'admin' ? 'text-blue-600 bg-blue-50' : 'text-gray-700'}`}
              >
                <Settings size={18} className="ml-2" />
                ניהול מטפלים
              </button>
            )}
            
            <div className="border-t border-gray-200 my-2 pt-2"></div>
            
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="px-3 py-2 rounded-md text-right text-red-600 flex items-center disabled:opacity-50"
            >
              <LogOut size={18} className="ml-2" />
              התנתק
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;