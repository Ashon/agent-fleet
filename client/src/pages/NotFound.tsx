import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-9xl font-bold text-primary">404</h1>
        <h2 className="card-title justify-center text-2xl">
          페이지를 찾을 수 없습니다
        </h2>
        <Link to="/" className="btn btn-link">
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  )
}
