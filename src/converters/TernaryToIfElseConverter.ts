import { ConditionalExpression, isConditionalExpression } from '@babel/types';
import { BaseConverter } from './BaseConverter';

export class TernaryToIfElseConverter extends BaseConverter {
    convert(node: ConditionalExpression): string {
        return this.convertTernary(node);
    }

    private convertTernary(node: ConditionalExpression, indentLevel = 0): string {
        if (isConditionalExpression(node.alternate)) {
            return this.handleElseIfChain(node, indentLevel);
        }

        return this.handleNestedTernary(node, indentLevel);
    }

    private handleElseIfChain(node: ConditionalExpression, indentLevel: number): string {
        const baseIndent = this.getIndentation(indentLevel);
        const bodyIndent = this.getIndentation(indentLevel + 1);
        let result = '';

        let currentNode: ConditionalExpression = node;
        let isFirst = true;

        while (currentNode) {
            const prefix = isFirst ? 'if' : '} else if';
            result += `${baseIndent}${prefix} (${this.generateCode(currentNode.test)}) {\n`;
            result += `${bodyIndent}${this.processExpression(currentNode.consequent, indentLevel + 1)}\n`;

            if (!isConditionalExpression(currentNode.alternate)) {
                result += `${baseIndent}} else {\n`;
                result += `${bodyIndent}${this.generateCode(currentNode.alternate)}\n`;
                result += `${baseIndent}}`;
                break;
            }

            currentNode = currentNode.alternate;
            isFirst = false;
        }

        return result;
    }

    private handleNestedTernary(node: ConditionalExpression, indentLevel: number): string {
        const baseIndent = this.getIndentation(indentLevel);
        const bodyIndent = this.getIndentation(indentLevel + 1);

        let result = `${baseIndent}if (${this.generateCode(node.test)}) {\n`;
        result += `${bodyIndent}${this.processExpression(node.consequent, indentLevel + 1)}\n`;
        result += `${baseIndent}} else {\n`;
        result += `${bodyIndent}${this.processExpression(node.alternate, indentLevel + 1)}\n`;
        result += `${baseIndent}}`;

        return result;
    }

    private processExpression(node: any, indentLevel: number): string {
        if (isConditionalExpression(node)) {
            return this.convertTernary(node, indentLevel);
        }
        return this.generateCode(node);
    }
}