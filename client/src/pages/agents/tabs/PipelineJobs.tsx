import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { api } from '@/services/api'
import { Agent, PipelineExecutionRecord } from '@agentfleet/types'
import { CircleX, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function PipelineJobs({ agent }: { agent: Agent }) {
  const [jobs, setJobs] = useState<PipelineExecutionRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .getReasoningPipelines(agent.id)
      .then((pipelines) => {
        const foundPipeline = pipelines.find((p) => p.agentId === agent.id)
        return foundPipeline?.id
      })
      .then((id) => {
        if (!id) {
          setError('파이프라인을 찾을 수 없습니다.')
          setLoading(false)
          return
        }

        const fetchJobs = async () => {
          try {
            const data = await api.getPipelineJobsByPipelineId(id)
            setJobs(data)
          } catch (err) {
            setError('파이프라인 작업 목록을 불러오는데 실패했습니다.')
            console.error(err)
          } finally {
            setLoading(false)
          }
        }

        fetchJobs()
      })
  }, [agent.id])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto">
        <div className="alert alert-error">
          <CircleX className="stroke-current shrink-0 h-6 w-6" />
          <span>{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobs.map((job) => (
          <Card key={job.id} className="hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2 justify-between">
                  {job.pipelineName}
                  <Badge
                    variant={
                      job.status === 'completed' ? 'default' : 'secondary'
                    }
                  >
                    {job.status}
                  </Badge>
                </div>
              </CardTitle>
              <CardDescription>Job ID: {job.id}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-base-content/70" />
                  <span className="text-base-content/70">
                    시작: {formatDate(job.startTime as unknown as string)}
                  </span>
                </div>
                {job.endTime && (
                  <div className="flex items-center gap-2 text-sm mt-1">
                    <Clock className="h-4 w-4 text-base-content/70" />
                    <span className="text-base-content/70">
                      종료: {formatDate(job.endTime as unknown as string)}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-end">
                <Link
                  to={`/pipeline-jobs/${job.id}`}
                  className="btn btn-outline btn-sm"
                >
                  상세보기
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
