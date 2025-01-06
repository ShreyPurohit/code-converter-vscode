import * as vscode from 'vscode';
import { TernaryHoverProvider } from './providers/TernaryHoverProvider';
import { IfElseHoverProvider } from './providers/IfElseHoverProvider';

let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
  const supportedLanguages = ['javascript', 'typescript', 'javascriptreact', 'typescriptreact'];

  const isEnabled = context.globalState.get<boolean>('ternaryConverterEnabled', false);

  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  updateStatusBar(isEnabled);
  statusBarItem.command = 'ternary-visualizer.toggleConverter';
  statusBarItem.show();

  const toggleCommand = vscode.commands.registerCommand('ternary-visualizer.toggleConverter', async () => {
    const currentState = context.globalState.get<boolean>('ternaryConverterEnabled', false);
    await context.globalState.update('ternaryConverterEnabled', !currentState);
    updateStatusBar(!currentState);

    vscode.commands.executeCommand('editor.action.hideHover');
  });

  const ternaryHoverProvider = new TernaryHoverProvider(context);
  const ifElseHoverProvider = new IfElseHoverProvider(context);

  const copyIfElseCommand = vscode.commands.registerCommand('ternary-visualizer.copyIfElse', (code: string) => {
    vscode.env.clipboard.writeText(code);
    vscode.window.showInformationMessage('Copied to Clipboard!');
    vscode.commands.executeCommand('editor.action.hideHover');
  });

  const copyTernaryCommand = vscode.commands.registerCommand('ternary-visualizer.copyTernary', (code: string) => {
    vscode.env.clipboard.writeText(code);
    vscode.window.showInformationMessage('Copied to Clipboard!');
    vscode.commands.executeCommand('editor.action.hideHover');
  });

  context.subscriptions.push(
    statusBarItem,
    toggleCommand,
    copyIfElseCommand,
    copyTernaryCommand
  );

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

function updateStatusBar(isEnabled: boolean): void {
  statusBarItem.text = isEnabled ? '$(eye) Disable Converter' : '$(eye-closed) Enable Converter';
  statusBarItem.tooltip = isEnabled ? 'Click to disable ternary/if-else converter' : 'Click to enable ternary/if-else converter';
}

export function deactivate() { }