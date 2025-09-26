import UserManagement from '../../components/UserManagement'
import './HomeScreen.scss'

function HomeScreen() {
  return (
    <div className="home-screen">
      <div className="nav-container">
        <h1 className="title">
          User Management System Gazal
        </h1>
        <p className="subtitle">
          MongoDB User Operations
        </p>
        <div className="nav-tabs">
          <div className="nav-button nav-button-active">
            👥 User Management
          </div>
        </div>
      </div>

      <div className="content">
        <UserManagement />
      </div>
    </div>
  )
}

export default HomeScreen