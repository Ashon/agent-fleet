import { useMemo } from 'react'
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import json from 'react-syntax-highlighter/dist/cjs/languages/prism/json'
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'

SyntaxHighlighter.registerLanguage('json', json)

export default function Code({
  code,
  showLineNumbers = false,
}: {
  code: string
  showLineNumbers?: boolean
}) {
  const memoizedHighlighter = useMemo(
    () => (
      <SyntaxHighlighter
        className="shadow-xl text-xs m-0"
        style={oneDark}
        customStyle={{ margin: 0, borderRadius: '0.5rem' }}
        language="json"
        showLineNumbers={showLineNumbers}
      >
        {code}
      </SyntaxHighlighter>
    ),
    [code],
  )

  return <>{memoizedHighlighter}</>
}
