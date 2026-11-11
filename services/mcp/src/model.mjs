import {readFile, stat} from 'node:fs/promises';
import {makeResearchModel} from '../../../WEB/qfp-lab/js/research-interface.js';

// Fixed public input only. Callers cannot supply a path or private corpus.
export const DATA_URL = new URL('../../../WEB/qfp-lab/data/research.json', import.meta.url);
export async function loadPublicModel() {
  if ((await stat(DATA_URL)).size > 2_000_000) throw new Error('Public atlas exceeds size limit');
  return makeResearchModel(JSON.parse(await readFile(DATA_URL, 'utf8')));
}
