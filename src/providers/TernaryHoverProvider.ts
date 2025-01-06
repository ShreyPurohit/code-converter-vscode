import * as vscode from 'vscode';
import { TernaryToIfElseConverter } from '../converters/TernaryToIfElseConverter';
import { BaseHoverProvider } from './BaseHoverProvider';

export class TernaryHoverProvider extends BaseHoverProvider {
    private converter: TernaryToIfElseConverter;

    constructor(context: vscode.ExtensionContext) {
        super(context);
        this.converter = new TernaryToIfElseConverter();
    }

    async provideHover(
        document: vscode.TextDocument,
        position: vscode.Position
    ): Promise<vscode.Hover | null> {
        if (!this.isConverterEnabled()) {
            const range = document.getWordRangeAtPosition(position);
            if (!range) return null;

            const ternaryNode = await this.astParser.findTernaryAtPosition(
                document.getText(),
                position
            );

            return ternaryNode ? this.createHoverContent('', '', '') : null;
        }

        const range = document.getWordRangeAtPosition(position);
        if (!range) return null;

        const ternaryNode = await this.astParser.findTernaryAtPosition(
            document.getText(),
            position
        );

        if (!ternaryNode) return null;

        const ifElseRepresentation = this.converter.convert(ternaryNode);
        return this.createHoverContent(
            'If-Else View:',
            ifElseRepresentation,
            'ternary-visualizer.copyIfElse'
        );
    }
}