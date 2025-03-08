import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Agents from './pages/agents/Agents'
import EditAgent from './pages/agents/EditAgent'
import NewAgent from './pages/agents/NewAgent'
import Chat from './pages/Chat'
import Connectors from './pages/connectors/Connectors'
import NewConnector from './pages/connectors/NewConnector'
import Fleets from './pages/fleets/Fleets'
import Home from './pages/Home'
import NotFound from './pages/NotFound'

function App() {
  return (
    <Router>
      <Routes>
        {/* MainLayout을 사용하는 라우트들 */}
        <Route element={<MainLayout />}>
          {/* 홈 */}
          <Route index element={<Home />} />

          {/* Fleet 관련 라우트 */}
          <Route path="fleets">
            <Route index element={<Fleets />} />
          </Route>

          {/* 에이전트 관련 라우트 */}
          <Route path="agents">
            <Route index element={<Agents />} />
            <Route path="new" element={<NewAgent />} />
            <Route path=":id">
              <Route path="chat" element={<Chat />} />
              <Route path="edit">
                <Route index element={<Navigate to="workflow" replace />} />
                <Route path=":tab" element={<EditAgent />} />
              </Route>
            </Route>
          </Route>

          {/* 커넥터 관련 라우트 */}
          <Route path="connectors">
            <Route index element={<Connectors />} />
            <Route path="new" element={<NewConnector />} />
          </Route>

          {/* 404 처리 */}
          <Route path="404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
