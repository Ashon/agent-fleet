import Card from '@/components/Card'
import { api } from '@/services/api'
import { Agent, PipelineExecutionRecord } from '@agentfleet/types'
import { ClockIcon, XCircleIcon } from '@heroicons/react/24/outline'
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
  }, [])

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

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'badge-success'
      case 'running':
        return 'badge-info'
      case 'failed':
        return 'badge-error'
      case 'pending':
        return 'badge-warning'
      default:
        return 'badge-ghost'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto">
        <div className="alert alert-error">
          <XCircleIcon className="stroke-current shrink-0 h-6 w-6" />
          <span>{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobs.map((job) => (
          <Card key={job.id} hover>
            <div>
              <div className="flex items-start justify-between">
                <h2 className="card-title">{job.pipelineName}</h2>
                <div
                  className={`badge badge-sm ${getStatusBadgeColor(job.status)}`}
                >
                  {job.status}
                </div>
              </div>

              <p className="text-sm text-base-content/70 mt-1">
                Job ID: {job.id}
              </p>
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-2 text-sm">
                <ClockIcon className="h-4 w-4 text-base-content/70" />
                <span className="text-base-content/70">
                  시작: {formatDate(job.startTime as unknown as string)}
                </span>
              </div>
              {job.endTime && (
                <div className="flex items-center gap-2 text-sm mt-1">
                  <ClockIcon className="h-4 w-4 text-base-content/70" />
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
          </Card>
        ))}
      </div>
    </div>
  )
}
