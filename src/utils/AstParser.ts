import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import type { ConditionalExpression, IfStatement, Node, File } from '@babel/types';
import * as vscode from 'vscode';
import { ASTCache } from './Cache';

export class ASTParser {
    private cache = new ASTCache();

    private parseCode(code: string, document: vscode.TextDocument): File {
        const cachedAST = this.cache.get(document.uri.toString(), document);
        if (cachedAST) {
            return cachedAST;
        }

        const ast = parse(code, {
            sourceType: 'module',
            plugins: ['typescript', 'jsx'],
        });

        this.cache.set(document.uri.toString(), ast, document);
        return ast;
    }

    private isPositionWithinNode(node: Node, position: vscode.Position): boolean {
        const nodeStart = node.loc?.start;
        const nodeEnd = node.loc?.end;

        if (!nodeStart || !nodeEnd) { return false; }

        const posLine = position.line + 1;
        const posChar = position.character;

        if (posLine < nodeStart.line || posLine > nodeEnd.line) { return false; }
        if (posLine === nodeStart.line && posChar < nodeStart.column) { return false; }
        if (posLine === nodeEnd.line && posChar > nodeEnd.column) { return false; }

        return true;
    }

    async findTernaryAtPosition(
        code: string,
        position: vscode.Position,
        document: vscode.TextDocument,
        token?: vscode.CancellationToken
    ): Promise<ConditionalExpression | null> {
        try {
            const ast = this.parseCode(code, document);
            let foundNode: ConditionalExpression | null = null;

            traverse(ast, {
                ConditionalExpression: path => {
                    if (token?.isCancellationRequested) {
                        path.stop();
                        return;
                    }

                    if (this.isPositionWithinNode(path.node, position)) {
                        if (!foundNode || this.isPositionWithinNode(foundNode, position)) {
                            foundNode = path.node;
                        }
                    }
                }
            });

            return foundNode;
        } catch (error) {
            console.error('Error parsing code:', error);
            return null;
        }
    }

    async findIfStatementAtPosition(
        code: string,
        position: vscode.Position,
        document: vscode.TextDocument,
        token?: vscode.CancellationToken
    ): Promise<IfStatement | null> {
        try {
            const ast = this.parseCode(code, document);
            let foundNode: IfStatement | null = null;

            traverse(ast, {
                IfStatement: path => {
                    if (token?.isCancellationRequested) {
                        path.stop();
                        return;
                    }

                    if (this.isPositionWithinNode(path.node, position)) {
                        if (!foundNode || this.isPositionWithinNode(foundNode, position)) {
                            foundNode = path.node;
                        }
                    }
                }
            });

            return foundNode;
        } catch (error) {
            console.error('Error parsing code:', error);
            return null;
        }
    }
}