import { supabase } from '../config/supabaseConfig';

const ANTHROPIC_API_KEY = (process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY || '').trim();
const CLAUDE_MODEL = 'claude-3-5-sonnet-20241022';
const API_URL = 'https://api.anthropic.com/v1/messages';

class ClaudeAiService {
  constructor() {
    this.isOnline = ANTHROPIC_API_KEY.length > 0;
  }

  async generateResponse(query, context = {}) {
    const startTime = Date.now();
    let response;
    let usedRealAPI = false;

    try {
      if (this.isOnline) {
        response = await this._callClaudeAPI(query, context);
        usedRealAPI = true;
      } else {
        response = this._smartLocalResponse(query, context);
      }
    } catch (error) {
      console.error('[Claude AI] API call failed — falling back to local:', error.message);
      response = this._smartLocalResponse(query, context);
    }

    if (!response || typeof response !== 'string' || response.trim() === '') {
      response = this._smartLocalResponse(query, context);
    }

    const currentUid = await this._getCurrentUserId();
    if (currentUid && query && response) {
      this.logInteraction(currentUid, query, response, context, Date.now() - startTime, usedRealAPI).catch(() => {});
    }

    return response;
  }

  async summarise(text, maxLength = 150) {
    const query = `Please summarise the following in about ${maxLength} words, using bullet points where appropriate:\n\n${text}`;
    return this.generateResponse(query, { userType: 'student' });
  }

  async generateQuiz(topic, count = 5, options = {}) {
    const difficulty = options.difficulty || 'medium';
    const type = options.type || 'multiple choice';
    const query = `Generate ${count} ${difficulty} ${type} quiz questions about: "${topic}".`;
    return this.generateResponse(query, { userType: 'student', ...options });
  }

  async giveFeedback(text, options = {}) {
    const query = `As an academic assessor, provide constructive feedback on this student submission:\n\n${text}`;
    return this.generateResponse(query, { userType: 'lecturer', ...options });
  }

  async explainConcept(concept, academicLevel = '200') {
    const query = `Explain "${concept}" at level ${academicLevel} for a CS student.`;
    return this.generateResponse(query, { userType: 'student', academicLevel });
  }

  async buildStudyPlan(params) {
    const query = `Create a study plan based on parameters: ${JSON.stringify(params)}`;
    return this.generateResponse(query, { userType: 'student' });
  }

  async _callClaudeAPI(query, context) {
    const systemPrompt = this._buildSystemPrompt(context);
    const messages = [
      ...(context.conversationHistory || []),
      { role: 'user', content: query },
    ];

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 1024,
        system: systemPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error ${response.status}`);
    }

    const data = await response.json();
    return data?.content?.[0]?.text;
  }

  _buildSystemPrompt(context) {
    const { userType = 'student', userName } = context;
    if (userType === 'lecturer') {
      return `You are an AI teaching assistant for UniConnect, helping ${userName || 'a lecturer'}.`;
    }
    return `You are an AI academic tutor for UniConnect, helping ${userName || 'a student'}.`;
  }

  _smartLocalResponse(query, context) {
    return `Great question! Here is academic assistance regarding your query: "${query}".`;
  }

  async logInteraction(userId, query, response, context = {}, latencyMs = 0, usedRealAPI = false) {
    try {
      await supabase.from('ai_interactions').insert([{
        user_id: userId,
        query: String(query).substring(0, 500),
        response_length: String(response || '').length,
        used_api: usedRealAPI,
        latency_ms: latencyMs,
        created_at: new Date().toISOString(),
      }]);
    } catch (error) {
      console.warn('[AI] Interaction logging failed:', error.message);
    }
  }

  async _getCurrentUserId() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id || null;
    } catch {
      return null;
    }
  }
}

export default new ClaudeAiService();
