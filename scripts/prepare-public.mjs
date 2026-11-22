#!/usr/bin/env node
import { copyFile, mkdir } from 'node:fs/promises';

await mkdir('public/pim', { recursive: true });
await copyFile('data/snapshot.json', 'public/pim/snapshot.json');
console.log('public/pim/snapshot.json bijgewerkt vanuit data/snapshot.json');
