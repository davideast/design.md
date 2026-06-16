export default function Home() {
  return (
    <>
      {/* TopNavBar Shared Component */}
      <nav className="bg-paper fixed top-0 w-full z-50 h-12 border-b border-line flat no shadows flex justify-between items-center px-lg w-full max-w-full">
      <div className="flex items-center gap-xl">
      <div className="font-display text-display uppercase tracking-tight text-ink">Design Bench</div>
      <div className="hidden md:flex gap-md">
      <a className="font-label text-label text-ink-muted pb-1 hover:text-primary transition-colors duration-150 cursor-pointer active:opacity-80" href="#">New case</a>
      <a className="font-label text-label text-primary border-b-2 border-primary pb-1 hover:text-primary transition-colors duration-150 cursor-pointer active:opacity-80" href="#">All measurements</a>
      <a className="font-label text-label text-ink-muted pb-1 hover:text-primary transition-colors duration-150 cursor-pointer active:opacity-80" href="#">Settings</a>
      </div>
      </div>
      <div className="flex items-center gap-md text-primary">
      <span className="material-symbols-outlined cursor-pointer active:opacity-80 hover:text-primary transition-colors duration-150">account_circle</span>
      <span className="material-symbols-outlined cursor-pointer active:opacity-80 hover:text-primary transition-colors duration-150">help</span>
      </div>
      </nav>
      {/* Header Section */}
      <header className="max-w-6xl mx-auto px-lg pt-xl pb-lg w-full">
      <h1 className="font-display text-display text-ink mb-sm">Design Bench</h1>
      <p className="font-body text-body text-ink-muted max-w-3xl">Test and compare how AI design tools render the same brief — generate across tools, measure each against the direction it was handed, and check the results side by side.</p>
      </header>
      {/* Main Easel Content */}
      <main className="flex-grow max-w-6xl mx-auto px-lg pb-xl w-full flex flex-col md:flex-row gap-lg">
      {/* Color Bar Side Panel (Simulating Proofer Tray/Strip) */}
      <aside className="hidden md:flex flex-col gap-xs pt-xl">
      <div className="border border-line bg-paper p-xs">
      <div className="color-patch bg-ink"></div>
      <div className="color-patch bg-primary"></div>
      <div className="color-patch bg-secondary"></div>
      <div className="color-patch bg-tertiary"></div>
      <div className="color-patch bg-line"></div>
      <div className="color-patch bg-paper border-t border-line mt-xs"></div>
      </div>
      <div className="font-data text-data text-[8px] text-ink-muted text-center mt-xs">CMYK<br/>REF</div>
      </aside>
      {/* Grid of Proof Sheets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-xl w-full pt-md relative">
      {/* Case 1 */}
      <article className="bg-paper border border-line relative p-lg group hover:border-primary transition-colors duration-200 cursor-pointer">
      <div className="crop-mark-tl"></div><div className="crop-mark-tr"></div>
      <div className="crop-mark-bl"></div><div className="crop-mark-br"></div>
      <div className="flex justify-between items-start mb-md">
      <div>
      <h2 className="font-label text-label text-ink uppercase tracking-widest">Case 01</h2>
      <h3 className="font-display text-[20px] font-semibold text-ink mt-xs">Agent Architecture</h3>
      </div>
      <span className="font-data text-data text-ink-muted">1844x912</span>
      </div>
      <p className="font-body text-body text-ink-muted mb-md">A seven-slide technical talk on AI agent loops.</p>
      <div className="aspect-video bg-neutral border border-line mb-md flex items-center justify-center relative overflow-hidden" data-alt="A highly detailed, starkly minimalist presentation slide layout for a technical talk about AI agent architectures. The aesthetic is clean, monochrome, light-mode prepress style with exact grids, precise typography in dark ink against pristine white paper backgrounds. Thin crop marks and subtle structural lines define the layout blocks.">
      <span className="font-data text-data text-ink-muted absolute">THUMBNAIL_A</span>
      </div>
      <div className="border-t border-line pt-sm flex flex-col gap-xs">
      <span className="font-label text-label text-ink uppercase">Result Analysis</span>
      <p className="font-body text-body text-ink">Naming one real object, a graduate CS lecture handout, moved results <span className="font-data text-data bg-accent-wash text-primary px-1">0.64</span> farther from the model's default look than adjectives did.</p>
      </div>
      </article>
      {/* Case 2 */}
      <article className="bg-paper border border-line relative p-lg group hover:border-primary transition-colors duration-200 cursor-pointer">
      <div className="crop-mark-tl"></div><div className="crop-mark-tr"></div>
      <div className="crop-mark-bl"></div><div className="crop-mark-br"></div>
      <div className="flex justify-between items-start mb-md">
      <div>
      <h2 className="font-label text-label text-ink uppercase tracking-widest">Case 02</h2>
      <h3 className="font-display text-[20px] font-semibold text-ink mt-xs">Auralis</h3>
      </div>
      <span className="font-data text-data text-ink-muted">1844x912</span>
      </div>
      <p className="font-body text-body text-ink-muted mb-md">A marketing site for an AI voice platform.</p>
      <div className="aspect-video bg-neutral border border-line mb-md flex items-center justify-center relative overflow-hidden" data-alt="A highly structured, high-contrast, light-mode user interface rendering of an audio software dashboard. The UI is composed of sharp rectangular containers, distinct hairline borders, and neutral gray backgrounds with stark white content areas. A subtle waveform graphic in faint purple adds technical flavor without breaking the austere, prepress-contract aesthetic.">
      <span className="font-data text-data text-ink-muted absolute">THUMBNAIL_B</span>
      </div>
      <div className="border-t border-line pt-sm flex flex-col gap-xs">
      <span className="font-label text-label text-ink uppercase">Result Analysis</span>
      <p className="font-body text-body text-ink">The object grounding outperformed adjectives by <span className="font-data text-data bg-accent-wash text-primary px-1">0.36</span> across 18 renderings.</p>
      </div>
      </article>
      {/* Case 3 */}
      <article className="bg-paper border border-line relative p-lg group hover:border-primary transition-colors duration-200 cursor-pointer">
      <div className="crop-mark-tl"></div><div className="crop-mark-tr"></div>
      <div className="crop-mark-bl"></div><div className="crop-mark-br"></div>
      <div className="flex justify-between items-start mb-md">
      <div>
      <h2 className="font-label text-label text-ink uppercase tracking-widest">Case 03</h2>
      <h3 className="font-display text-[20px] font-semibold text-ink mt-xs">DC Tracks</h3>
      </div>
      <span className="font-data text-data text-ink-muted">1844x912</span>
      </div>
      <p className="font-body text-body text-ink-muted mb-md">An editorial music publication for Washington, DC.</p>
      <div className="aspect-video bg-neutral border border-line mb-md flex items-center justify-center relative overflow-hidden" data-alt="A strict, gridded layout for an editorial magazine spread viewed on a bright, light-mode screen. The composition relies on rigid typography blocks, crisp white backgrounds, and hairline gray dividers typical of a proofing station output. Thin, sharp black borders enclose structural columns meant for dense text and stark, high-contrast imagery.">
      <span className="font-data text-data text-ink-muted absolute">THUMBNAIL_C</span>
      </div>
      <div className="border-t border-line pt-sm flex flex-col gap-xs">
      <span className="font-label text-label text-ink uppercase">Result Analysis</span>
      <p className="font-body text-body text-ink">The metaphor grounding led adjectives by <span className="font-data text-data bg-accent-wash text-primary px-1">0.21</span> across 42 renderings.</p>
      </div>
      </article>
      {/* Case 4 */}
      <article className="bg-paper border border-line relative p-lg group hover:border-primary transition-colors duration-200 cursor-pointer">
      <div className="crop-mark-tl"></div><div className="crop-mark-tr"></div>
      <div className="crop-mark-bl"></div><div className="crop-mark-br"></div>
      <div className="flex justify-between items-start mb-md">
      <div>
      <h2 className="font-label text-label text-ink uppercase tracking-widest flex items-center gap-xs">Case 04 <span className="w-2 h-2 bg-accent-wash block animate-pulse"></span></h2>
      <h3 className="font-display text-[20px] font-semibold text-ink mt-xs">Urban Nocturnal Field Guide</h3>
      </div>
      <span className="font-data text-data text-ink-muted">1844x912</span>
      </div>
      <p className="font-body text-body text-ink-muted mb-md">A field-notes site for night birding in the city.</p>
      <div className="aspect-video bg-neutral border border-line border-dashed mb-md flex flex-col items-center justify-center relative overflow-hidden">
      <span className="material-symbols-outlined text-ink-muted mb-xs">hourglass_empty</span>
      <span className="font-data text-data text-ink-muted text-center">AWAITING_RENDER</span>
      </div>
      <div className="border-t border-line pt-sm flex flex-col gap-xs">
      <span className="font-label text-label text-ink uppercase">Result Analysis</span>
      <p className="font-body text-body text-ink italic text-ink-muted">Newest case; measurement in progress.</p>
      </div>
      </article>
      </div>
      </main>
      {/* Spec Sheet / How to Read Section */}
      <section className="max-w-6xl mx-auto px-lg pb-xl w-full">
      <div className="bg-paper border border-line p-lg relative">
      <div className="crop-mark-tl"></div><div className="crop-mark-tr"></div>
      <div className="crop-mark-bl"></div><div className="crop-mark-br"></div>
      <h3 className="font-label text-label text-ink uppercase tracking-widest border-b border-line pb-xs mb-md">Reference // How to read</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
      <div>
      <span className="font-data text-data text-ink-muted block mb-xs">TERM: TREATMENT</span>
      <p className="font-body text-body text-ink text-sm">The specific prompting strategy applied to the model (e.g., using conceptual metaphors vs. direct adjectives).</p>
      </div>
      <div>
      <span className="font-data text-data text-ink-muted block mb-xs">TERM: DEFAULT LOOK</span>
      <p className="font-body text-body text-ink text-sm">The baseline visual output a tool produces when given a generic task without stylistic constraints.</p>
      </div>
      <div>
      <span className="font-data text-data text-ink-muted block mb-xs">TERM: ADJECTIVES</span>
      <p className="font-body text-body text-ink text-sm">The standard approach of describing desired styles using descriptive words (e.g., "clean, modern, minimalist").</p>
      </div>
      </div>
      </div>
      </section>
      {/* Footer Actions */}
      <footer className="max-w-6xl mx-auto px-lg pb-xl pt-md w-full flex justify-between items-center border-t border-line">
      <a className="font-label text-label text-primary hover:text-ink transition-colors flex items-center gap-xs" href="#">
      <span className="material-symbols-outlined text-[16px]">add_box</span>
                  Start a new case from a spark
              </a>
      <a className="font-label text-label text-primary hover:text-ink transition-colors flex items-center gap-xs" href="#">
      <span className="material-symbols-outlined text-[16px]">list_alt</span>
                  All measurements
              </a>
      </footer>
    </>
  );
}
