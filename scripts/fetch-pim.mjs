#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const MCP_URL = process.env.PIM_MCP_URL || 'REDACTED-PIM-MCP-URL';
const TOKEN = process.env.PIM_MCP_TOKEN;
const PROJECT_ID = Number(process.env.PIM_PROJECT_ID || 1409);
const OUT_FILE = path.join(process.cwd(), 'data', 'snapshot.json');

if (!TOKEN) {
  console.error('PIM_MCP_TOKEN ontbreekt. Kopieer .env.example naar .env.local en vul de token in.');
  process.exit(1);
}

let sessionId = null;
let reqId = 0;

async function rpc(method, params, { notification = false } = {}) {
  reqId += 1;
  const payload = { jsonrpc: '2.0', method };
  if (!notification) payload.id = reqId;
  if (params) payload.params = params;

  const res = await fetch(MCP_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json, text/event-stream',
      authorization: `Bearer ${TOKEN}`,
      ...(sessionId ? { 'mcp-session-id': sessionId } : {}),
    },
    body: JSON.stringify(payload),
  });

  const sid = res.headers.get('mcp-session-id');
  if (sid) sessionId = sid;
  if (!res.ok) {
    throw new Error(`MCP HTTP ${res.status}: ${(await res.text()).slice(0, 500)}`);
  }

  const text = await res.text();
  if (!text.trim()) return null;
  const dataLines = text
    .split('\n')
    .filter((l) => l.startsWith('data:'))
    .map((l) => l.slice(5).trim());
  return JSON.parse(dataLines.join('\n') || text);
}

async function callTool(name, args = {}) {
  const res = await rpc('tools/call', { name, arguments: args });
  if (res.error) throw new Error(`MCP error bij ${name}: ${JSON.stringify(res.error)}`);
  const text = (res.result?.content || [])
    .filter((c) => c.type === 'text')
    .map((c) => c.text)
    .join('\n');
  return JSON.parse(text);
}

async function main() {
  await rpc('initialize', {
    protocolVersion: '2025-06-18',
    capabilities: {},
    clientInfo: { name: 'pim-ssg-fetch', version: '1.0.0' },
  });
  await rpc('notifications/initialized', undefined, { notification: true });

  const summary = await callTool('list_projects_summary');
  const found = summary.find((p) => p.id === PROJECT_ID);
  if (!found) throw new Error(`Project ${PROJECT_ID} niet gevonden in PIM (${summary.length} projecten)`);

  const project = await callTool('get_project', { project_id: PROJECT_ID });
  const housetypeList = (await callTool('list_housetypes', { project_id: PROJECT_ID })) || [];
  const housetypes = [];
  for (const ht of housetypeList) {
    housetypes.push(await callTool('get_housetype', { project_id: PROJECT_ID, housetype_id: ht.id }));
  }
  const houses = (await callTool('list_houses', { project_id: PROJECT_ID })) || [];

  const snapshot = {
    meta: {
      fetchedAt: new Date().toISOString(),
      mcpUrl: MCP_URL,
      projectId: PROJECT_ID,
      projectName: project.name,
    },
    project,
    housetypes,
    houses,
  };

  await mkdir(path.dirname(OUT_FILE), { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify(snapshot, null, 2) + '\n');
  console.log(
    `Snapshot geschreven naar ${OUT_FILE}: ${project.name} (${housetypes.length} woningtypes, ` +
      `${Array.isArray(houses) ? houses.length : 0} woningen)`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
