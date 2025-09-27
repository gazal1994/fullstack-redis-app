// import './HomeScreen.scss'
import TaskManager from '../../components/tasks/TaskManager'

function HomeScreen() {
  return (
    <div className="home-screen">
      <header className="nav-container" role="banner">
        <h1 className="title">User Management System Gazal123</h1>
        <p className="subtitle">MongoDB User Operations</p>

        <nav className="nav-tabs" aria-label="Primary">
          <button
            className="nav-button nav-button-active"
            aria-current="page"
            type="button"
          >
            👥 User Management
          </button>

        </nav>
      </header>

      <main className="content" role="main">
        <TaskManager />
      </main>
    </div>
  )
}

export default HomeScreen
