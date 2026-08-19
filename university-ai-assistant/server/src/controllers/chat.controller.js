import { supabaseAdmin } from '../config/supabase.js';
import { retrieveContext } from '../services/rag.service.js';
import { generateAnswer, streamAnswer } from '../services/gemini.service.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';

/**
 * POST /api/chat
 * Auth required (verifyUser). Supports two modes:
 *   - Standard JSON response (default)
 *   - Server-Sent Events streaming when `?stream=true` is passed
 *
 * Pipeline: verify user -> save question -> embed query -> hybrid
 * search -> re-rank -> build context -> generate answer -> log ->
 * return answer + citations.
 */
export const chat = asyncHandler(async (req, res) => {
  if (!req.student) {
    throw new AppError(
      'Onboarding required: complete your academic profile before chatting.',
      403
    );
  }

  const { question, courseId, topK } = req.body;
  const isStreaming = req.query.stream === 'true';

  // 1 & 2: log the incoming question immediately.
  const { data: logRow, error: logError } = await supabaseAdmin
    .from('chat_logs')
    .insert({ student_id: req.student.id, question, course_id: courseId || null })
    .select('id')
    .single();

  if (logError) throw logError;

  // 3-6: embed, hybrid search, re-rank, build context.
  const contextChunks = await retrieveContext(question, { topK, courseId });

  const citations = contextChunks.map((c) => ({
    file_name: c.file_name,
    snippet: c.content.slice(0, 240) + (c.content.length > 240 ? '…' : ''),
  }));

  if (isStreaming) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    let fullAnswer = '';
    try {
      for await (const delta of streamAnswer(question, contextChunks)) {
        fullAnswer += delta;
        res.write(`data: ${JSON.stringify({ type: 'delta', text: delta })}\n\n`);
      }
      res.write(
        `data: ${JSON.stringify({ type: 'done', citations, logId: logRow.id })}\n\n`
      );
    } catch (err) {
      res.write(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`);
    } finally {
      res.end();
    }

    await supabaseAdmin.from('chat_logs').update({ answer: fullAnswer }).eq('id', logRow.id);
    return;
  }

  // Non-streaming path.
  const answer = await generateAnswer(question, contextChunks);

  await supabaseAdmin.from('chat_logs').update({ answer }).eq('id', logRow.id);

  res.json({
    success: true,
    answer,
    citations,
    logId: logRow.id,
  });
});
