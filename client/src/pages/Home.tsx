import { useState } from 'react'
import Logo from '../assets/logo.svg'

// 홈 페이지 컴포넌트
export default function Home() {
  const [count, setCount] = useState<number>(0)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <img src={Logo} className="logo w-1/5 mx-auto" alt="AgentFleet Logo" />
        <h1 className="text-4xl font-bold my-4">AgentFleet</h1>
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <button
              className="btn btn-primary"
              onClick={() => setCount((count) => count + 1)}
            >
              count is {count}
            </button>
            <p className="mt-4">
              Edit{' '}
              <code className="bg-base-200 px-2 py-1 rounded">src/App.tsx</code>{' '}
              and save to test HMR
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
