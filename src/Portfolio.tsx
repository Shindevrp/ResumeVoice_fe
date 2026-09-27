import type { ReactNode } from 'react'

const Arrow = () => <span aria-hidden="true">↗</span>
const toolGroups = [
  { title: 'Machine learning', mark: '01', tools: ['Python', 'PyTorch', 'TensorFlow', 'Scikit-learn'] },
  { title: 'Language & voice', mark: '02', tools: ['Whisper', 'Transformers', 'Silero VAD', 'LangGraph'] },
  { title: 'Inference & deployment', mark: '03', tools: ['vLLM', 'Ollama', 'Qualcomm AI 100', 'Docker'] },
  { title: 'Applications & data', mark: '04', tools: ['FastAPI', 'AWS', 'Redis', 'Pinecone'] },
]

export default function Portfolio({ children, assistantOpen, onAssistantToggle }: {
  children: ReactNode
  assistantOpen: boolean
  onAssistantToggle: () => void
}) {
  return <div className="portfolio">
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header page-width">
      <a className="wordmark" href="#main" aria-label="Shinde Vinayak home"><span className="monogram">sv<span>.</span></span><span>SHINDE VINAYAK<span className="wordmark-sub">AI / ML ENGINEER</span></span></a>
      <nav aria-label="Main navigation"><a href="#work">Work</a><a href="#journey">Experience</a><a href="#research">Research</a><a className="nav-contact" href="mailto:shindevinayakraopatil@gmail.com">Let’s connect <Arrow /></a></nav>
    </header>
    <main id="main">
      <section className="hero hero-centered page-width">
        <div className="hero-copy">
          <div className="eyebrow"><span className="tiny-dot" /> AI ENGINEER · HYDERABAD, INDIA</div>
          <h1>Making AI<br />listen, understand,<br /><em>and respond.</em></h1>
          <p className="hero-intro">Hi, I’m <strong>Shinde Vinayak Rao Patil.</strong><br />I build real-time voice systems and intelligent applications that bring research into the real world.</p>
          <div className="hero-actions"><a className="button primary" href="#work">Explore my work <span aria-hidden="true">↓</span></a><a className="button text-link" href="/Shinde-Vinayak-Resume.pdf" download>Download résumé <Arrow /></a></div>
          <div className="hero-footnote"><span className="small-orbit" aria-hidden="true">✳</span><span>Currently building speech AI at <strong>Nabhe</strong><br /><span className="muted">M.S. Data Science · IIIT Hyderabad</span></span></div>
        </div>
      </section>
      <section className="impact-strip page-width" aria-label="Selected results from my work">
        <div><strong>9<span> languages</span></strong><p>One real-time translation platform</p></div>
        <div><strong>~300<span> ms</span></strong><p>STT → translation in production benchmarks</p></div>
        <div><strong>~350<span> ms</span></strong><p>First audio response with TASA</p></div>
        <div className="impact-note"><span className="eyebrow">FROM RESEARCH TO REALITY</span><p>Thoughtful systems.<br />Measurable impact.</p></div>
      </section>
      <section className="section page-width" id="work">
        <div className="section-heading"><div><span className="eyebrow">01 / SELECTED WORK</span><h2>Built to do <em>more.</em></h2></div><p>From multilingual speech to grounded answers.<br />A few systems I’ve helped bring to life.</p></div>
        <div className="project-grid">
          <article className="project-card project-sage"><div className="project-top"><span>01</span><span>PRODUCTION · NABHE</span></div><div className="project-visual translation-visual" aria-hidden="true"><span>hello</span><i>⇄</i><span lang="ar">مرحباً</span></div><h3>Speech without borders.</h3><p>A real-time speech translation platform for MOFA, spanning 9 languages with diplomatic terminology enforcement and dialect-aware ASR routing.</p><div className="project-result"><span>~300 ms</span> STT → MT latency</div><div className="tag-list"><span>Streaming LLMs</span><span>Qualcomm NPU</span><span>WebSocket</span></div></article>
          <article className="project-card project-peach"><div className="project-top"><span>02</span><span>PERSONAL PROJECT</span></div><div className="project-visual tasa-visual" aria-hidden="true"><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /></div><h3>TASA. A voice that keeps up.</h3><p>A fully local voice-to-voice assistant with speculative generation, overlapping TTS, and natural turn-taking. Designed for real conversations.</p><div className="project-result"><span>&lt;700 ms</span> full-response latency</div><div className="tag-list"><span>faster-whisper</span><span>vLLM / Ollama</span><span>Piper TTS</span></div></article>
          <article className="project-card project-lilac"><div className="project-top"><span>03</span><span>PERSONAL PROJECT</span></div><div className="project-visual mentor-visual" aria-hidden="true"><span>Query</span><i>→</i><span>Retrieve</span><i>→</i><span>Learn</span></div><h3>A more thoughtful AI mentor.</h3><p>A medical exam preparation assistant with specialized agents for queries, NCERT, news, and synthesis. Grounded answers with citation tracking.</p><div className="project-result"><span>~95%</span> classification accuracy</div><div className="tag-list"><span>AWS Bedrock</span><span>Claude 3</span><span>Multi-agent RAG</span></div></article>
        </div>
        <a className="inline-link" href="https://github.com/Shindevrp" target="_blank" rel="noreferrer">More of my work on GitHub <Arrow /></a>
      </section>
      <section className="journey-section section page-width" id="journey">
        <div className="journey-intro"><span className="eyebrow">02 / THE JOURNEY</span><h2>Curiosity,<br />put to <em>work.</em></h2><p>I work across the full ML lifecycle: preparing data, fine-tuning models, and making inference work in production.</p><a className="inline-link" href="/Shinde-Vinayak-Resume.pdf" target="_blank" rel="noreferrer">Read my full résumé <Arrow /></a></div>
        <div className="timeline">
          <article><div className="timeline-marker current" /><div className="role-heading"><h3>AI Engineer</h3><span>JAN 2026 — PRESENT</span></div><h4>Nabhe <span>· Subsidiary of Master Works</span></h4><p>Building multilingual, real-time speech translation. From configurable language routing to on-premises deployment on Qualcomm Cloud AI 100.</p></article>
          <article><div className="timeline-marker" /><div className="role-heading"><h3>AI Automation & AI/ML Internships</h3><span>SEP — DEC 2025</span></div><h4>Talbot Health Services & BYOL Academy</h4><p>Parallel internships delivering healthcare retrieval, agentic workflows, and a multilingual medical-preparation RAG chatbot.</p></article>
          <article><div className="timeline-marker" /><div className="role-heading"><h3>AI Developer Intern</h3><span>OCT 2023 — APR 2024</span></div><h4>Plausibility Solutions</h4><p>Built RAG pipelines with Pinecone, fine-tuned language models, and developed multi-agent orchestration systems.</p></article>
          <article><div className="timeline-marker" /><div className="role-heading"><h3>NLP Research Intern</h3><span>JUL — NOV 2023</span></div><h4>Speech Processing Lab · IIIT Hyderabad</h4><p>Explored spoken emphasis and text summarization with TEDx data, keyword extraction, and summary-generation models.</p></article>
        </div>
      </section>
      <section className="tools-section section page-width" id="tools">
        <div className="section-heading"><div><span className="eyebrow">THE TOOLKIT</span><h2>The tools behind<br /><em>the thinking.</em></h2></div><p>From a first experiment to a production system.<br />The technologies I work with along the way.</p></div>
        <div className="tools-grid">{toolGroups.map(group => <article className="tool-group" key={group.title}><span className="tool-number">{group.mark}</span><h3>{group.title}</h3><div className="tool-chips">{group.tools.map(tool => <span key={tool}>{tool}</span>)}</div></article>)}</div>
      </section>
      <section className="section page-width" id="research">
        <div className="section-heading"><div><span className="eyebrow">03 / BEYOND THE BUILD</span><h2>Always a <em>student.</em></h2></div><p>Research, open source, and the people<br />who make the work matter.</p></div>
        <div className="research-grid">
          <article className="education-card"><span className="eyebrow">EDUCATION</span><span className="education-symbol" aria-hidden="true">↗</span><h3>M.S. in Data Science</h3><p>IIIT Hyderabad</p><span className="muted">2024–2026 · CGPA 7.8</span><div className="education-divider" /><h4>B.Tech. in Computer Science</h4><p>HITAM</p><span className="muted">2020–2024 · CGPA 7.00</span></article>
          <div className="research-list"><a href="https://doi.org/10.46647/ijetms.2024.v08i03.025" target="_blank" rel="noreferrer"><span className="research-icon">01</span><div><span className="eyebrow">PUBLISHED RESEARCH · 2024</span><h3>Automated Bot Detection on Twitter</h3><p>URL patterns and learning automata · IJETMS</p></div><Arrow /></a><div className="research-row"><span className="research-icon">02</span><div><span className="eyebrow">PATENT APPLICATION</span><h3>Real-Time Violence Detection</h3><p>AI for CCTV surveillance · Application 202341029626</p></div></div><a href="https://github.com/semantica-agi/semantica" target="_blank" rel="noreferrer"><span className="research-icon">03</span><div><span className="eyebrow">OPEN SOURCE</span><h3>Semantica × CrewAI</h3><p>Knowledge-graph tools and decision intelligence · 70+ tests</p></div><Arrow /></a></div>
        </div>
      </section>
      <section className="achievements-section section page-width" id="achievements">
        <div className="section-heading"><div><span className="eyebrow">04 / ACHIEVEMENTS & LEADERSHIP</span><h2>Milestones that <em>matter.</em></h2></div><p>Recognition for the work.<br />Responsibility beyond it.</p></div>
        <div className="achievement-grid">
          <article className="achievement-card"><span className="achievement-symbol" aria-hidden="true">✧</span><strong>Top 3</strong><h3>HydPy NVIDIA</h3><p>Nemotron™ 3 Super Workshop winner.</p><span className="achievement-label">BUILDING WITH AI</span></article>
          <article className="achievement-card"><span className="achievement-symbol" aria-hidden="true">✳</span><strong>2nd <small>place</small></strong><h3>KAVACH 2023</h3><p>Recognized at the Cyber Hackathon.</p><span className="achievement-label">HACKATHON RECOGNITION</span></article>
          <article className="achievement-card"><span className="achievement-symbol" aria-hidden="true">✦</span><strong>Department <small>award</small></strong><h3>HITAM · CSE 2024</h3><p>Student of the Department Award.</p><span className="achievement-label">ACADEMIC RECOGNITION</span></article>
          <article className="achievement-card"><span className="achievement-symbol" aria-hidden="true">↗</span><strong>50+ <small>companies</small></strong><h3>IIIT Hyderabad</h3><p>Coordinated campus recruitment as Student Placement Coordinator.</p><span className="achievement-label">LEADERSHIP & COMMUNITY</span></article>
        </div>
      </section>
      <section className="contact-section page-width" id="contact"><div><span className="eyebrow">LET’S BUILD SOMETHING MEANINGFUL</span><h2>Good conversations.<br /><em>Great possibilities.</em></h2><p>Have a role, a research idea, or an interesting challenge?<br />I’d love to hear about it.</p></div><div className="contact-actions"><a className="button primary" href="mailto:shindevinayakraopatil@gmail.com">Say hello <Arrow /></a><a className="inline-link" href="https://www.linkedin.com/in/shindeaidevloper" target="_blank" rel="noreferrer">Connect on LinkedIn <Arrow /></a></div></section>
    </main>
    <footer className="site-footer page-width"><span>© {new Date().getFullYear()} Shinde Vinayak Rao Patil</span><span>Built with curiosity. Based in Hyderabad.</span><a href="#main">Back to top ↑</a></footer>
    <section className="assistant-dock" id="assistant-panel" hidden={!assistantOpen} aria-label="Resume assistant" onKeyDown={event => {
      if (event.key === 'Escape') { event.stopPropagation(); onAssistantToggle(); document.getElementById('assistant-launcher')?.focus() }
    }}>
      <div className="dock-heading"><div><span className="tiny-dot" /><strong>Talk to agent</strong><span className="dock-subtitle">Your conversation, in voice and text.</span></div></div>
      {children}
    </section>
    <button id="assistant-launcher" className="assistant-launcher talk-launcher" type="button" aria-label={assistantOpen ? 'Hang up agent call' : 'Talk to agent'} aria-expanded={assistantOpen} aria-controls="assistant-panel" onClick={onAssistantToggle} title="Talk to agent">
      {assistantOpen ? <span aria-hidden="true">×</span> : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 11.5a8 8 0 0 1-8 8H5l-3 2v-10a9 9 0 0 1 18 0Z" /><path d="M7 10v3m3-5v7m3-6v5m3-4v2" /></svg>}
      <span className="launcher-label">{assistantOpen ? 'End conversation' : 'Talk to agent'}</span>
    </button>
  </div>
}
