import { ConditionalExpression, isConditionalExpression } from '@babel/types';
import { BaseConverter } from './BaseConverter';

export class TernaryToIfElseConverter extends BaseConverter {
    convert(node: ConditionalExpression): string {
        return this.buildIfElse(node);
    }

    private buildIfElse(node: ConditionalExpression, indentLevel = 0): string {
        const baseIndent = this.getIndentation(indentLevel);
        const nestedIndent = this.getIndentation(indentLevel + 1);

        const condition = this.generateCode(node.test);
        const consequent = isConditionalExpression(node.consequent)
            ? this.buildIfElse(node.consequent, indentLevel + 1)
            : `${nestedIndent}${this.generateCode(node.consequent)}`;

        const alternate = isConditionalExpression(node.alternate)
            ? this.buildIfElse(node.alternate, indentLevel + 1)
            : `${nestedIndent}${this.generateCode(node.alternate)}`;

        return `${baseIndent}if (${condition}) {
${consequent}
${baseIndent}} else {
${alternate}
${baseIndent}}`;
    }
}

/*
 * Copyright (c) 2025 Shrey Purohit.
 * This code is licensed under the MIT License.
 */
