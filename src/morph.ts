export interface MorphSettings {
  enableQuotesSingle: boolean;
  enableQuotesDouble: boolean;
}

export function morphQuotesInLine(
  lineText: string,
  settings: MorphSettings
): string | null {
  // If the line contains any backticks, avoid morphing entirely to prevent
  // interfering with nested template segments embedded in quoted strings.
  if (lineText.includes('`')) {
    return null;
  }
  const quoteTypes: string[] = [];
  if (settings.enableQuotesSingle) {
    quoteTypes.push("'");
  }
  if (settings.enableQuotesDouble) {
    quoteTypes.push('"');
  }

  if (quoteTypes.length === 0) {
    return null;
  }

  let newLine = lineText;
  let changed = false;

  for (const quoteChar of quoteTypes) {
    // match a quoted string allowing escaped chars inside, but require an UNESCAPED ${...} inside
    // use negative lookbehind to ensure ${ is not preceded by a backslash
    const pattern =
      quoteChar +
      '((?:\\\\.|[^' +
      quoteChar +
      '])*?(?<!\\\\)\\$\\{[^}]*\\}(?:\\\\.|[^' +
      quoteChar +
      '])*)' +
      quoteChar;
    const regex = new RegExp(pattern, 'g');

    newLine = newLine.replace(regex, (fullMatch: string, content: string) => {
      // leave alone if inner content itself is quoted/backticked (e.g. :src="`${test}`")
      if (content.length >= 2) {
        const first = content[0];
        const last = content[content.length - 1];
        if (['"', "'", '`'].includes(first) && first === last) {
          return fullMatch;
        }
      }

      // do not morph if content contains any backtick at all
      // (avoids interfering with nested template segments like `<!-- ${...} -->`)
      if (content.includes('`')) {
        return fullMatch;
      }

      // do not morph if content contains escaped occurrences of the outer quote
      // e.g., for single quotes: It\'s ${name}; for double quotes: It\"s ${name}
      if (quoteChar === "'" && content.includes("\\'")) {
        return fullMatch;
      }
      if (quoteChar === '"' && content.includes('\\"')) {
        return fullMatch;
      }

      // escape content safely for template literal:
      // - preserve literal backslash+backtick by doubling the backslash and escaping the backtick
      // - escape any remaining raw backticks
      // - preserve literal \${ by doubling the backslash so ${ is not treated as interpolation
      const safeContent = content
        .replace(/\\`/g, '\\\\`')
        .replace(/`/g, '\\`')
        .replace(/\\\$\{/g, '\\\\\\${');

      changed = true;
      return '`' + safeContent + '`';
    });
  }

  return changed ? newLine : null;
}
