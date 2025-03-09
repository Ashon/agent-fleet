import { useState } from 'react'
import Logo from '../assets/logo.svg'

// 홈 페이지 컴포넌트
export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <img src={Logo} className="logo w-1/5 mx-auto" alt="AgentFleet Logo" />
        <h1 className="text-4xl font-bold my-4">AgentFleet</h1>
      </div>
    </div>
  )
}
