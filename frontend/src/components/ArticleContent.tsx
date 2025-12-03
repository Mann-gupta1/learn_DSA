import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

interface ArticleContentProps {
  markdown: string;
}

export default function ArticleContent({ markdown }: ArticleContentProps) {
  useEffect(() => {
    // Update code block styles for dark mode
    const isDark = document.documentElement.classList.contains('dark');
    const codeBlocks = document.querySelectorAll('pre code');
    codeBlocks.forEach((block) => {
      (block as HTMLElement).style.backgroundColor = isDark ? '#0f172a' : '#1e293b';
      (block as HTMLElement).style.color = isDark ? '#f8fafc' : '#f8fafc';
    });
  }, [markdown]);

  return (
    <div className="glass-card rounded-2xl p-8 lg:p-12 shadow-xl mb-8">
      <article className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-200 prose-strong:text-gray-900 dark:prose-strong:text-white prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-code:text-indigo-600 dark:prose-code:text-indigo-400 prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950 prose-blockquote:border-indigo-500 dark:prose-blockquote:border-indigo-400 prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300">
        <ReactMarkdown
          rehypePlugins={[rehypeHighlight]}
          components={{
            code({ node, inline, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <div className="relative my-6">
                  <div className="absolute top-2 right-2 text-xs text-gray-500 dark:text-gray-400 font-mono">
                    {match[1]}
                  </div>
                  <pre className="bg-gray-950 dark:bg-gray-950 rounded-lg p-4 overflow-x-auto border border-gray-800 dark:border-gray-700 shadow-lg text-left">
                    <code className={`${className} text-sm text-left`} {...props}>
                      {children}
                    </code>
                  </pre>
                </div>
              ) : (
                <code className="bg-gray-100 dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded text-sm font-mono" {...props}>
                  {children}
                </code>
              );
            },
            h1: ({ children }) => (
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 mt-8 first:mt-0 border-b border-gray-200 dark:border-gray-700 pb-3 text-left">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 mt-8 border-b border-gray-200 dark:border-gray-700 pb-2 text-left">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 mt-6 text-left">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed text-left">
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc space-y-2 mb-4 text-gray-700 dark:text-gray-300 ml-6 text-left">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal space-y-2 mb-4 text-gray-700 dark:text-gray-300 ml-6 text-left">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="text-gray-700 dark:text-gray-300 text-left">
                {children}
              </li>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-indigo-500 dark:border-indigo-400 pl-4 italic my-4 text-gray-700 dark:text-gray-300">
                {children}
              </blockquote>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 underline transition-colors"
              >
                {children}
              </a>
            ),
          }}
        >
          {markdown}
        </ReactMarkdown>
      </article>
    </div>
  );
}
