export interface MorphSettings {
  enableQuotesSingle: boolean;
  enableQuotesDouble: boolean;
}

export function morphQuotesInLine(lineText: string, settings: MorphSettings): string | null {
  const quoteTypes: string[] = [];
  if (settings.enableQuotesSingle) {quoteTypes.push("'");}
  if (settings.enableQuotesDouble) {quoteTypes.push('"');}

  if (quoteTypes.length === 0) {return null;}

  for (const quoteChar of quoteTypes) {
    const regex = new RegExp(quoteChar + '([^' + quoteChar + ']*\\$\\{[^}]*\\}[^' + quoteChar + ']*)' + quoteChar, 'g');
    let match;

    while ((match = regex.exec(lineText)) !== null) {
      const fullMatch = match[0];
      const content = match[1];
      const startIndex = match.index;
      const endIndex = startIndex + fullMatch.length;

      if (content.length >= 2) {
        const first = content[0];
        const last = content[content.length - 1];
        if (["\"", "'", "`"].includes(first) && first === last) {
          continue;
        }
      }

      if (content.includes('${') && !fullMatch.startsWith('`')) {
        const before = lineText.slice(0, startIndex);
        const after = lineText.slice(endIndex);
        const newLine = `${before}\`${content}\`${after}`;
        return newLine;
      }
    }
  }

  return null;
}
