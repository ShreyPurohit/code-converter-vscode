import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import type { ConditionalExpression, IfStatement, Node } from '@babel/types';
import * as vscode from 'vscode';

export class ASTParser {
    private parseCode(code: string) {
        return parse(code, {
            sourceType: 'module',
            plugins: ['typescript', 'jsx'],
        });
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
        position: vscode.Position
    ): Promise<ConditionalExpression | null> {
        try {
            const ast = this.parseCode(code);
            let foundNode: ConditionalExpression | null = null;

            traverse(ast, {
                ConditionalExpression: path => {
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
        position: vscode.Position
    ): Promise<IfStatement | null> {
        try {
            const ast = this.parseCode(code);
            let foundNode: IfStatement | null = null;

            traverse(ast, {
                IfStatement: path => {
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

/*
 * Copyright (c) 2025 Shrey Purohit.
 * This code is licensed under the MIT License.
 */
