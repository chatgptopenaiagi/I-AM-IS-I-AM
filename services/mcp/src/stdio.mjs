import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js';
import {createResearchServer} from './server.mjs';
try {
  const server = await createResearchServer();
  await server.connect(new StdioServerTransport());
} catch { process.stderr.write('TRIAD MCP startup failed. Check the fixed public atlas and local dependency build.\n'); process.exitCode=1; }
