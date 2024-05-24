import './style.css'
import React from 'react';
import hljs from 'highlight.js';
import { Lato } from 'next/font/google';
import 'highlight.js/styles/monokai-sublime.css';

const lato = Lato({ weight: ['300', '400', '700', '900'], subsets: ['latin'] })

const markdownIt = require('markdown-it')({
  breaks: true,
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
               hljs.highlight(str, {language: lang, ignoreIllegals: true}).value +
               '</code></pre>';
      } catch (__) {}
    }
    return '<pre class="hljs"><code>' + markdownIt.utils.escapeHtml(str) + '</code></pre>';
  },
});

const markdownRenderer = (content) => {
  const renderedMarkdown = markdownIt.render(content);
  return (
    <div style={{ width: '100%' }} className={["markdown-content", lato.className].join(' ')} dangerouslySetInnerHTML={{ __html: renderedMarkdown }} />
  );
};

export default markdownRenderer;
