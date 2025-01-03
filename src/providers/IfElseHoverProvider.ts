import * as vscode from 'vscode';
import { BaseHoverProvider } from './BaseHoverProvider';
import { IfElseToTernaryConverter } from '../converters/IfElseToTernaryConverter';

export class IfElseHoverProvider extends BaseHoverProvider {
    private converter: IfElseToTernaryConverter;

    constructor() {
        super();
        this.converter = new IfElseToTernaryConverter();
    }

    async provideHover(
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
