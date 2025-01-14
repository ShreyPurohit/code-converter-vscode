import type { IfStatement, Node } from '@babel/types';
import { BaseConverter } from './BaseConverter';
import * as vscode from 'vscode';

export class IfElseToTernaryConverter extends BaseConverter {
    convert(node: IfStatement): string {
        if (!this.canConvertToTernary(node)) {
            return new vscode.MarkdownString(
                `**Conversion to ternary is not optimal**\n` +
                `It is recommended to keep it as an if-else statement.\n`
                +
                `Try optimizing at a more granular level.`
            ).value;
        }
        return this.buildTernary(node);
    }

    private canConvertToTernary(node: IfStatement): boolean {
        if (node.consequent.type === 'BlockStatement' && node.consequent.body.length > 1) {
            return false;
        }

        if (node.alternate) {
            if (node.alternate.type === 'BlockStatement' && node.alternate.body.length > 1) {
                return false;
            }
            if (node.alternate.type === 'IfStatement' && !this.canConvertToTernary(node.alternate)) {
                return false;
            }
        }

        return true;
    }

    private buildTernary(node: IfStatement): string {
        const condition = this.generateCode(node.test);
        const consequent = this.extractValue(node.consequent);

        if (node.alternate && node.alternate.type === 'IfStatement') {
            const alternateValue = this.buildTernary(node.alternate);
            return `${condition} ? ${consequent} : ${alternateValue}`;
        }

        const alternate = node.alternate ? this.extractValue(node.alternate) : 'undefined';
        return `${condition} ? ${consequent} : ${alternate}`;
    }

    private extractValue(node: Node): string {
        if (node.type === 'IfStatement') {
            return this.buildTernary(node);
        }
        if (node.type === 'BlockStatement' && node.body.length === 1) {
            return this.extractValue(node.body[0]);
        }
        if (node.type === 'ExpressionStatement') {
            return this.generateCode(node.expression);
        }
        return this.generateCode(node);
    }
}

/*
 * Copyright (c) 2025 Shrey Purohit.
 * This code is licensed under the MIT License.
 */
