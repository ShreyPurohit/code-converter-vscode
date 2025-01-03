import { Node } from '@babel/types';
import { CodeGenerator } from '../utils/CodeGenerator';

export abstract class BaseConverter {
    protected readonly INDENT_SIZE = 4;

    protected getIndentation(level: number): string {
        return ' '.repeat(level * this.INDENT_SIZE);
    }

    protected generateCode(node: Node): string {
        return CodeGenerator.generate(node);
    }
}   

/*
 * Copyright (c) 2025 Shrey Purohit.
 * This code is licensed under the MIT License.
 */
