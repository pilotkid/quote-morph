import * as vscode from 'vscode';
import { morphQuotesInLine } from './morph';


function getSettings() {
  const cfg = vscode.workspace.getConfiguration('quoteMorph');
  return {
    enabled: cfg.get<boolean>("enabled", true),
    enableForAllLanguages: cfg.get<boolean>("enableForAllLanguages", false),
    languageIds: new Set(cfg.get<string[]>("languageIds", [])),
    enableQuotesSingle: cfg.get<boolean>("enableQuotesSingle", true),
    enableQuotesDouble: cfg.get<boolean>("enableQuotesDouble", true),
  };
}

function shouldHandleDoc(doc: vscode.TextDocument, settings: ReturnType<typeof getSettings>) {
  if (!settings.enabled) {return false;}
  if (doc.uri.scheme !== "file") {return false;} // optional: ignore untitled/git/etc
  if (settings.enableForAllLanguages) {return true;}
  return settings.languageIds.has(doc.languageId);
}



export function activate(context: vscode.ExtensionContext) {
  console.log('✅\t"QuoteMorph" is now active!');
  let settings = getSettings();
  
  const lastThreeChanges: {
    character: string;
    line: number;
    position: vscode.Position;
  }[] = [];

  // Clear the last three changes when the active editor changes
  vscode.window.onDidChangeActiveTextEditor(() => {
    lastThreeChanges.length = 0;
  });

  const maybeSetup = (doc: vscode.TextDocument) => {
    if (!shouldHandleDoc(doc, settings)) {return;}

    // Setup document change listener for quote morphing
    const disposable = vscode.workspace.onDidChangeTextDocument((event) => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || event.document !== editor.document || event.document !== doc) {return;}

      const change = event.contentChanges[0];
      if (!change || !change.text) {return;}

      const lineNumber = change.range.start.line;
      const line = doc.lineAt(lineNumber);
      const lineText = line.text;

      // Look for any strings containing template literals that need conversion
      const templateLiteralPattern = /\$\{[^}]*\}/;
      if (!templateLiteralPattern.test(lineText)) {
        return;
      }

      const newLine = morphQuotesInLine(lineText, settings);
      if (!newLine) {return;}

      editor.edit((editBuilder) => {
        editBuilder.replace(line.range, newLine);
        lastThreeChanges.length = 0;
      });
    });

    context.subscriptions.push(disposable);
  };

  // Handle already-open docs (important)
  vscode.workspace.textDocuments.forEach(maybeSetup);

  // Handle new docs
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(maybeSetup)
  );

  // React to settings changes live
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (!e.affectsConfiguration('quoteMorph')) {return;}
      settings = getSettings();

      // Optionally re-run setup on currently open docs when settings change
      vscode.workspace.textDocuments.forEach(maybeSetup);
    })
  );
}

export function deactivate() {}
