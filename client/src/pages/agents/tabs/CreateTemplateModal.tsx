import TextArea from '@/components/form/TextArea'
import TextField from '@/components/form/TextField'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import debounce from 'lodash/debounce'
import { useState } from 'react'

export interface TemplateFormData {
  name: string
  description: string
  content: string
  variables: string[]
  isValid: boolean
  validationError: string
}

interface CreateTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (formData: TemplateFormData) => void
}

export function CreateTemplateModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateTemplateModalProps) {
  const [templateFormData, setTemplateFormData] = useState<TemplateFormData>({
    name: '',
    description: '',
    content: '',
    variables: [],
    isValid: true,
    validationError: '',
  })

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
    } catch {
      return {
        isValid: false,
        error: '템플릿 구문 분석 중 오류가 발생했습니다.',
        variables: [],
      }
    }
  }

  // 디바운스된 템플릿 내용 변경 핸들러
  const debouncedValidateTemplate = debounce((content: string) => {
    const { isValid, error, variables } = validateTemplate(content)
    setTemplateFormData((prev) => ({
      ...prev,
      isValid,
      validationError: error,
      variables,
    }))
  }, 500)

  const handleCreateTemplate = () => {
    if (!templateFormData.isValid) {
      return // 유효하지 않은 템플릿은 생성하지 않음
    }

    onSubmit(templateFormData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>새 프롬프트 템플릿 등록</DialogTitle>
          <DialogDescription>
            프롬프트 템플릿을 등록하여 작업 노드에서 사용할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <TextField
            fieldId="name"
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
            fieldId="description"
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
            fieldId="content"
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

          {!templateFormData.isValid && templateFormData.validationError && (
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

        <div className="flex justify-end gap-2">
          <Button
            className="cursor-pointer"
            variant="outline"
            onClick={onClose}
          >
            취소
          </Button>
          <Button
            className="cursor-pointer"
            variant="default"
            onClick={handleCreateTemplate}
            disabled={
              !templateFormData.name ||
              !templateFormData.content ||
              !templateFormData.isValid
            }
          >
            생성
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
