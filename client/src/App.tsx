import MainLayout from '@/layouts/MainLayout'
import Agents from '@/pages/agents/Agents'
import NewAgent from '@/pages/agents/NewAgent'
import Chat from '@/pages/Chat'
import Connectors from '@/pages/connectors/Connectors'
import NewConnector from '@/pages/connectors/NewConnector'
import EditFleet from '@/pages/fleets/EditFleet'
import Fleets from '@/pages/fleets/Fleets'
import NewFleet from '@/pages/fleets/NewFleet'
import Home from '@/pages/Home'
import NotFound from '@/pages/NotFound'
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from 'react-router-dom'
import './index.css'
import InfoAgent from './pages/agents/InfoAgent'

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
            <Route path="new" element={<NewFleet />} />
            <Route path=":id/edit" element={<EditFleet />} />
          </Route>

          {/* 에이전트 관련 라우트 */}
          <Route path="agents">
            <Route index element={<Agents />} />
            <Route path="new" element={<NewAgent />} />
            <Route path=":id">
              <Route index element={<Navigate to="general" replace />} />
              <Route path=":tab">
                <Route index element={<InfoAgent />} />
                <Route path=":subTab">
                  <Route index element={<InfoAgent />} />
                </Route>
              </Route>
              <Route path="chat" element={<Chat />} />
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
