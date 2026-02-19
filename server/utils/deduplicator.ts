import { isInformationalNode, parseNode } from './parser';

interface NodeItem {
    uri: string;
    priority: number; // Higher is better
    source?: string;
}

export const deduplicateNodes = (nodes: NodeItem[]): string[] => {
    // Sort by priority descending
    // This ensures User nodes (high priority) are processed before Global (low priority)
    // If duplicates exist, the first one encountered (higher priority) is kept.
    nodes.sort((a, b) => b.priority - a.priority);

    const seenFingerprints = new Set<string>();
    const seenRaw = new Set<string>();
    const result: string[] = [];

    for (const node of nodes) {
        // If raw string is exact duplicate, skip immediately
        if (seenRaw.has(node.uri)) continue;

        const fp = parseNode(node.uri);

        if (fp) {
             // Create stable fingerprint
             // protocol|host|port|id|path|sni
             const key = `${fp.protocol}|${fp.host}|${fp.port}|${fp.id}|${fp.path || ''}|${fp.sni || ''}`.toLowerCase();

             if (!seenFingerprints.has(key)) {
                 seenFingerprints.add(key);
                 seenRaw.add(node.uri);
                 result.push(node.uri);
             }
        } else {
            // Cannot parse fingerprint -> treat as unique by content
            seenRaw.add(node.uri);
            result.push(node.uri);
        }
    }

    const informational: string[] = [];
    const regular: string[] = [];

    for (const uri of result) {
        if (isInformationalNode(uri)) {
            informational.push(uri);
        } else {
            regular.push(uri);
        }
    }

    // Keep informational/time-summary entries at top while preserving relative order.
    return [...informational, ...regular];
}
