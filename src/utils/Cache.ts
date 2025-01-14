import * as vscode from 'vscode';
import { File } from '@babel/types';

interface CacheEntry {
    ast: File;
    timestamp: number;
    documentVersion: number;
}

export class ASTCache {
    private static readonly CACHE_LIFETIME = 30000;
    private static readonly MAX_CACHE_SIZE = 5;
    private cache = new Map<string, CacheEntry>();

    set(uri: string, ast: File, document: vscode.TextDocument): void {
        if (this.cache.size >= ASTCache.MAX_CACHE_SIZE) {
            const oldestKey = Array.from(this.cache.entries())
                .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0][0];
            this.cache.delete(oldestKey);
        }

        this.cache.set(uri, {
            ast,
            timestamp: Date.now(),
            documentVersion: document.version
        });
    }

    get(uri: string, document: vscode.TextDocument): File | null {
        const entry = this.cache.get(uri);
        if (!entry) { return null; }

        const isExpired = Date.now() - entry.timestamp > ASTCache.CACHE_LIFETIME;
        const isStale = document.version !== entry.documentVersion;

        if (isExpired || isStale) {
            this.cache.delete(uri);
            return null;
        }

        entry.timestamp = Date.now();
        return entry.ast;
    }

    clear(): void {
        this.cache.clear();
    }
}