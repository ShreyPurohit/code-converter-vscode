import * as vscode from 'vscode';
import { IfElseToTernaryConverter } from '../converters/IfElseToTernaryConverter';
import { BaseHoverProvider } from './BaseHoverProvider';

export class IfElseHoverProvider extends BaseHoverProvider {
    private converter: IfElseToTernaryConverter;
    private debouncedProvideHover: (document: vscode.TextDocument, position: vscode.Position) => Promise<vscode.Hover | null>;

    constructor(context: vscode.ExtensionContext) {
        super(context);
        this.converter = new IfElseToTernaryConverter();
        this.debouncedProvideHover = this.debounce(this.processHover.bind(this));
    }

    async provideHover(
        document: vscode.TextDocument,
        position: vscode.Position
    ): Promise<vscode.Hover | null> {
        return this.debouncedProvideHover(document, position);
    }

    private async processHover(
        document: vscode.TextDocument,
        position: vscode.Position
    ): Promise<vscode.Hover | null> {
        const range = document.getWordRangeAtPosition(position);
        if (!range) { return null; }

        const ifNode = await this.astParser.findIfStatementAtPosition(
            document.getText(),
            position
        );

        if (!ifNode) { return null; }

        if (!this.isConverterEnabled()) {
            return this.createHoverContent('', '', '');
        }

        const ternaryRepresentation = this.converter.convert(ifNode);
        return this.createHoverContent(
            'Ternary View:',
            ternaryRepresentation,
            'ternary-visualizer.copyTernary'
        );
    }
}

/*
 * Copyright (c) 2025 Shrey Purohit.
 * This code is licensed under the MIT License.
 */
