import { useState } from 'react'
import UserManagement from './components/UserManagement'
import CacheManagement from './components/CacheManagement'
import './App.css'

type ActiveTab = 'users' | 'cache';

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('users')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-gray-900">
                Full Stack App with Redux
              </h1>
              <div className="flex space-x-4">
                <button
                  onClick={() => setActiveTab('users')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'users'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  User Management
                </button>
                <button
                  onClick={() => setActiveTab('cache')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'cache'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Cache Management
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Connected to: MongoDB + Redis + Express
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-6">
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'cache' && <CacheManagement />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-8">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span>Built with React + Redux + TypeScript</span>
              <span>•</span>
              <span>Backend: Node.js + Express + MongoDB + Redis</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Connected</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
