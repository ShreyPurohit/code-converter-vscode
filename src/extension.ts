import * as vscode from 'vscode';
import { IfElseHoverProvider } from './providers/IfElseHoverProvider';
import { TernaryHoverProvider } from './providers/TernaryHoverProvider';

const SUPPORTED_LANGUAGES = ['javascript', 'typescript', 'javascriptreact', 'typescriptreact'];
const CONVERTER_STATE_KEY = 'ternaryConverterEnabled';

export function activate(context: vscode.ExtensionContext) {
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = 'ternary-visualizer.toggleConverter';

  const updateStatusBar = (isEnabled: boolean) => {
    statusBarItem.text = isEnabled ? 'Disable Converter' : 'Enable Converter';
  };

  const refreshHover = async () => {
    await vscode.workspace.getConfiguration().update('editor.hover.enabled', false, true);
    await vscode.workspace.getConfiguration().update('editor.hover.enabled', true, true);
  };

  const copyToClipboard = (code: string) => {
    vscode.env.clipboard.writeText(code);
    vscode.window.showInformationMessage('Copied to Clipboard!');
  };

  updateStatusBar(context.globalState.get(CONVERTER_STATE_KEY, false));
  statusBarItem.show();

  const providers = [
    new TernaryHoverProvider(context),
    new IfElseHoverProvider(context)
  ];

  context.subscriptions.push(
    statusBarItem,
    vscode.commands.registerCommand('ternary-visualizer.toggleConverter', async () => {
      const currentState = context.globalState.get(CONVERTER_STATE_KEY, false);
      await context.globalState.update(CONVERTER_STATE_KEY, !currentState);
      updateStatusBar(!currentState);
      await refreshHover();
    }),
    vscode.commands.registerCommand('ternary-visualizer.copyIfElse', copyToClipboard),
    vscode.commands.registerCommand('ternary-visualizer.copyTernary', copyToClipboard),
    ...SUPPORTED_LANGUAGES.flatMap(language =>
      providers.map(provider =>
        vscode.languages.registerHoverProvider({ scheme: 'file', language }, provider)
      )
    )
  );
}

export function deactivate() { }

/*
 * Copyright (c) 2025 Shrey Purohit.
 * This code is licensed under the MIT License.
 */
