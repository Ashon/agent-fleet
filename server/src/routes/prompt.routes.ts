import {
  CreatePromptTemplateDto,
  UpdatePromptTemplateDto,
} from '@agentfleet/types'
import { Router } from 'express'
import { PromptService } from '../services/prompt.service'

export function createPromptRouter(promptService: PromptService): Router {
  const router = Router()

  // 프롬프트 템플릿 생성
  router.post('/templates', async (req, res, next) => {
    try {
      const dto: CreatePromptTemplateDto = req.body
      const template = await promptService.createTemplate(dto)
      res.status(201).json(template)
    } catch (error) {
      next(error)
    }
  })

  // 모든 템플릿 조회
  router.get('/templates', async (req, res, next) => {
    try {
      const templates = await promptService.getAllTemplates()
      res.json(templates)
    } catch (error) {
      next(error)
    }
  })

  // 특정 템플릿 조회
  router.get('/templates/:id', async (req, res, next) => {
    try {
      const template = await promptService.getTemplate(req.params.id)
      res.json(template)
    } catch (error) {
      next(error)
    }
  })

  // 템플릿 수정
  router.put('/templates/:id', async (req, res, next) => {
    try {
      const dto: UpdatePromptTemplateDto = req.body
      const template = await promptService.updateTemplate(req.params.id, dto)
      res.json(template)
    } catch (error) {
      next(error)
    }
  })

  // 템플릿 삭제
  router.delete('/templates/:id', async (req, res, next) => {
    try {
      await promptService.deleteTemplate(req.params.id)
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  })

  // 프롬프트 렌더링
  router.post('/templates/:id/render', async (req, res, next) => {
    try {
      const variables: Record<string, string> = req.body.variables
      const rendered = await promptService.renderPrompt(
        req.params.id,
        variables,
      )
      res.json({ rendered })
    } catch (error) {
      next(error)
    }
  })

  return router
}
