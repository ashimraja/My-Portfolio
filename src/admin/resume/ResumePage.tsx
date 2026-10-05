import type { CSSProperties } from 'react'
import type { ResumeData, TemplateId } from './model'
import { ClassicDocument } from './templates/ClassicDocument'
import { SidebarDocument } from './templates/SidebarDocument'
import { HarvardDocument, LatexDocument, TwoColumnDocument } from './templates/ExtraDocuments'
import './resume.css'

/** Registry of layouts. Adding a template = a new Document component + one line here. */
export const templates: Record<TemplateId, { label: string; padding: string; sidebar?: boolean; Document: (p: { data: ResumeData }) => React.ReactElement }> = {
  classic: { label: 'Classic — single column, ATS-friendly', padding: '0 15mm', Document: ClassicDocument },
  sidebar: { label: 'Sidebar — coloured side panel with skill bars', padding: '0 14mm 0 79mm', sidebar: true, Document: SidebarDocument },
  latex: { label: 'LaTeX — serif, small-caps headings (popular with engineers)', padding: '0 16mm', Document: LatexDocument },
  harvard: { label: 'Harvard — Times, centred header, ruled headings', padding: '0 17mm', Document: HarvardDocument },
  twocol: { label: 'Two-column — compact engineer CV, coloured name', padding: '0 14mm', Document: TwoColumnDocument },
}
export const templateOptions = Object.keys(templates) as TemplateId[]

/**
 * One A4-wide page frame, used for the on-screen preview AND for printing.
 * The empty <thead>/<tfoot> rows give every printed page its top/bottom margin (page margin itself is 0).
 */
export function ResumePage({ data }: { data: ResumeData }) {
  const t = templates[data.template] ?? templates.classic
  const Doc = t.Document
  return (
    <div className="r-page" style={{ '--rs-color': data.color || '#0b4a3a' } as CSSProperties}>
      {t.sidebar && <div className="rs-bg" aria-hidden />}
      <table className="r-print-table">
        <thead><tr><td className="r-margin" /></tr></thead>
        <tbody><tr><td className="r-body" style={{ padding: t.padding }}><Doc data={data} /></td></tr></tbody>
        <tfoot><tr><td className="r-margin" /></tr></tfoot>
      </table>
    </div>
  )
}
