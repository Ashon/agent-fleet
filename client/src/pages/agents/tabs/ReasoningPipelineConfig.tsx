import Select from '@/components/form/Select'
import TextArea from '@/components/form/TextArea'
import TextField from '@/components/form/TextField'
import { api } from '@/services/api'
import {
  PipelineNode,
  PromptNodeConfig,
  PromptTemplate,
} from '@agentfleet/types'
import debounce from 'lodash/debounce'
import { useCallback, useEffect, useState } from 'react'

interface ReasoningPipelineConfigProps {
  selectedNode: PipelineNode | null
  pipelineId: string
}

interface TemplateFormData {
  name: string
  description: string
  content: string
  variables: string[]
  isValid: boolean
  validationError: string
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
  const [templateFormData, setTemplateFormData] = useState<TemplateFormData>({
    name: '',
    description: '',
    content: '',
    variables: [],
    isValid: true,
    validationError: '',
  })
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

  const handleCreateTemplate = async () => {
    if (!templateFormData.isValid) {
      return // 유효하지 않은 템플릿은 생성하지 않음
    }

    try {
      const newTemplate = await api.createPromptTemplate({
        name: templateFormData.name,
        description: templateFormData.description,
        content: templateFormData.content,
        variables: templateFormData.variables,
      })
      setTemplates([...templates, newTemplate])
      setSelectedTemplate(newTemplate)
      setConfig({
        ...config,
        templateId: newTemplate.id,
      })
      setIsTemplateModalOpen(false)
      setTemplateFormData({
        name: '',
        description: '',
        content: '',
        variables: [],
        isValid: true,
        validationError: '',
      })
    } catch (error) {
      console.error('Failed to create template:', error)
    }
  }

  // 템플릿 유효성 검증 함수
  const validateTemplate = (
    content: string,
  ): { isValid: boolean; error: string; variables: string[] } => {
    if (!content.trim()) {
      return {
        isValid: false,
        error: '프롬프트 내용을 입력해주세요.',
        variables: [],
      }
    }

    try {
      // 변수 추출
      const variables = Array.from(content.matchAll(/{{(\w+)}}/g)).map(
        (m) => m[1],
      )

      // 중괄호 쌍 검사
      const openBraces = (content.match(/{{/g) || []).length
      const closeBraces = (content.match(/}}/g) || []).length

      if (openBraces !== closeBraces) {
        return {
          isValid: false,
          error:
            '중괄호 쌍이 맞지 않습니다. 모든 {{ 에 대응하는 }} 가 있는지 확인해주세요.',
          variables: Array.from(new Set(variables)),
        }
      }

      // 중첩된 중괄호 검사
      if (content.includes('{{{{') || content.includes('}}}}')) {
        return {
          isValid: false,
          error:
            '중첩된 중괄호가 있습니다. {{ 와 }} 사이에 다른 중괄호가 없어야 합니다.',
          variables: Array.from(new Set(variables)),
        }
      }

      return {
        isValid: true,
        error: '',
        variables: Array.from(new Set(variables)),
      }
    } catch (error) {
      return {
        isValid: false,
        error: '템플릿 구문 분석 중 오류가 발생했습니다.',
        variables: [],
      }
    }
  }

  // 디바운스된 템플릿 내용 변경 핸들러
  const debouncedValidateTemplate = useCallback(
    debounce((content: string) => {
      const { isValid, error, variables } = validateTemplate(content)
      setTemplateFormData((prev) => ({
        ...prev,
        isValid,
        validationError: error,
        variables,
      }))
    }, 500),
    [],
  )

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
    <div className="h-full pt-2 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">프롬프트 노드 설정</h3>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <span className="text-sm text-warning">
              * 저장되지 않은 변경사항이 있습니다
            </span>
          )}
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setIsTemplateModalOpen(true)}
          >
            템플릿 추가
          </button>
          <button
            className={`btn btn-primary btn-sm ${isSaving ? 'loading' : ''}`}
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <Select
          label="프롬프트 템플릿"
          required
          options={templates.map((template) => ({
            value: template.id,
            label: template.name,
          }))}
          value={config.templateId}
          onChange={(e) => {
            const templateId = e.target.value
            const template = templates.find(
              (t: PromptTemplate) => t.id === templateId,
            )
            setSelectedTemplate(template || null)
            handleConfigChange({ templateId })
          }}
        />

        {selectedTemplate && (
          <>
            <div className="p-4 bg-base-200 rounded-lg">
              <h4 className="font-medium mb-2">템플릿 정보</h4>
              <p className="text-sm text-base-content/70 mb-2">
                {selectedTemplate.description}
              </p>
              <div className="space-y-2">
                <h5 className="text-sm font-medium">필요한 변수:</h5>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.variables.map((variable) => (
                    <span key={variable} className="badge badge-primary">
                      {variable}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <TextArea
              label="프롬프트 내용"
              value={selectedTemplate.content}
              readOnly
              className="font-mono text-sm"
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
              />

              <TextField
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
          </>
        )}
      </div>

      {/* 템플릿 등록 모달 */}
      {isTemplateModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">새 프롬프트 템플릿 등록</h3>

            <div className="space-y-4">
              <TextField
                label="템플릿 이름"
                required
                value={templateFormData.name}
                onChange={(e) =>
                  setTemplateFormData({
                    ...templateFormData,
                    name: e.target.value,
                  })
                }
              />

              <TextArea
                label="설명"
                required
                value={templateFormData.description}
                onChange={(e) =>
                  setTemplateFormData({
                    ...templateFormData,
                    description: e.target.value,
                  })
                }
              />

              <TextArea
                label="프롬프트 내용"
                required
                className="font-mono"
                placeholder="변수는 {{변수명}} 형식으로 입력하세요"
                value={templateFormData.content}
                onChange={(e) => {
                  const content = e.target.value
                  // 즉시 내용 업데이트
                  setTemplateFormData((prev) => ({
                    ...prev,
                    content,
                  }))
                  // 디바운스된 유효성 검증 실행
                  debouncedValidateTemplate(content)
                }}
              />

              {!templateFormData.isValid &&
                templateFormData.validationError && (
                  <div className="text-red-500 text-sm mt-1">
                    {templateFormData.validationError}
                  </div>
                )}

              {templateFormData.variables.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">추출된 변수</h3>
                  <div className="flex flex-wrap gap-2">
                    {templateFormData.variables.map((variable) => (
                      <span
                        key={variable}
                        className="px-2 py-1 bg-base-200 rounded-md text-sm"
                      >
                        {variable}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => setIsTemplateModalOpen(false)}
              >
                취소
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreateTemplate}
                disabled={
                  !templateFormData.name ||
                  !templateFormData.content ||
                  !templateFormData.isValid
                }
              >
                생성
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
