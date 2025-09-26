import { useState } from 'react'
import UserManagement from '../../components/UserManagement'
import CacheManagement from '../../components/CacheManagement'
import './HomeScreen.scss'

type ActiveTab = 'users' | 'cache';

function HomeScreen() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('users')

  return (
    <div className="home-screen">
      {/* Navigation */}
      <nav className="nav-container">
        <div className="nav-wrapper">
          <div className="nav-content">
            <div className="nav-left">
              <h1 className="nav-title">
                Full Stack App with Redux
              </h1>
              <div className="nav-tabs">
                <button
                  onClick={() => setActiveTab('users')}
                  className={`nav-button ${
                    activeTab === 'users'
                      ? 'nav-button-active'
                      : 'nav-button-inactive'
                  }`}
                >
                  User Management
                </button>
                <button
                  onClick={() => setActiveTab('cache')}
                  className={`nav-button ${
                    activeTab === 'cache'
                      ? 'nav-button-active'
                      : 'nav-button-inactive'
                  }`}
                >
                  Cache Management
                </button>
              </div>
            </div>
            <div className="nav-right">
              <span className="connection-status">
                Connected to: MongoDB + Redis + Express
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'cache' && <CacheManagement />}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-wrapper">
          <div className="footer-content">
            <div className="footer-left">
              <span>Built with React + Redux + TypeScript</span>
              <span className="footer-separator">•</span>
              <span>Backend: Node.js + Express + MongoDB + Redis</span>
            </div>
            <div className="footer-right">
              <div className="status-indicator"></div>
              <span>Connected</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomeScreen