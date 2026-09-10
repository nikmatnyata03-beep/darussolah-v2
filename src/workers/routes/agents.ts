import { Hono } from 'hono';
import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import type { Env } from '../../types/cloudflare';

export const agentRoutes = new Hono<{ Bindings: Env }>();

// POST /api/agents/chat - AI Chat endpoint
agentRoutes.post('/chat', async (c) => {
  try {
    const { messages, model = '@cf/meta/llama-3.1-8b-instruct' } = await c.req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return c.json({ error: 'Messages array is required' }, 400);
    }
    
    // Use Cloudflare AI binding
    const aiResponse = await c.env.AI.run(model, {
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      }))
    });
    
    return c.json({
      response: aiResponse.result?.response || aiResponse.result,
      model: model,
      success: true
    });
    
  } catch (error: any) {
    console.error('AI chat error:', error);
    return c.json({
      error: 'AI processing failed',
      message: error.message
    }, 500);
  }
});

// POST /api/agents/stream - Streaming AI response
agentRoutes.post('/stream', async (c) => {
  try {
    const { prompt, systemPrompt } = await c.req.json();
    
    if (!prompt) {
      return c.json({ error: 'Prompt is required' }, 400);
    }
    
    // Use Cloudflare Workers AI with streaming
    const stream = await c.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        { role: 'user', content: prompt }
      ],
      stream: true
    });
    
    // Return streaming response
    return new Response(stream as any, {
      headers: {
        'Content-Type': 'text/plain',
        'X-Model': '@cf/meta/llama-3.1-8b-instruct'
      }
    });
    
  } catch (error: any) {
    console.error('AI stream error:', error);
    return c.json({
      error: 'AI streaming failed',
      message: error.message
    }, 500);
  }
});

// POST /api/agents/analyze - AI analysis endpoint
agentRoutes.post('/analyze', async (c) => {
  try {
    const { data, task } = await c.req.json();
    
    if (!data || !task) {
      return c.json({ error: 'Data and task are required' }, 400);
    }
    
    const prompt = `Analyze the following data for ${task}:\n\n${JSON.stringify(data, null, 2)}`;
    
    const aiResponse = await c.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: 'system', content: 'You are a helpful data analyst assistant.' },
        { role: 'user', content: prompt }
      ]
    });
    
    return c.json({
      analysis: aiResponse.result?.response || aiResponse.result,
      task: task,
      success: true
    });
    
  } catch (error: any) {
    console.error('AI analysis error:', error);
    return c.json({
      error: 'AI analysis failed',
      message: error.message
    }, 500);
  }
});

// GET /api/agents/models - List available AI models
agentRoutes.get('/models', async (c) => {
  const models = [
    { id: '@cf/meta/llama-3.1-8b-instruct', name: 'Llama 3.1 8B', type: 'text-generation' },
    { id: '@cf/meta/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', type: 'text-generation' },
    { id: '@cf/mistral/mistral-7b-instruct-v0.1', name: 'Mistral 7B', type: 'text-generation' },
    { id: '@cf/huggingface/distilbert-sst-2-int8', name: 'DistilBERT', type: 'text-classification' },
    { id: '@cf/unum/uform-gen2-qwen-500m', name: 'UForm Qwen', type: 'image-captioning' }
  ];
  
  return c.json({ models });
});
