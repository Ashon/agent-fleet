import Select from '@/components/form/Select'
import TextArea from '@/components/form/TextArea'
import TextField from '@/components/form/TextField'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { api } from '@/services/api'
import {
  PipelineNode,
  PromptNodeConfig,
  PromptTemplate,
} from '@agentfleet/types'
import { useEffect, useState } from 'react'
import { CreateTemplateModal, TemplateFormData } from './CreateTemplateModal'
interface ReasoningPipelineConfigProps {
  selectedNode?: PipelineNode
  pipelineId: string
}

export function ReasoningPipelineConfig({
  selectedNode,
  pipelineId,
}: ReasoningPipelineConfigProps) {
  const [templates, setTemplates] = useState<PromptTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] =
    useState<PromptTemplate | null>(null)
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const [config, setConfig] = useState<PromptNodeConfig>(
    (selectedNode?.data.config as PromptNodeConfig) || {
      templateId: '',
      variables: {},
      contextMapping: {
        input: [],
        output: [],
      },
      maxTokens: 1000,
      temperature: 0.7,
    },
  )

  useEffect(() => {
    if (selectedNode?.data.config) {
      setConfig(selectedNode.data.config as PromptNodeConfig)
    }
  }, [selectedNode])

  useEffect(() => {
    loadTemplates()
  }, [config.templateId])

  const loadTemplates = async () => {
    try {
      const templates = await api.getPromptTemplates()
      setTemplates(templates)

      if (config.templateId) {
        const template = templates.find(
          (t: PromptTemplate) => t.id === config.templateId,
        )
        setSelectedTemplate(template || null)
      }
    } catch (error) {
      console.error('Failed to load templates:', error)
    }
  }

  const handleConfigChange = (updates: Partial<PromptNodeConfig>) => {
    const newConfig = { ...config, ...updates }
    setConfig(newConfig)
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!selectedNode) return

    setIsSaving(true)
    try {
      // 노드 설정 업데이트
      await api.updateReasoningPipeline(pipelineId, {
        nodes: [
          {
            ...selectedNode,
            data: {
              ...selectedNode.data,
              config,
            },
          },
        ],
      })

      setHasChanges(false)
    } catch (error) {
      console.error('Failed to save node config:', error)
      // 에러 메시지 표시
      alert('설정 저장에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateTemplate = async (formData: TemplateFormData) => {
    if (!formData.isValid) {
      return // 유효하지 않은 템플릿은 생성하지 않음
    }

    try {
      console.log('templateFormData', formData)
      const newTemplate = await api.createPromptTemplate({
        name: formData.name,
        description: formData.description,
        content: formData.content,
        variables: formData.variables,
      })
      setTemplates([...templates, newTemplate])
      setSelectedTemplate(newTemplate)
      setConfig({
        ...config,
        templateId: newTemplate.id,
      })
      setIsTemplateModalOpen(false)
    } catch (error) {
      console.error('Failed to create template:', error)
    }
  }

  if (!selectedNode) {
    return (
      <div className="h-full pt-2">
        <div className="text-center text-gray-500">
          노드를 선택하여 설정을 구성하세요.
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-2 overflow-y-auto h-full">
      <div className="flex flex-col gap-6">
        <div>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">작업 노드 기본 설정</h3>
            <div>
              <Button
                size="sm"
                className={`btn btn-primary btn-sm ${isSaving ? 'loading' : ''}`}
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
              >
                {isSaving ? '저장 중...' : '저장'}
              </Button>
            </div>
          </div>
          {hasChanges && (
            <div className="text-sm text-gray-500">
              * 저장되지 않은 변경사항이 있습니다
            </div>
          )}
        </div>

        <TextField
          label="작업 이름"
          defaultValue={selectedNode.data.name}
          fieldId={`${selectedNode.id}-task-name`}
        />
        <TextField
          label="작업 설명"
          defaultValue={selectedNode.data.description}
          fieldId={selectedNode.id}
        />
      </div>
      <Separator className="my-4" />

      <div className="space-y-4">
        <div className="divider"></div>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold">프롬프트 템플릿 설정</h3>
          <Button
            className="cursor-pointer"
            size="sm"
            onClick={() => setIsTemplateModalOpen(true)}
          >
            템플릿 추가
          </Button>
        </div>

        <Select
          label="프롬프트 템플릿"
          required
          placeholder="템플릿 선택"
          options={templates.map((template) => ({
            value: template.id,
            label: template.name,
          }))}
          value={config.templateId}
          onChange={(value) => {
            const templateId = value
            const template = templates.find(
              (t: PromptTemplate) => t.id === templateId,
            )
            setSelectedTemplate(template || null)
            handleConfigChange({ templateId })
          }}
        />

        {selectedTemplate && (
          <div className="space-y-4">
            <div className="bg-base-200 rounded-lg">
              <h4 className="font-medium mb-2">템플릿 정보</h4>
              <p className="text-sm text-base-content/70 mb-2">
                {selectedTemplate.description}
              </p>
              <div className="space-y-2">
                <h5 className="text-sm font-medium">필요한 변수:</h5>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.variables.map((variable) => (
                    <Badge key={variable} variant="outline">
                      {variable}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <TextArea
              label="프롬프트 내용"
              value={selectedTemplate.content}
              readOnly
              className="font-mono text-sm"
              fieldId={selectedNode.id}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label="최대 토큰 수"
                type="number"
                min={1}
                max={4096}
                value={config.maxTokens}
                onChange={(e) =>
                  handleConfigChange({ maxTokens: parseInt(e.target.value) })
                }
                fieldId={`${selectedNode.id}-max-tokens`}
              />

              <TextField
                fieldId={`${selectedNode.id}-temperature`}
                label="Temperature"
                type="number"
                min={0}
                max={2}
                step={0.1}
                value={config.temperature}
                onChange={(e) =>
                  handleConfigChange({
                    temperature: parseFloat(e.target.value),
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">컨텍스트 매핑</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextArea
                  fieldId={selectedNode.id}
                  label="입력 필드"
                  placeholder="한 줄에 하나의 필드명을 입력하세요"
                  value={config.contextMapping.input.join('\n')}
                  onChange={(e) =>
                    handleConfigChange({
                      contextMapping: {
                        ...config.contextMapping,
                        input: e.target.value.split('\n').filter(Boolean),
                      },
                    })
                  }
                />

                <TextArea
                  fieldId={selectedNode.id}
                  label="출력 필드"
                  placeholder="한 줄에 하나의 필드명을 입력하세요"
                  value={config.contextMapping.output.join('\n')}
                  onChange={(e) =>
                    handleConfigChange({
                      contextMapping: {
                        ...config.contextMapping,
                        output: e.target.value.split('\n').filter(Boolean),
                      },
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">변수 매핑</h4>
              <div className="grid gap-4">
                {selectedTemplate.variables.map((variable) => (
                  <TextField
                    fieldId={`${selectedNode.id}-${variable}`}
                    key={variable}
                    label={variable}
                    value={config.variables[variable] || ''}
                    onChange={(e) =>
                      handleConfigChange({
                        variables: {
                          ...config.variables,
                          [variable]: e.target.value,
                        },
                      })
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 템플릿 등록 모달 */}
      <CreateTemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSubmit={(formData: TemplateFormData) =>
          handleCreateTemplate(formData)
        }
      />
    </div>
  )
}
