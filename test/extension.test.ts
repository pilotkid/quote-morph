import { expect } from 'chai';
import { morphQuotesInLine } from '../src/morph';

const settings = {
  enabled: true,
  enableForAllLanguages: true,
  languageIds: new Set<string>(),
  enableQuotesSingle: true,
  enableQuotesDouble: true,
};

describe('morphQuotesInLine', () => {
  it('converts single-quoted string containing ${} to backticks', () => {
    const line = "const s = 'Hello ${name} world';";
    const got = morphQuotesInLine(line, settings as any);
    expect(got).to.equal('const s = `Hello ${name} world`;');
  });

  it('converts double-quoted string containing ${} to backticks', () => {
    const line = 'const s = "Hello ${name}";';
    const got = morphQuotesInLine(line, settings as any);
    expect(got).to.equal('const s = `Hello ${name}`;');
  });

  it('does not change already-backticked template literals', () => {
    const line = 'const s = `Hello ${name}`;';
    const got = morphQuotesInLine(line, settings as any);
    expect(got).to.equal(null);
  });

  it('does not change outer quotes when inner content is backticked (e.g. :src="`${test}`")', () => {
    const line = ':src="`${test}`"';
    const got = morphQuotesInLine(line, settings as any);
    expect(got).to.equal(null);
  });

  it('leaves strings with escaped quotes alone', () => {
    const line = "const s = 'It\\'s ${name}';";
    const got = morphQuotesInLine(line, settings as any);
    expect(got).to.equal(null);
  });

  it('converts multiple quoted template strings on the same line', () => {
    const line = 'const a = "Hi ${x}", b = \'Bye ${y}\';';
    const got = morphQuotesInLine(line, settings as any);
    expect(got).to.equal('const a = `Hi ${x}`, b = `Bye ${y}`;');
  });

  it('does not change lines without template placeholders', () => {
    const line = 'const s = "Hello world";';
    const got = morphQuotesInLine(line, settings as any);
    expect(got).to.equal(null);
  });

  it('do not change in backticked string containing double quotes', () => {
    const line = '`hi there "${name}"`';

    const got = morphQuotesInLine(line, settings as any);
    expect(got).to.equal(null);
  });

  it('do not change in backticked string containing single quotes', () => {
    const line = "`hi there '${name}'`";

    const got = morphQuotesInLine(line, settings as any);
    expect(got).to.equal(null);
  });

  it('leaves template literals with CRLF and backticked attribute values alone', () => {
    const line =
      '<head>\r\n${this.injectConsoleLog}\r\n<base href="${baseUrl}">\r\n${comment ? `<!-- ${comment} -->\r\n` : \'\'}\r\n${injectScript}`';

    const got = morphQuotesInLine(line, settings as any);
    expect(got).to.equal(null);
  });

  it('does not modify template literals containing CRLF and nested template segments', () => {
    const line =
      '<head>\r\n${this.injectConsoleLog}\r\n<base href="${baseUrl}">\r\n${comment ? `<!-- ${comment} -->\r\n` : \'\'}\r\n${injectScript}`';

    const got = morphQuotesInLine(line, settings as any);

    // if your contract is: null means "no change"
    if (got === null) return;

    // otherwise, ensure it didn't change anything
    expect(got).to.equal(line);
  });

  it('regression: does not morph quotes inside CRLF template-literal HTML injection snippet', () => {
    const line =
      '<head>\r\n${this.injectConsoleLog}\r\n<base href="${baseUrl}">\r\n${comment ? `<!-- ${comment} -->\r\n` : \'\'}\r\n${injectScript}`';

    const got = morphQuotesInLine(line, settings as any);

    // If this currently fails, you'll see what it produced.
    expect(got, `Unexpected transform: ${String(got)}`).to.equal(null);
  });
});
