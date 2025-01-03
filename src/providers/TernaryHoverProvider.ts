import * as vscode from 'vscode';
import { TernaryToIfElseConverter } from '../converters/TernaryToIfElseConverter';
import { BaseHoverProvider } from './BaseHoverProvider';

export class TernaryHoverProvider extends BaseHoverProvider {
    private converter: TernaryToIfElseConverter;

    constructor() {
        super();
        this.converter = new TernaryToIfElseConverter();
    }

    async provideHover(
        document: vscode.TextDocument,
        position: vscode.Position
    ): Promise<vscode.Hover | null> {
        const range = document.getWordRangeAtPosition(position);
        if (!range) { return null; }

        const ternaryNode = await this.astParser.findTernaryAtPosition(
            document.getText(),
            position
        );

        if (!ternaryNode) { return null; }

        const ifElseRepresentation = this.converter.convert(ternaryNode);
        return this.createHoverContent(
            'If-Else View:',
            ifElseRepresentation,
            'ternary-visualizer.copyIfElse'
        );
    }
}

/*
 * Copyright (c) 2025 Shrey Purohit.
 * This code is licensed under the MIT License.
 */
