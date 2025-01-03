import { IfStatement, Node } from '@babel/types';
import { BaseConverter } from './BaseConverter';
export class IfElseToTernaryConverter extends BaseConverter {
    convert(node: IfStatement): string {
        return this.buildTernary(node);
    }
    private buildTernary(node: IfStatement): string {
        const condition = this.generateCode(node.test);
        const consequent = this.extractValue(node.consequent);
        const alternate = node.alternate ? this.extractValue(node.alternate) : 'undefined';
        return `${condition} ? ${consequent} : ${alternate}`;
    }
    private extractValue(node: Node): string {
        // If it's another if statement, recursively convert it
        if (node.type === 'IfStatement') {
            return this.buildTernary(node);
        }
        // Handle block statements by extracting their content
        if (node.type === 'BlockStatement' && node.body.length === 1) {
            return this.extractValue(node.body[0]);
        }
        // For expression statements, extract the expression
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
