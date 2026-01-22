export interface MorphSettings {
  enableQuotesSingle: boolean;
  enableQuotesDouble: boolean;
}



export function morphQuotesInLine(lineText: string, settings: MorphSettings): string | null {
  const quoteTypes: string[] = [];
  if (settings.enableQuotesSingle) {quoteTypes.push("'");}
  if (settings.enableQuotesDouble) {quoteTypes.push('"');}

  if (quoteTypes.length === 0) {return null;}

  let newLine = lineText;
  let changed = false;

  for (const quoteChar of quoteTypes) {
    // match a quoted string allowing escaped chars inside, but require a ${...} inside
    const pattern = quoteChar + '((?:\\\\.|[^' + quoteChar + '])*?\\$\\{[^}]*\\}(?:\\\\.|[^' + quoteChar + '])*)' + quoteChar;
    const regex = new RegExp(pattern, 'g');

    newLine = newLine.replace(regex, (fullMatch: string, content: string) => {
      // leave alone if content contains escaped outer-quote (e.g. It\'s ...)
      if (content.includes('\\' + quoteChar)) {
        return fullMatch;
      }

      // leave alone if inner content itself is quoted/backticked (e.g. :src="`${test}`")
      if (content.length >= 2) {
        const first = content[0];
        const last = content[content.length - 1];
        if (["\"", "'", "`"].includes(first) && first === last) {
          return fullMatch;
        }
      }

      changed = true;
      return '`' + content + '`';
    });
  }

  return changed ? newLine : null;
}