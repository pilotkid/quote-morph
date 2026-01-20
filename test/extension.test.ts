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
});
