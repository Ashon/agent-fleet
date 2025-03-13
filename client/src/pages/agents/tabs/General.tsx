import { Agent } from '@agentfleet/types'

export default function General({ agent }: { agent: Agent }) {
  return (
    <div className="container mx-auto px-4">
      <div className="flex items-center mb-4 gap-2">
        <div className="text-2xl">{agent.name}</div>
        <div
          className={`badge ${
            agent.status === 'active' ? 'badge-success' : 'badge-ghost'
          }`}
        >
          {agent.status}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">설명</span>
          </label>
          <div className="flex items-center h-8">
            {agent.description || '설명이 없습니다.'}
          </div>
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">생성일</span>
          </label>
          <div className="flex items-center h-8">
            {new Date(agent.createdAt).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-3">에이전트 기능</h3>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>기능</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(agent.capabilities).map(([key, value]) => (
                <tr key={key}>
                  <td>{key}</td>
                  <td>
                    <div
                      className={`badge ${value ? 'badge-success' : 'badge-ghost'}`}
                    >
                      {value ? '활성화' : '비활성화'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
