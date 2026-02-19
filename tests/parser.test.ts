import { describe, expect, test } from 'bun:test';
import { extractNodes, parseNode } from '../server/utils/parser';
import { Buffer } from 'node:buffer';

describe('Parser', () => {
  test('extractNodes should handle raw list', () => {
    const raw = `vmess://abc\nvless://def`;
    const nodes = extractNodes(raw);
    expect(nodes).toEqual(['vmess://abc', 'vless://def']);
  });

  test('extractNodes should handle base64', () => {
    const raw = `vmess://abc\nvless://def`;
    const b64 = Buffer.from(raw).toString('base64');
    const nodes = extractNodes(b64);
    expect(nodes).toEqual(['vmess://abc', 'vless://def']);
  });

  test('parseNode should parse vmess', () => {
    const vmess = {
      add: 'example.com',
      port: 443,
      id: 'uuid',
      net: 'ws'
    };
    const b64 = Buffer.from(JSON.stringify(vmess)).toString('base64');
    const uri = `vmess://${b64}`;
    const parsed = parseNode(uri);
    expect(parsed).toMatchObject({
      protocol: 'vmess',
      host: 'example.com',
      port: '443',
      id: 'uuid'
    });
  });
});
