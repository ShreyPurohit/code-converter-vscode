import * as vscode from 'vscode';
import { ASTParser } from '../utils/AstParser';

export abstract class BaseHoverProvider implements vscode.HoverProvider {
    protected astParser: ASTParser;
    protected context: vscode.ExtensionContext;
    protected readonly debounceTime = 100;
    private debounceMap = new Map<string, {
        timer: NodeJS.Timeout;
        token: vscode.CancellationTokenSource;
    }>();

    constructor(context: vscode.ExtensionContext) {
        this.astParser = new ASTParser();
        this.context = context;
    }

    abstract provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): Promise<vscode.Hover | null>;

    protected isConverterEnabled(): boolean {
        return this.context.globalState.get<boolean>('ternaryConverterEnabled', false);
    }

    protected createHoverContent(title: string, code: string, command: string): vscode.Hover {
        if (!this.isConverterEnabled()) {
            const enableMessage = new vscode.MarkdownString(
                '[Enable Converter](command:ternary-visualizer.toggleConverter)'
            );
            enableMessage.isTrusted = true;
            return new vscode.Hover([enableMessage]);
        }

        const codeBlock = new vscode.MarkdownString(`**${title}**\n\`\`\`typescript\n${code}\n\`\`\`\n`);
        const actionButtons = new vscode.MarkdownString(
            `[Copy To Clipboard](command:${command}?${encodeURIComponent(JSON.stringify(code))}) | ` +
            `[Disable Converter](command:ternary-visualizer.toggleConverter)`
        );
        actionButtons.isTrusted = true;

        return new vscode.Hover([codeBlock, actionButtons]);
    }

    protected debounce<T>(fn: (...args: any[]) => Promise<T>): (...args: any[]) => Promise<T> {
        return (...args: any[]) => {
            return new Promise((resolve, reject) => {
                const key = JSON.stringify(args);
                const existing = this.debounceMap.get(key);

                if (existing) {
                    existing.token.cancel();
                    clearTimeout(existing.timer);
                }

                const token = new vscode.CancellationTokenSource();
                const timer = setTimeout(async () => {
                    try {
                        if (!token.token.isCancellationRequested) {
                            const result = await fn(...args);
                            resolve(result);
                        }
                    } catch (error) {
                        reject(error);
                    } finally {
                        this.debounceMap.delete(key);
                    }
                }, this.debounceTime);

                this.debounceMap.set(key, { timer, token });
            });
        };
    }
}

/*
 * Copyright (c) 2025 Shrey Purohit.
 * This code is licensed under the MIT License.
 */