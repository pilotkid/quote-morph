import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "QuoteMorph" is now active!');
	const lastThreeChanges: string[] = [];
	const disposable = vscode.workspace.onDidChangeTextDocument(event => {
		const editor = vscode.window.activeTextEditor;
		if (!editor || event.document !== editor.document) return;

		const change = event.contentChanges[0];
		if (change && change.text) {
			lastThreeChanges.push(change.text);
			if (lastThreeChanges.length > 3) {
				lastThreeChanges.shift();
			}
		} else {
			return;
		}
		const position = change.range.start;

		const changesText = lastThreeChanges.join('');
		if (change.text === '$') {
			const nextCharPosition = new vscode.Position(position.line, position.character + 1);
			const nextChar = editor.document.getText(new vscode.Range(nextCharPosition, nextCharPosition.translate(0, 1)));

			if (nextChar !== '{') {
				return;
			}
		} else if (!changesText.includes('${') && !changesText.includes('{}')) {
			return;
		}


		const doc = editor.document;
		const line = doc.lineAt(position.line);
		const lineText = line.text;

		const cursorIndex = position.character;
		const quoteTypes = [`'`, `"`];

		// Find the surrounding quotes
		let openingQuoteIndex = -1;
		let closingQuoteIndex = -1;
		let quoteChar = '';

		for (const q of quoteTypes) {
			const before = lineText.lastIndexOf(q, cursorIndex - 1);
			const after = lineText.indexOf(q, cursorIndex);

			if (before !== -1 && after !== -1 && before < cursorIndex && after > cursorIndex) {
				openingQuoteIndex = before;
				closingQuoteIndex = after;
				quoteChar = q;
				break;
			}
		}

		if (openingQuoteIndex !== -1 && closingQuoteIndex !== -1 && quoteChar) {
			editor.edit(editBuilder => {
				const start = new vscode.Position(position.line, openingQuoteIndex);
				const end = new vscode.Position(position.line, closingQuoteIndex);

				// Replace entire quoted section
				const before = lineText.slice(0, openingQuoteIndex);
				const content = lineText.slice(openingQuoteIndex + 1, closingQuoteIndex);
				const after = lineText.slice(closingQuoteIndex + 1);

				const newLine = `${before}\`${content}\`${after}`;
				editBuilder.replace(line.range, newLine);
			});
		}
	});


	context.subscriptions.push(disposable);
}

export function deactivate() { }