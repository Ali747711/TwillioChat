import App from './App'
import Landing from './Landing'

export default function Root() {
  const path = window.location.pathname
  return path.startsWith('/app') ? <App /> : <Landing />
}
