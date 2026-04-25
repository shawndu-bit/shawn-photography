import { Fragment } from 'react'

interface MarkdownContentProps {
  content: string
  className?: string
}

type InlinePart =
  | { type: 'text'; value: string }
  | { type: 'link'; label: string; href: string }
  | { type: 'image'; alt: string; src: string }

function parseInline(text: string): InlinePart[] {
  const parts: InlinePart[] = []
  const pattern = /!\[([^\]]*)\]\(([^)\s]+)\)|\[([^\]]+)\]\(([^)\s]+)\)/g
  let lastIndex = 0

  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0
    if (index > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, index) })
    }

    if (match[1] && match[2]) {
      parts.push({ type: 'image', alt: match[1], src: match[2] })
    } else if (match[3] && match[4]) {
      parts.push({ type: 'link', label: match[3], href: match[4] })
    }

    lastIndex = index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) })
  }

  return parts
}

function renderInline(text: string, keyPrefix: string) {
  return parseInline(text).map((part, index) => {
    const key = `${keyPrefix}-${index}`
    if (part.type === 'link') {
      return (
        <a
          key={key}
          href={part.href}
          target={part.href.startsWith('http') ? '_blank' : undefined}
          rel={part.href.startsWith('http') ? 'noopener noreferrer' : undefined}
          className="underline decoration-white/30 underline-offset-4 transition hover:decoration-white"
        >
          {part.label}
        </a>
      )
    }

    if (part.type === 'image') {
      return (
        <span key={key} className="my-4 block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          <img src={part.src} alt={part.alt} className="w-full object-cover" />
          {part.alt && <span className="block px-4 py-2 text-xs text-white/50">{part.alt}</span>}
        </span>
      )
    }

    return <Fragment key={key}>{part.value}</Fragment>
  })
}

export default function MarkdownContent({ content, className }: MarkdownContentProps) {
  const lines = content.split('\n')
  const blocks: JSX.Element[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i].trimEnd()

    if (!line.trim()) {
      i += 1
      continue
    }

    if (line.startsWith('### ')) {
      blocks.push(
        <h3 key={`h3-${i}`} className="mt-8 text-xl font-medium text-white">
          {renderInline(line.slice(4), `h3-${i}`)}
        </h3>,
      )
      i += 1
      continue
    }

    if (line.startsWith('## ')) {
      blocks.push(
        <h2 key={`h2-${i}`} className="mt-10 text-2xl font-medium text-white">
          {renderInline(line.slice(3), `h2-${i}`)}
        </h2>,
      )
      i += 1
      continue
    }

    if (line.startsWith('# ')) {
      blocks.push(
        <h1 key={`h1-${i}`} className="mt-10 text-3xl font-display text-white">
          {renderInline(line.slice(2), `h1-${i}`)}
        </h1>,
      )
      i += 1
      continue
    }

    if (line.startsWith('> ')) {
      blocks.push(
        <blockquote key={`quote-${i}`} className="my-6 border-l-2 border-white/25 pl-4 text-white/70 italic">
          {renderInline(line.slice(2), `quote-${i}`)}
        </blockquote>,
      )
      i += 1
      continue
    }

    if (line.startsWith('- ') || /^\d+\.\s+/.test(line)) {
      const items: string[] = []
      const ordered = /^\d+\.\s+/.test(line)
      while (i < lines.length) {
        const current = lines[i].trimEnd()
        if (ordered) {
          const m = current.match(/^\d+\.\s+(.*)$/)
          if (!m) break
          items.push(m[1])
        } else {
          if (!current.startsWith('- ')) break
          items.push(current.slice(2))
        }
        i += 1
      }
      const ListTag = ordered ? 'ol' : 'ul'
      blocks.push(
        <ListTag
          key={`list-${i}`}
          className={`my-5 space-y-2 pl-6 text-white/80 ${ordered ? 'list-decimal' : 'list-disc'}`}
        >
          {items.map((item, idx) => (
            <li key={`${i}-${idx}`}>{renderInline(item, `li-${i}-${idx}`)}</li>
          ))}
        </ListTag>,
      )
      continue
    }

    const paragraph: string[] = [line]
    i += 1
    while (i < lines.length && lines[i].trim().length > 0) {
      paragraph.push(lines[i])
      i += 1
    }

    blocks.push(
      <p key={`p-${i}`} className="my-5 text-base leading-8 text-white/75">
        {renderInline(paragraph.join(' '), `p-${i}`)}
      </p>,
    )
  }

  return <div className={className}>{blocks}</div>
}
