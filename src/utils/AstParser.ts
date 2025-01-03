import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import { ConditionalExpression, IfStatement, Node } from '@babel/types';
import * as vscode from 'vscode';

export class ASTParser {
    private parseCode(code: string) {
        return parse(code, {
            sourceType: 'module',
            plugins: ['typescript', 'jsx'],
        });
    }

    private isNodeInPosition(node: Node, position: vscode.Position): boolean {
        const nodeStart = node.loc?.start;
        const nodeEnd = node.loc?.end;

        if (nodeStart && nodeEnd) {
            return position.line >= nodeStart.line - 1 &&
                position.line <= nodeEnd.line - 1;
        }
        return false;
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
                    if (this.isNodeInPosition(path.node, position)) {
                        foundNode = path.node;
                        path.stop();
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
                    if (this.isNodeInPosition(path.node, position)) {
                        foundNode = path.node;
                        path.stop();
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
