import * as vscode from 'vscode';
import { ASTParser } from '../utils/AstParser';

export abstract class BaseHoverProvider implements vscode.HoverProvider {
    protected astParser: ASTParser;
    protected context: vscode.ExtensionContext;
    protected readonly debounceTime = 150; // Reduced from 250ms to 150ms
    private currentCancellationToken?: vscode.CancellationTokenSource;
    private timeoutId?: NodeJS.Timeout;

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
                // Cancel previous operation
                if (this.currentCancellationToken) {
                    this.currentCancellationToken.cancel();
                }
                if (this.timeoutId) {
                    clearTimeout(this.timeoutId);
                }

                // Create new cancellation token
                this.currentCancellationToken = new vscode.CancellationTokenSource();
                const token = this.currentCancellationToken.token;

                this.timeoutId = setTimeout(async () => {
                    if (token.isCancellationRequested) {
                        reject(new Error('Operation cancelled'));
                        return;
                    }

                    try {
                        const result = await fn(...args);
                        if (!token.isCancellationRequested) {
                            resolve(result);
                        }
                    } catch (error) {
                        reject(error);
                    }
                }, this.debounceTime);
            });
        };
    }
}