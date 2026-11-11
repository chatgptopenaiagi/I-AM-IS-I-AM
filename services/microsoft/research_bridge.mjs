// Private subprocess boundary. Never accepts paths, code, URLs, or shell arguments.
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { makeResearchModel, getResearchObject } from '../../WEB/qfp-lab/js/research-interface.js';

export async function getClaimContext(claimId) {
  if (typeof claimId !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,99}$/.test(claimId)) throw new Error('INVALID_CLAIM');
  const bytes = await readFile(new URL('../../WEB/qfp-lab/data/research.json', import.meta.url));
  if (bytes.length > 2_000_000) throw new Error('SOURCE_TOO_LARGE');
  const model = makeResearchModel(JSON.parse(bytes.toString('utf8')));
  const claim = getResearchObject(model, claimId);
  if (!claim) throw new Error('UNKNOWN_CLAIM');
  return {
    schema_version: model.schema_version,
    source_revision: model.source_revision,
    source_sha256: createHash('sha256').update(bytes).digest('hex'),
    claim,
    sources: model.sources.filter(source => claim.source_ids.includes(source.id)),
    computation_executed: false,
  };
}

let input = '';
try {
  for await (const chunk of process.stdin) {
    input += chunk.toString('utf8');
    if (Buffer.byteLength(input, 'utf8') > 4096) throw new Error('INVALID_REQUEST');
  }
  const request = JSON.parse(input);
  if (!request || Array.isArray(request) || Object.keys(request).sort().join(',') !== 'claim_id,operation' || request.operation !== 'get_claim') throw new Error('INVALID_REQUEST');
  const context = await getClaimContext(request.claim_id);
  process.stdout.write(JSON.stringify({status:'OK', ...context}));
} catch (error) {
  const safe = ['UNKNOWN_CLAIM', 'INVALID_CLAIM', 'SOURCE_TOO_LARGE', 'INVALID_REQUEST'].includes(error.message) ? error.message : 'SOURCE_UNAVAILABLE';
  process.stdout.write(JSON.stringify({status:safe}));
  process.exitCode = 1;
}
