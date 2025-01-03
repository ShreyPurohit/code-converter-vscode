import generate from '@babel/generator';
import { Node } from '@babel/types';

export class CodeGenerator {
    static generate(node: Node): string {
        try {
            const { code } = generate(node);
            return code;
        } catch (error) {
            console.warn(`Error generating code for node type ${node.type}:`, error);
            return node.type;
        }
    }
}

/*
 * Copyright (c) 2025 Shrey Purohit.
 * This code is licensed under the MIT License.
 */
