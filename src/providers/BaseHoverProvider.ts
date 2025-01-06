import * as vscode from 'vscode';
import { ASTParser } from '../utils/AstParser';

export abstract class BaseHoverProvider implements vscode.HoverProvider {
    protected astParser: ASTParser;
    protected context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.astParser = new ASTParser();
        this.context = context;
    }

    abstract provideHover(
        document: vscode.TextDocument,
        position: vscode.Position
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
}