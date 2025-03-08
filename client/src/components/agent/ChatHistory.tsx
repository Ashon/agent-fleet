import { Agent } from '@agentfleet/types'

interface ChatHistoryProps {
  agent: Agent
}

export default function ChatHistory({ agent }: ChatHistoryProps) {
  return (
    <div className="px-4">
      <h2 className="text-xl mb-4">채팅 기록</h2>
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>시간</th>
              <th>사용자</th>
              <th>메시지</th>
            </tr>
          </thead>
          <tbody>
            {agent.chatHistory?.map((chat, index) => (
              <tr key={index}>
                <td>{new Date(chat.createdAt).toLocaleString()}</td>
                <td>{chat.role}</td>
                <td>{chat.content}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
