import * as vscode from 'vscode';
import { IfElseToTernaryConverter } from '../converters/IfElseToTernaryConverter';
import { BaseHoverProvider } from './BaseHoverProvider';

export class IfElseHoverProvider extends BaseHoverProvider {
    private converter: IfElseToTernaryConverter;

    constructor(context: vscode.ExtensionContext) {
        super(context);
        this.converter = new IfElseToTernaryConverter();
    }

    async provideHover(
        document: vscode.TextDocument,
        position: vscode.Position
    ): Promise<vscode.Hover | null> {
        if (!this.isConverterEnabled()) {
            const range = document.getWordRangeAtPosition(position);
            if (!range) { return null; }

            const ifNode = await this.astParser.findIfStatementAtPosition(
                document.getText(),
                position
            );

            return ifNode ? this.createHoverContent('', '', '') : null;
        }

        const range = document.getWordRangeAtPosition(position);
        if (!range) { return null; }

        const ifNode = await this.astParser.findIfStatementAtPosition(
            document.getText(),
            position
        );

        if (!ifNode) { return null; }

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
