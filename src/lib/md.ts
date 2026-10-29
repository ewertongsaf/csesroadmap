// Markdown curto (dicas, armadilhas, checklist) renderizado no build, com $...$ e $$...$$ via KaTeX.
import { Marked, type TokenizerAndRendererExtension } from 'marked';
import katex from 'katex';

const math = (display: boolean): TokenizerAndRendererExtension => ({
  name: display ? 'mathBlock' : 'mathInline',
  level: display ? 'block' : 'inline',
  start: (src) => src.indexOf(display ? '$$' : '$'),
  tokenizer(src) {
    const m = display ? /^\$\$([\s\S]+?)\$\$/.exec(src) : /^\$([^$\n]+?)\$/.exec(src);
    if (m) return { type: display ? 'mathBlock' : 'mathInline', raw: m[0], text: m[1].trim() };
  },
  renderer: (token) => katex.renderToString(token.text, { displayMode: display, throwOnError: false }),
});

const md = new Marked({ gfm: true, breaks: false });
md.use({ extensions: [math(true), math(false)] });

export const renderMarkdown = (text: string) => md.parse(text, { async: false });
export const renderInline = (text: string) => md.parseInline(text, { async: false });
