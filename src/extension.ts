import * as vscode from 'vscode';
import { TernaryHoverProvider } from './providers/TernaryHoverProvider';
import { IfElseHoverProvider } from './providers/IfElseHoverProvider';

export function activate(context: vscode.ExtensionContext) {
  const supportedLanguages = ['javascript', 'typescript', 'javascriptreact', 'typescriptreact'];

  const ternaryHoverProvider = new TernaryHoverProvider();
  const ifElseHoverProvider = new IfElseHoverProvider();

  const copyIfElseCommand = vscode.commands.registerCommand('ternary-visualizer.copyIfElse', (code: string) => {
    vscode.env.clipboard.writeText(code);
    vscode.window.showInformationMessage('Copied to Clipboard!');
  });

  const copyTernaryCommand = vscode.commands.registerCommand('ternary-visualizer.copyTernary', (code: string) => {
    vscode.env.clipboard.writeText(code);
    vscode.window.showInformationMessage('Copied to Clipboard!');
  });

  context.subscriptions.push(copyIfElseCommand, copyTernaryCommand);

  supportedLanguages.forEach(language => {
    context.subscriptions.push(
      vscode.languages.registerHoverProvider(
        { scheme: 'file', language },
        ternaryHoverProvider
      ),
      vscode.languages.registerHoverProvider(
        { scheme: 'file', language },
        ifElseHoverProvider
      )
    );
  });
}

export function deactivate() { }

/*
 * Copyright (c) 2025 Shrey Purohit.
 * This code is licensed under the MIT License.
 */
