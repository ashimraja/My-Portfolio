import { Stagger, StaggerItem } from '@/components/animations/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { useContent } from '@/content/ContentProvider'

export function EducationList() {
  const { items: education, intro: educationIntro } = useContent().content.education
  if (!education.length) return null
  return (
    <section id="education" className="section rule" aria-labelledby="edu-h">
      <div className="container-x">
        <SectionHeading index="05" kicker={educationIntro.kicker} title={educationIntro.title} />
        <span id="edu-h" className="sr-only">Education</span>
        <Stagger as="ul" className="mt-14 border-t border-border md:mt-20">
          {education.map((e) => (
            <StaggerItem as="li" key={e.school} className="grid gap-2 border-b border-border py-8 md:grid-cols-[14rem_1fr_1.2fr] md:gap-10 md:py-10">
              <p className="t-label">{e.period}</p>
              <div><h3 className="t-title-lg">{e.school}</h3><p className="mt-1 text-muted-foreground">{e.degree}</p></div>
              <p className="t-body">{e.notes}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}
