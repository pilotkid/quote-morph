import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('✅\t"QuoteMorph" is now active!');
  const lastThreeChanges: {
    character: string;
    line: number;
    position: vscode.Position;
  }[] = [];

  // Clear the last three changes when the active editor changes
  vscode.window.onDidChangeActiveTextEditor(() => {
    lastThreeChanges.length = 0;
  });

  const disposable = vscode.workspace.onDidChangeTextDocument((event) => {
    const editor = vscode.window.activeTextEditor;
    if (!editor || event.document !== editor.document) return;

    const change = event.contentChanges[0];
    if (change && change.text) {
      const position = change.range.start;
      
      // Clear the last three changes if the line has changed to prevent bleed
      if (lastThreeChanges.at(0)?.line !== position.line) {
        lastThreeChanges.length = 0;
      }

      lastThreeChanges.push({
        character: change.text,
        line: position.line,
        position,
      });

      if (lastThreeChanges.length > 3) {
        lastThreeChanges.shift();
      }
    } else {
      return;
    }

    const changesText = lastThreeChanges.map((c) => c.character).join('');
    if (change.text === '$') {
      const nextCharPosition = new vscode.Position(
        change.range.start.line,
        change.range.start.character + 1
      );
      const nextChar = editor.document.getText(
        new vscode.Range(nextCharPosition, nextCharPosition.translate(0, 1))
      );

      if (nextChar !== '{') {
        return;
      }
    } else if (!changesText.includes('${`) && !changesText.includes(`{}')) {
      return;
    }

    const doc = editor.document;
    const line = doc.lineAt(change.range.start.line);
    const lineText = line.text;

    const cursorIndex = change.range.start.character;
    const quoteTypes = [`'`, `"`];

    // Find the surrounding quotes
    let openingQuoteIndex = -1;
    let closingQuoteIndex = -1;
    let quoteChar = '';

    for (const q of quoteTypes) {
      const before = lineText.lastIndexOf(q, cursorIndex - 1);
      const after = lineText.indexOf(q, cursorIndex);

      if (
        before !== -1 &&
        after !== -1 &&
        before < cursorIndex &&
        after > cursorIndex
      ) {
        openingQuoteIndex = before;
        closingQuoteIndex = after;

        // Check if the quotes are not part of an html attribute or tag
        const between = lineText.slice(before + 1, after);
        const backTickTotal = between
          .split('')
          .filter((c) => c === '`')?.length;
        if (backTickTotal >= 2) {
          continue;
        }

        quoteChar = q;
        break;
      }
    }

    if (openingQuoteIndex !== -1 && closingQuoteIndex !== -1 && quoteChar) {
      editor.edit((editBuilder) => {
        // Replace entire quoted section
        const before = lineText.slice(0, openingQuoteIndex);
        const content = lineText.slice(
          openingQuoteIndex + 1,
          closingQuoteIndex
        );
        const after = lineText.slice(closingQuoteIndex + 1);

        const newLine = `${before}\`${content}\`${after}`;
        editBuilder.replace(line.range, newLine);

        // Clear the last three changes Array to prevent infinite loop
        lastThreeChanges.length = 0;
      });
    }
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
