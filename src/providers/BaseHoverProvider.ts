import * as vscode from 'vscode';
import { ASTParser } from '../utils/AstParser';

export abstract class BaseHoverProvider implements vscode.HoverProvider {
    protected astParser: ASTParser;

    constructor() {
        this.astParser = new ASTParser();
    }

    abstract provideHover(
        document: vscode.TextDocument,
        position: vscode.Position
    ): Promise<vscode.Hover | null>;

    protected createHoverContent(title: string, code: string, command: string): vscode.Hover {
        const codeBlock = new vscode.MarkdownString(`**${title}**\n\`\`\`typescript\n${code}\n\`\`\`\n`);

        const copyButton = new vscode.MarkdownString(
            `[Copy To Clipboard](command:${command}?${encodeURIComponent(JSON.stringify(code))})`
        );
        copyButton.isTrusted = true;

        return new vscode.Hover([codeBlock, copyButton]);
    }
}

/*
 * Copyright (c) 2025 Shrey Purohit.
 * This code is licensed under the MIT License.
 */
