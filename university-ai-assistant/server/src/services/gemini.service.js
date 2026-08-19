import { chatModel } from '../config/gemini.js';

const SYSTEM_PROMPT = `You are an expert academic professor in computer science.
Prioritize the provided course materials.
Explain clearly, deeply, and pedagogically.
Do not hallucinate.
If the answer is not found in the provided context, say so honestly.
Always relate answers to the curriculum.
Provide examples when possible.
Respond in the same language the student asked in (Arabic or English).`;

/**
 * buildPrompt
 * -----------
 * Assembles the final prompt sent to Gemini, combining the system
 * instructions, retrieved course context, and the student's question.
 */
function buildPrompt(question, contextChunks) {
  const context = contextChunks
    .map(
      (c, i) =>
        `[Source ${i + 1} — ${c.file_name}]\n${c.content}`
    )
    .join('\n\n---\n\n');

  return `${SYSTEM_PROMPT}

===== COURSE MATERIAL CONTEXT =====
${context || 'No relevant course material was found for this question.'}
===== END CONTEXT =====

Student question: ${question}

Answer as the academic professor described above. After your answer, do not
repeat the sources — citations are handled separately by the application.`;
}

/**
 * generateAnswer
 * --------------
 * Non-streaming generation — returns the full answer text at once.
 */
export async function generateAnswer(question, contextChunks) {
  const prompt = buildPrompt(question, contextChunks);
  const result = await chatModel.generateContent(prompt);
  return result.response.text();
}

/**
 * streamAnswer
 * ------------
 * Streaming generation — yields text deltas as they arrive from
 * Gemini, used by the /api/chat SSE endpoint.
 */
export async function* streamAnswer(question, contextChunks) {
  const prompt = buildPrompt(question, contextChunks);
  const result = await chatModel.generateContentStream(prompt);

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) yield text;
  }
}
