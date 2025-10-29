import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@sillytavern-clone/database'
import { AIModelConfig } from '@sillytavern-clone/shared'

const testSchema = z.object({
  testMessage: z.string().min(1).max(500).default('Hello! Can you respond with a simple greeting?'),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(1000).default(100),
  // Optional overrides
  provider: z.enum(['openai', 'anthropic', 'google']).optional(),
  model: z.string().optional(),
  apiKey: z.string().optional(),
  baseUrl: z.string().url().optional(),
  settings: z.record(z.any()).optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const validatedData = testSchema.parse(body)

    // Get model configuration
    const model = await db.findFirst('AIModelConfig', {
      where: { id }
    })

    if (!model) {
      return NextResponse.json(
        { error: 'AI model not found' },
        { status: 404 }
      )
    }

    // Merge overrides (if provided) into the loaded model
    const parsedModel = {
      ...model,
      provider: (validatedData.provider || model.provider) as any,
      model: validatedData.model || model.model,
      apiKey: validatedData.apiKey || model.apiKey,
      baseUrl: validatedData.baseUrl || model.baseUrl,
      settings: {
        ...(model.settings ? JSON.parse(model.settings as string) : {}),
        ...(validatedData.settings || {}),
      },
    }

    // Test the model by making a simple API call
    const testResult = await testAIModel(parsedModel, validatedData)

    return NextResponse.json({
      success: testResult.success,
      response: testResult.response,
      latency: testResult.latency,
      error: testResult.error,
      usage: testResult.usage,
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          code: 'VALIDATION_ERROR',
          details: error.errors
        },
        { status: 400 }
      )
    }

    console.error('Error testing AI model:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        response: null,
        latency: 0
      },
      { status: 500 }
    )
  }
}

async function testAIModel(model: AIModelConfig, testData: any) {
  const startTime = Date.now()

  try {
    let response
    let usage = null

    switch (model.provider) {
      case 'openai':
        const openaiResult = await testOpenAIModel(model, testData)
        response = openaiResult.response
        usage = openaiResult.usage
        break

      case 'anthropic':
        const anthropicResult = await testAnthropicModel(model, testData)
        response = anthropicResult.response
        usage = anthropicResult.usage
        break

      case 'google':
        const googleResult = await testGoogleModel(model, testData)
        response = googleResult.response
        usage = googleResult.usage
        break

      case 'local':
        const localResult = await testLocalModel(model, testData)
        response = localResult.response
        usage = localResult.usage
        break

      default:
        throw new Error(`Unsupported provider: ${model.provider}`)
    }

    const latency = Date.now() - startTime

    return {
      success: true,
      response,
      latency,
      usage,
      error: null
    }

  } catch (error) {
    const latency = Date.now() - startTime

    return {
      success: false,
      response: null,
      latency,
      usage: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function testOpenAIModel(model: AIModelConfig, testData: any) {
  const baseUrl = model.baseUrl || process.env.OPENAI_API_BASE_URL || 'https://api.openai.com/v1'

  const requestBody = {
    model: model.model,
    messages: [
      {
        role: 'user',
        content: testData.testMessage
      }
    ],
    temperature: testData.temperature ?? model.settings?.temperature ?? 0.7,
    max_tokens: testData.maxTokens ?? model.settings?.maxTokens ?? 100,
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${model.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()

  return {
    response: data.choices[0]?.message?.content || 'No response generated',
    usage: data.usage
  }
}

async function testAnthropicModel(model: AIModelConfig, testData: any) {
  const baseUrl = model.baseUrl || process.env.ANTHROPIC_API_BASE_URL || 'https://api.anthropic.com'

  const requestBody = {
    model: model.model,
    max_tokens: testData.maxTokens ?? model.settings?.maxTokens ?? 100,
    temperature: testData.temperature ?? model.settings?.temperature ?? 0.7,
    messages: [
      {
        role: 'user',
        content: testData.testMessage
      }
    ]
  }

  const response = await fetch(`${baseUrl}/v1/messages`, {
    method: 'POST',
    headers: {
      'x-api-key': model.apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()

  return {
    response: data.content?.[0]?.text || 'No response generated',
    usage: data.usage
  }
}

async function testGoogleModel(model: AIModelConfig, testData: any) {
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    const client = new GoogleGenerativeAI(model.apiKey as string)
    const genModel = client.getGenerativeModel({ 
      model: model.model,
      generationConfig: {
        temperature: testData.temperature ?? model.settings?.temperature ?? 0.7,
        maxOutputTokens: testData.maxTokens ?? model.settings?.maxTokens ?? 100,
      },
    })

    const result: any = await genModel.generateContent(testData.testMessage)
    const response: any = result.response
    
    return {
      response: response.text(),
      usage: response.usageMetadata ? {
        promptTokens: response.usageMetadata.promptTokenCount || 0,
        completionTokens: response.usageMetadata.candidatesTokenCount || 0,
        totalTokens: response.usageMetadata.totalTokenCount || 0,
      } : null
    }
  } catch (error) {
    throw new Error(`Google AI test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

async function testLocalModel(model: AIModelConfig, testData: any) {
  try {
    // Most local models follow OpenAI-compatible API format
    const baseUrl = model.baseUrl || process.env.LOCAL_AI_BASE_URL || 'http://localhost:8080/v1'
    
    const requestBody = {
      model: model.model,
      messages: [
        {
          role: 'user',
          content: testData.testMessage
        }
      ],
      temperature: testData.temperature ?? model.settings?.temperature ?? 0.7,
      max_tokens: testData.maxTokens ?? model.settings?.maxTokens ?? 100,
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Some local models may require an API key, others don't
        ...(model.apiKey ? { 'Authorization': `Bearer ${model.apiKey}` } : {})
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Local model API error: ${response.status} ${response.statusText}. ${errorText}`)
    }

    const data = await response.json()

    return {
      response: data.choices?.[0]?.message?.content || 'No response generated',
      usage: data.usage
    }
  } catch (error) {
    throw new Error(`Local model test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}