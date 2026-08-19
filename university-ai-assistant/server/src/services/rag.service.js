import { supabaseAdmin } from '../config/supabase.js';
import { embedText } from './embedding.service.js';

const DEFAULT_TOP_K = Number(process.env.TOP_K) || 5;

/**
 * vectorSearch
 * ------------
 * Calls the `match_documents` Postgres function (pgvector cosine
 * similarity search) via Supabase RPC.
 */
async function vectorSearch(queryEmbedding, topK, courseId) {
  const { data, error } = await supabaseAdmin.rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_count: topK,
    filter_course_id: courseId || null,
  });

  if (error) throw error;
  return data || [];
}

/**
 * keywordSearch
 * -------------
 * Simple keyword / full-text fallback search over the same
 * documents table, used to complement pure vector similarity
 * (hybrid retrieval) — useful for exact terms, acronyms, and code
 * identifiers that embeddings sometimes miss.
 */
async function keywordSearch(question, topK, courseId) {
  let query = supabaseAdmin
    .from('documents')
    .select('id, content, file_name, chunk_id, course_id')
    .textSearch('content', question.split(/\s+/).join(' | '), {
      type: 'websearch',
      config: 'english',
    })
    .limit(topK);

  if (courseId) query = query.eq('course_id', courseId);

  const { data, error } = await query;
  // textSearch can fail on languages/configs it doesn't support (e.g.
  // Arabic) — treat that as "no keyword matches" rather than a hard error.
  if (error) return [];
  return data || [];
}

/**
 * rerank
 * ------
 * Merges vector + keyword results, de-duplicates by id, and sorts
 * by similarity score (keyword-only hits are given a modest fixed
 * score so they still surface but don't outrank strong vector hits).
 */
function rerank(vectorResults, keywordResults, topK) {
  const merged = new Map();

  for (const doc of vectorResults) {
    merged.set(doc.id, { ...doc, score: doc.similarity ?? 0 });
  }

  for (const doc of keywordResults) {
    if (merged.has(doc.id)) {
      merged.get(doc.id).score += 0.1; // small boost for hybrid agreement
    } else {
      merged.set(doc.id, { ...doc, score: 0.5 });
    }
  }

  return Array.from(merged.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

/**
 * retrieveContext
 * ----------------
 * Full retrieval pipeline: embed the query, run hybrid (vector +
 * keyword) search, re-rank, and return the top-k chunks used to
 * build the LLM context.
 */
export async function retrieveContext(question, { topK = DEFAULT_TOP_K, courseId = null } = {}) {
  const queryEmbedding = await embedText(question);

  const [vectorResults, keywordResults] = await Promise.all([
    vectorSearch(queryEmbedding, topK, courseId),
    keywordSearch(question, topK, courseId),
  ]);

  return rerank(vectorResults, keywordResults, topK);
}
