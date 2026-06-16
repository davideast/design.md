export default function Comparison() {
  return (
    <>
      {/* Top Navigation Anchor (Shared Component) */}
      <nav className="bg-paper flex justify-between items-center w-full px-lg h-12 border-b border-line font-label text-label tracking-widest uppercase text-ink cursor-crosshair docked full-width top-0 sticky z-50 flat no shadows">
      <div className="flex items-center gap-xl">
      <span className="font-display text-display font-bold text-ink tracking-normal normal-case">Design Bench</span>
      <div className="hidden md:flex gap-lg h-full items-center">
      <a className="text-primary border-b-2 border-primary pb-1 flex items-center h-full" href="#">All cases</a>
      <a className="text-ink-muted hover:text-ink hover:bg-neutral transition-colors flex items-center h-full px-sm" href="#">Easel</a>
      <a className="text-ink-muted hover:text-ink hover:bg-neutral transition-colors flex items-center h-full px-sm" href="#">Calibration</a>
      <a className="text-ink-muted hover:text-ink hover:bg-neutral transition-colors flex items-center h-full px-sm" href="#">Archive</a>
      </div>
      </div>
      <div className="flex items-center gap-md text-ink-muted">
      <span className="material-symbols-outlined hover:text-ink transition-colors cursor-pointer" data-icon="settings">settings</span>
      <span className="material-symbols-outlined hover:text-ink transition-colors cursor-pointer" data-icon="help">help</span>
      </div>
      </nav>
      <div className="flex flex-1 overflow-hidden">
      {/* Side Navigation Anchor (Shared Component) */}

      {/* Main Canvas */}
      <main className="flex-1 pb-xl relative mx-auto max-w-full">
      {/* Canvas Header */}
      <header className="px-xl pt-xl pb-lg shrink-0">
      <div className="flex items-center gap-sm font-label text-label tracking-widest uppercase text-ink-muted mb-lg">
      <a className="hover:text-ink flex items-center gap-xs" href="#"><span className="material-symbols-outlined text-[14px]">arrow_back</span> All cases</a>
      <span className="text-line">/</span>
      <span className="">DESIGN BENCH</span>
      <span className="text-line">/</span>
      <span className="text-ink font-semibold">CASE: AGENT ARCHITECTURE</span>
      </div>
      <div className="max-w-4xl">
      <h1 className="font-display text-display text-ink mb-md">Agent Architecture</h1>
      <p className="text-ink-muted font-body max-w-2xl">Every rendering below was asked for exactly the same thing: a seven-slide deck on agent architectures. The content never changed; only the design direction and the tool did.</p>
      </div>
      </header>
      {/* Pivot Control Canvas Strip */}
      <div className="px-xl py-md border-y border-line flex items-center gap-xl bg-paper">
      <div className="flex items-center gap-md">
      <button className="px-sm py-xs font-label text-label uppercase tracking-wider text-primary border-b-2 border-primary bg-accent-wash flex flex-col items-start text-left">
      <span className="font-bold">By design direction</span>
      <span className="text-[10px] text-primary/80 lowercase mt-0.5">Compare treatments for one tool</span>
      </button>
      <button className="px-sm py-xs font-label text-label uppercase tracking-wider text-ink-muted hover:text-ink hover:bg-neutral transition-colors flex flex-col items-start text-left">
      <span className="">By tool</span>
      <span className="text-[10px] text-ink-muted lowercase mt-0.5">Compare tools for one treatment</span>
      </button>
      </div>
      <div className="h-8 w-px bg-line"></div>
      <div className="font-data text-data text-ink-muted flex items-center gap-2">
      <span className="material-symbols-outlined text-[16px]">memory</span>
                          Tool: Stitch · Gemini 3.1 Pro
                      </div>
      </div>
      {/* Proofing Bands Container */}
      <div className="p-xl flex flex-col gap-xl">
      {/* Interaction Hint */}
      <div className="font-label text-label text-ink-muted flex items-center gap-sm">
      <span className="material-symbols-outlined text-[16px]">info</span>
                          Select any rendering to open the full 22-render detail sheet.
                      </div>
      {/* Band 1: Stitch */}
      <section className="bg-paper border border-line relative p-lg group hover:border-ink/20 transition-colors cursor-pointer">
      <div className="crop-mark-tl"></div>
      <div className="crop-mark-tr"></div>
      <div className="crop-mark-bl"></div>
      <div className="crop-mark-br"></div>
      <header className="mb-lg flex justify-between items-end border-b border-line pb-sm">
      <h2 className="font-label text-label uppercase tracking-widest text-ink font-bold">STITCH · GEMINI 3.1 PRO</h2>
      <div className="font-data text-data text-ink-muted text-[10px]">TREATMENT SET ALPHA</div>
      </header>
      <div className="flex gap-md w-max">
      {/* Cell 1 */}
      <div className="w-64 flex flex-col gap-sm">
      <div className="aspect-video bg-paper border border-line relative overflow-hidden" data-alt="A highly detailed, professional UI design presentation slide showing a plain text outline about AI agent architectures. The aesthetic is extremely bare-bones and default, lacking any visual styling, resembling a plain white document with black Arial text. High contrast, sterile, corporate tech aesthetic.">
      {/* Image Placeholder */}
      <div className="absolute inset-0 bg-line/20 flex items-center justify-center font-data text-ink/30 text-xs">RENDER_00</div>
      </div>
      <div>
      <h3 className="font-label text-label font-semibold text-ink">No direction</h3>
      <p className="font-body text-sm text-ink-muted mt-1 min-h-[44px]">The brief alone</p>
      </div>
      <div className="flex justify-between items-center border-t border-line pt-2 mt-auto">
      <span className="font-label text-[10px] uppercase text-ink-muted">Distance</span>
      <span className="font-data text-data text-ink">0.00</span>
      </div>
      </div>
      {/* Cell 2 */}
      <div className="w-64 flex flex-col gap-sm">
      <div className="aspect-video bg-paper border border-line relative overflow-hidden" data-alt="A UI design presentation slide about agent architectures, showing basic application of a color palette. The slide features deep blues and subtle grays, with a clean sans-serif typography hierarchy. The layout remains simple and list-based, but looks slightly more polished than a default document. Professional, corporate, neat.">
      <div className="absolute inset-0 bg-line/20 flex items-center justify-center font-data text-ink/30 text-xs">RENDER_01</div>
      </div>
      <div>
      <h3 className="font-label text-label font-semibold text-ink">Tokens only</h3>
      <p className="font-body text-sm text-ink-muted mt-1 min-h-[44px]">Shared palette and type only</p>
      </div>
      <div className="flex justify-between items-center border-t border-line pt-2 mt-auto">
      <span className="font-label text-[10px] uppercase text-ink-muted">Distance</span>
      <span className="font-data text-data text-ink">0.18</span>
      </div>
      </div>
      {/* Cell 3 */}
      <div className="w-64 flex flex-col gap-sm">
      <div className="aspect-video bg-paper border border-line relative overflow-hidden" data-alt="A refined presentation slide discussing AI agents, designed with a scholarly, print-like aesthetic. It features a muted, off-white background resembling fine paper, with elegant serif typography and generous margins. The layout looks more like a page from an academic journal than a standard slide deck. Restrained, intellectual mood.">
      <div className="absolute inset-0 bg-line/20 flex items-center justify-center font-data text-ink/30 text-xs">RENDER_02</div>
      </div>
      <div>
      <h3 className="font-label text-label font-semibold text-ink">Adjectives</h3>
      <p className="font-body text-sm text-ink-muted mt-1 min-h-[44px]">Plus an adjective description (scholarly, restrained, print-like)</p>
      </div>
      <div className="flex justify-between items-center border-t border-line pt-2 mt-auto">
      <span className="font-label text-[10px] uppercase text-ink-muted">Distance</span>
      <span className="font-data text-data text-ink">0.31</span>
      </div>
      </div>
      {/* Cell 4 */}
      <div className="w-64 flex flex-col gap-sm relative">
      {/* Highlight Box */}
      <div className="absolute -inset-2 border border-primary bg-primary/5 pointer-events-none z-10 hidden group-hover:block">
      <div className="absolute -top-2 -right-2 bg-primary text-paper font-data text-[9px] px-1">+0.64 shift</div>
      </div>
      <div className="aspect-video bg-paper border border-line relative overflow-hidden" data-alt="A presentation slide that looks exactly like a photocopied graduate computer science lecture handout. It features dense, diagram-heavy content with slightly degraded contrast mimicking a xerox copy. The text is dense, with subtle artifacts and a layout that implies it should be written on. Highly technical, academic, raw aesthetic.">
      <div className="absolute inset-0 bg-line/20 flex items-center justify-center font-data text-ink/30 text-xs">RENDER_03</div>
      </div>
      <div>
      <h3 className="font-label text-label font-semibold text-primary">One real object</h3>
      <p className="font-body text-sm text-ink-muted mt-1 min-h-[44px]">Plus one named artifact, a graduate CS lecture handout</p>
      </div>
      <div className="flex justify-between items-center border-t border-primary/30 pt-2 mt-auto">
      <span className="font-label text-[10px] uppercase text-primary">Distance</span>
      <span className="font-data text-data text-primary font-bold">0.95</span>
      </div>
      </div>
      {/* Cell 5 */}
      <div className="w-64 flex flex-col gap-sm">
      <div className="aspect-video bg-paper border border-line relative overflow-hidden" data-alt="A stark, high-contrast presentation slide on AI architectures designed entirely in black and white. There are no subtle grays or gradients; graphics are bold, chunky, and purely monochromatic to ensure they survive a bad photocopy process. The layout is blocky and utilitarian. Industrial, functional, brutalist vibe.">
      <div className="absolute inset-0 bg-line/20 flex items-center justify-center font-data text-ink/30 text-xs">RENDER_04</div>
      </div>
      <div>
      <h3 className="font-label text-label font-semibold text-ink">One hard constraint</h3>
      <p className="font-body text-sm text-ink-muted mt-1 min-h-[44px]">Everything must survive photocopying</p>
      </div>
      <div className="flex justify-between items-center border-t border-line pt-2 mt-auto">
      <span className="font-label text-[10px] uppercase text-ink-muted">Distance</span>
      <span className="font-data text-data text-ink">0.71</span>
      </div>
      </div>
      {/* Cell 6 */}
      <div className="w-64 flex flex-col gap-sm">
      <div className="aspect-video bg-paper border border-line relative overflow-hidden" data-alt="A slide design mimicking a professor's notebook page. The background resembles lined or grid paper with subtle texture. The content about agent architectures is arranged organically, perhaps with some elements looking handwritten or sketched out like chalk on a board or pen on paper. Intimate, academic, informal.">
      <div className="absolute inset-0 bg-line/20 flex items-center justify-center font-data text-ink/30 text-xs">RENDER_05</div>
      </div>
      <div>
      <h3 className="font-label text-label font-semibold text-ink">One governing metaphor</h3>
      <p className="font-body text-sm text-ink-muted mt-1 min-h-[44px]">Each slide a page from a professor's notebook</p>
      </div>
      <div className="flex justify-between items-center border-t border-line pt-2 mt-auto">
      <span className="font-label text-[10px] uppercase text-ink-muted">Distance</span>
      <span className="font-data text-data text-ink">0.66</span>
      </div>
      </div>
      {/* Cell 7 */}
      <div className="w-64 flex flex-col gap-sm">
      <div className="aspect-video bg-paper border border-line relative overflow-hidden" data-alt="An incredibly complex and detailed presentation slide that looks like a final product from a high-end design agency. It features intricate micro-interactions implied in the static image, complex data visualizations regarding agent architecture, perfect alignment, and a sophisticated dark mode color palette. Elite, polished, hyper-professional.">
      <div className="absolute inset-0 bg-line/20 flex items-center justify-center font-data text-ink/30 text-xs">RENDER_06</div>
      </div>
      <div>
      <h3 className="font-label text-label font-semibold text-ink">Full specification</h3>
      <p className="font-body text-sm text-ink-muted mt-1 min-h-[44px]">The complete designer-grade spec</p>
      </div>
      <div className="flex justify-between items-center border-t border-line pt-2 mt-auto">
      <span className="font-label text-[10px] uppercase text-ink-muted">Distance</span>
      <span className="font-data text-data text-ink">1.02</span>
      </div>
      </div>
      </div>
      </section>
      {/* Band 2: Gemini Direct */}
      <section className="bg-paper border border-line relative p-lg group hover:border-ink/20 transition-colors cursor-pointer">
      <div className="crop-mark-tl"></div>
      <div className="crop-mark-tr"></div>
      <div className="crop-mark-bl"></div>
      <div className="crop-mark-br"></div>
      <header className="mb-lg flex justify-between items-end border-b border-line pb-sm">
      <h2 className="font-label text-label uppercase tracking-widest text-ink font-bold">GEMINI 3.1 PRO · DIRECT</h2>
      <div className="font-data text-data text-ink-muted text-[10px]">TREATMENT SET BETA</div>
      </header>
      <div className="flex gap-md w-max">
      {/* Cell 1 */}
      <div className="w-64 flex flex-col gap-sm">
      <div className="aspect-video bg-paper border border-line relative overflow-hidden" data-alt="A standard, somewhat generic presentation slide generated directly by an AI without specific design prompting. It features a basic bulleted list about agent architectures on a plain white background with standard blue headings. It lacks personality or strong visual hierarchy. Mundane, typical, uninspired.">
      <div className="absolute inset-0 bg-line/20 flex items-center justify-center font-data text-ink/30 text-xs">RENDER_07</div>
      </div>
      <div>
      <h3 className="font-label text-label font-semibold text-ink">No direction</h3>
      <p className="font-body text-sm text-ink-muted mt-1 min-h-[44px]">The brief alone</p>
      </div>
      <div className="flex justify-between items-center border-t border-line pt-2 mt-auto">
      <span className="font-label text-[10px] uppercase text-ink-muted">Distance</span>
      <span className="font-data text-data text-ink">0.00</span>
      </div>
      </div>
      {/* Cell 2 */}
      <div className="w-64 flex flex-col gap-sm">
      <div className="aspect-video bg-paper border border-line relative overflow-hidden" data-alt="A slide showing a slightly more colorful approach to agent architectures, utilizing a specific color palette but still retaining a rigid, automated feel. The text is constrained to standard text boxes, and the colors feel somewhat arbitrarily applied to headers and bullet points rather than integrated into a holistic design.">
      <div className="absolute inset-0 bg-line/20 flex items-center justify-center font-data text-ink/30 text-xs">RENDER_08</div>
      </div>
      <div>
      <h3 className="font-label text-label font-semibold text-ink">Tokens only</h3>
      <p className="font-body text-sm text-ink-muted mt-1 min-h-[44px]">Shared palette and type only</p>
      </div>
      <div className="flex justify-between items-center border-t border-line pt-2 mt-auto">
      <span className="font-label text-[10px] uppercase text-ink-muted">Distance</span>
      <span className="font-data text-data text-ink">0.21</span>
      </div>
      </div>
      {/* Cell 3 */}
      <div className="w-64 flex flex-col gap-sm">
      <div className="aspect-video bg-paper border border-line relative overflow-hidden" data-alt="An attempt at a 'scholarly' slide design by a raw AI model. It features perhaps too literal an interpretation, maybe adding an unnecessary graphic of an old book or a quill alongside the text about agent architectures. The typography attempts to be serif but feels slightly mismatched. Slightly awkward, literal interpretation.">
      <div className="absolute inset-0 bg-line/20 flex items-center justify-center font-data text-ink/30 text-xs">RENDER_09</div>
      </div>
      <div>
      <h3 className="font-label text-label font-semibold text-ink">Adjectives</h3>
      <p className="font-body text-sm text-ink-muted mt-1 min-h-[44px]">Plus an adjective description (scholarly, restrained, print-like)</p>
      </div>
      <div className="flex justify-between items-center border-t border-line pt-2 mt-auto">
      <span className="font-label text-[10px] uppercase text-ink-muted">Distance</span>
      <span className="font-data text-data text-ink">0.35</span>
      </div>
      </div>
      {/* Cell 4 */}
      <div className="w-64 flex flex-col gap-sm">
      <div className="aspect-video bg-paper border border-line relative overflow-hidden" data-alt="A highly literal interpretation of a 'CS lecture handout' slide. It looks like a scanned piece of paper with text awkwardly overlaid. It features dense blocks of text and perhaps a crude diagram of agent architecture. It captures the 'messiness' but lacks the structural intent of a true designer's work. Cluttered, unrefined.">
      <div className="absolute inset-0 bg-line/20 flex items-center justify-center font-data text-ink/30 text-xs">RENDER_10</div>
      </div>
      <div>
      <h3 className="font-label text-label font-semibold text-ink">One real object</h3>
      <p className="font-body text-sm text-ink-muted mt-1 min-h-[44px]">Plus one named artifact, a graduate CS lecture handout</p>
      </div>
      <div className="flex justify-between items-center border-t border-line pt-2 mt-auto">
      <span className="font-label text-[10px] uppercase text-ink-muted">Distance</span>
      <span className="font-data text-data text-ink">0.88</span>
      </div>
      </div>
      {/* Cell 5 */}
      <div className="w-64 flex flex-col gap-sm">
      <div className="aspect-video bg-paper border border-line relative overflow-hidden" data-alt="A slide designed to survive photocopying. It features extremely thick, harsh borders and very large, bold text. All subtlety is lost. It looks more like a warning sign or a very old web page printed out than a presentation slide about agent architectures. Brutally simplistic.">
      <div className="absolute inset-0 bg-line/20 flex items-center justify-center font-data text-ink/30 text-xs">RENDER_11</div>
      </div>
      <div>
      <h3 className="font-label text-label font-semibold text-ink">One hard constraint</h3>
      <p className="font-body text-sm text-ink-muted mt-1 min-h-[44px]">Everything must survive photocopying</p>
      </div>
      <div className="flex justify-between items-center border-t border-line pt-2 mt-auto">
      <span className="font-label text-[10px] uppercase text-ink-muted">Distance</span>
      <span className="font-data text-data text-ink">0.68</span>
      </div>
      </div>
      {/* Cell 6 */}
      <div className="w-64 flex flex-col gap-sm">
      <div className="aspect-video bg-paper border border-line relative overflow-hidden" data-alt="A slide attempting a 'professor's notebook' metaphor. It might feature a prominent, perhaps cliché, spiral binding graphic on the side or a highly textured 'paper' background that overwhelms the actual content about agent architectures. The metaphor feels tacked on rather than structural.">
      <div className="absolute inset-0 bg-line/20 flex items-center justify-center font-data text-ink/30 text-xs">RENDER_12</div>
      </div>
      <div>
      <h3 className="font-label text-label font-semibold text-ink">One governing metaphor</h3>
      <p className="font-body text-sm text-ink-muted mt-1 min-h-[44px]">Each slide a page from a professor's notebook</p>
      </div>
      <div className="flex justify-between items-center border-t border-line pt-2 mt-auto">
      <span className="font-label text-[10px] uppercase text-ink-muted">Distance</span>
      <span className="font-data text-data text-ink">0.62</span>
      </div>
      </div>
      {/* Cell 7 */}
      <div className="w-64 flex flex-col gap-sm">
      <div className="aspect-video bg-paper border border-line relative overflow-hidden" data-alt="An over-designed, somewhat chaotic slide resulting from feeding a full designer specification directly to a model without an intermediary agent. It attempts to apply every rule at once, resulting in conflicting alignments, mismatched font sizes, and a 'kitchen sink' approach to visualizing agent architecture. Complex but incoherent.">
      <div className="absolute inset-0 bg-line/20 flex items-center justify-center font-data text-ink/30 text-xs">RENDER_13</div>
      </div>
      <div>
      <h3 className="font-label text-label font-semibold text-ink">Full specification</h3>
      <p className="font-body text-sm text-ink-muted mt-1 min-h-[44px]">The complete designer-grade spec</p>
      </div>
      <div className="flex justify-between items-center border-t border-line pt-2 mt-auto">
      <span className="font-label text-[10px] uppercase text-ink-muted">Distance</span>
      <span className="font-data text-data text-ink">0.98</span>
      </div>
      </div>
      </div>
      </section>
      {/* Explanatory & Insight Footer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-xl mt-lg max-w-5xl">
      {/* Left Col */}
      <div className="space-y-lg">
      <div className="bg-paper border border-line p-md">
      <p className="font-body text-sm text-ink">Each band's distances are measured from that tool's own default look, so they compare down a band but not across bands. To compare one treatment across tools, switch to "By tool," which uses fidelity instead.</p>
      </div>
      <div className="space-y-sm">
      <h4 className="font-label text-label uppercase tracking-widest text-ink font-bold border-b border-line pb-xs inline-block">How to read the numbers</h4>
      <dl className="space-y-xs font-body text-sm">
      <div className="grid grid-cols-[100px_1fr] gap-4">
      <dt className="text-ink font-semibold">Default look</dt>
      <dd className="text-ink-muted">The output when provided only the raw content brief with zero stylistic guidance.</dd>
      </div>
      <div className="grid grid-cols-[100px_1fr] gap-4">
      <dt className="text-ink font-semibold">Distance</dt>
      <dd className="text-ink-muted">Vector displacement from the default look within a tool's latent space (0.0 to 2.0).</dd>
      </div>
      <div className="grid grid-cols-[100px_1fr] gap-4">
      <dt className="text-ink font-semibold">Fidelity</dt>
      <dd className="text-ink-muted">Structural adherence to a gold-standard benchmark specification.</dd>
      </div>
      </dl>
      </div>
      </div>
      {/* Right Col (Insight) */}
      <div className="bg-neutral p-lg border-l-4 border-primary">
      <h4 className="font-label text-label uppercase tracking-widest text-primary font-bold mb-md">THE SENTENCE THAT MOVED IT 0.64</h4>
      <blockquote className="font-display text-xl text-ink mb-md leading-relaxed">
                                  "Each slide looks like a single page of a graduate CS lecture handout — photocopied that morning, diagram-heavy, one teacher's voice, designed to be followed with a pen in hand."
                              </blockquote>
      <p className="font-body text-sm text-ink-muted italic">
                                  "The model was never told 'no dark theme, no icon bullets' — the handout implies all of it."
                              </p>
      </div>
      </div>
      </div>
      {/* Certification Block */}
      <footer className="mt-auto px-xl py-lg border-t border-line bg-paper mt-xl">
      <div className="font-data text-[10px] text-ink-muted uppercase tracking-widest flex flex-wrap gap-x-4 gap-y-2">
      <span className="">STITCH · GEMINI 3.1 PRO</span>
      <span className="text-line">//</span>
      <span className="">GEMINI 3.1 PRO · DIRECT</span>
      <span className="text-line">·</span>
      <span className="">22 RENDERINGS PER TREATMENT PER TOOL</span>
      <span className="text-line">·</span>
      <span className="">DEFINITIONS HASH 5D7280C55EE4</span>
      <span className="text-line">·</span>
      <span className="">MEASURED 2026-06-10</span>
      </div>
      </footer>
      </main>
      </div>
    </>
  );
}
