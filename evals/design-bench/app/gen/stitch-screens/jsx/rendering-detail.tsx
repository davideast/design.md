export default function RenderingDetail() {
  return (
    <>
      {/* TopNavBar Component */}
      <nav className="bg-neutral border-b border-line flex justify-between items-center h-12 px-edge-margin w-full sticky top-0 z-50">
      <div className="font-display text-display tracking-tighter text-ink flex-shrink-0">
                  DESIGN_BENCH_v1.0
              </div>
      <div className="flex items-center gap-lg font-label text-label hidden md:flex">
      <a className="text-ink-muted hover:text-primary transition-colors duration-150 cursor-crosshair" href="#">PROOF</a>
      <a className="text-primary border-b-2 border-primary h-12 flex items-center cursor-crosshair" href="#">SESSIONS</a>
      <a className="text-ink-muted hover:text-primary transition-colors duration-150 cursor-crosshair" href="#">ASSETS</a>
      <a className="text-ink-muted hover:text-primary transition-colors duration-150 cursor-crosshair" href="#">CALIBRATION</a>
      </div>
      <div className="flex items-center gap-sm text-primary">
      <button className="p-xs hover:bg-neutral rounded-sm transition-colors cursor-crosshair">
      <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0"}}>settings</span>
      </button>
      <button className="p-xs hover:bg-neutral rounded-sm transition-colors cursor-crosshair">
      <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0"}}>history</span>
      </button>
      </div>
      </nav>
      {/* Main Canvas */}
      <main className="flex-grow flex flex-col md:flex-row relative">
      {/* Left Side: Wayfinding & Rendering Info (Desktop) */}
      <div className="w-full md:w-[320px] bg-paper border-r border-line p-lg flex flex-col gap-lg flex-shrink-0 z-10 shadow-[2px_0_10px_rgba(0,0,0,0.05)] h-auto min-h-[calc(100vh-48px)]">
      <div className="mb-sm">
      <a className="font-label text-label text-primary hover:text-primary transition-colors flex items-center gap-xs" href="#">
      <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                          Agent Architecture — all treatments
                      </a>
      <p className="font-label text-label text-ink-muted mt-2">One real object · Stitch · Gemini 3.1 Pro · rendering 7 of 22</p>
      </div>
      <div className="bg-paper border border-line p-md rounded-none">
      <h3 className="font-label text-label text-ink mb-sm border-b border-line pb-xs">DISTANCE STATEMENT</h3>
      <p className="font-body text-body text-ink">
                          This rendering landed <span className="font-data text-data bg-neutral px-1">0.97</span> from the default look — slightly farther than its treatment's average of <span className="font-data text-data bg-neutral px-1">0.95</span>.
                      </p>
      </div>
      <div className="bg-paper border border-line p-md rounded-none flex-grow">
      <h3 className="font-label text-label text-ink mb-sm border-b border-line pb-xs">FIELD MARKS</h3>
      <ul className="space-y-sm">
      <li className="flex justify-between items-baseline border-b border-line border-dashed pb-1">
      <span className="font-label text-label text-ink">Gradients</span>
      <span className="font-data text-data text-ink-muted">none found</span>
      </li>
      <li className="flex justify-between items-baseline border-b border-line border-dashed pb-1">
      <span className="font-label text-label text-ink">Drop shadows</span>
      <span className="font-data text-data text-ink-muted">none found</span>
      </li>
      <li className="flex justify-between items-baseline border-b border-line border-dashed pb-1">
      <span className="font-label text-label text-ink">Corner Radius</span>
      <span className="font-data text-data text-ink-muted">0px</span>
      </li>
      <li className="flex justify-between items-baseline border-b border-line border-dashed pb-1">
      <span className="font-label text-label text-ink">Monochrome</span>
      <span className="font-data text-data text-primary">True</span>
      </li>
      <li className="flex justify-between items-baseline border-b border-line border-dashed pb-1">
      <span className="font-label text-label text-ink">Fidelity</span>
      <span className="font-data text-data text-ink">0.982</span>
      </li>
      </ul>
      </div>
      <div className="flex flex-col gap-sm">
      <button className="w-full bg-paper border border-ink text-ink font-label text-label py-sm px-md rounded-sm hover:bg-neutral transition-colors flex items-center justify-between">
      <span>Previous rendering</span>
      <span className="font-data text-[10px]">(6 of 22)</span>
      </button>
      <button className="w-full bg-accent-wash text-white border border-primary font-label text-label py-sm px-md rounded-sm hover:bg-primary transition-colors flex items-center justify-between shadow-sm shadow-[rgba(109,77,227,0.2)]">
      <span>Next rendering</span>
      <span className="font-data text-[10px]">(8 of 22)</span>
      </button>
      </div>
      <div className="flex flex-col gap-2 mt-auto pt-md border-t border-line">
      <a className="font-label text-label text-primary hover:text-primary transition-colors text-xs flex items-center gap-1" href="#">
      <span className="material-symbols-outlined text-[14px]">grid_view</span> See all 22 from this treatment side by side
                      </a>
      <a className="font-label text-label text-primary hover:text-primary transition-colors text-xs flex items-center gap-1" href="#">
      <span className="material-symbols-outlined text-[14px]">compare_arrows</span> See this same treatment rendered by another tool
                      </a>
      </div>
      </div>
      {/* Center Easel Area */}
      <div className="flex-grow p-xl flex flex-col items-center justify-start overflow-y-auto w-full">
      {/* Proof Sheet Container */}
      <div className="relative w-full max-w-4xl bg-paper border border-line shadow-sm mb-lg mt-md">
      {/* Crop Marks */}
      <div className="crop-mark crop-mark-tl"></div>
      <div className="crop-mark crop-mark-tr"></div>
      <div className="crop-mark crop-mark-bl"></div>
      <div className="crop-mark crop-mark-br"></div>
      {/* Color Bar */}
      <div className="color-bar hidden lg:flex">
      <div className="color-swatch bg-accent-wash"></div>
      <div className="color-swatch bg-secondary"></div>
      <div className="color-swatch bg-tertiary"></div>
      <div className="color-swatch bg-ink"></div>
      <div className="color-swatch bg-line"></div>
      </div>
      {/* Image Artifact */}
      <div className="p-lg flex justify-center bg-paper">
      <img alt="A detailed, diagram-heavy graduate computer science lecture handout." className="max-w-full h-auto border border-line opacity-90 hover:opacity-100 transition-opacity cursor-crosshair" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTMAglPbEpMxEF_TlXuiQEVyGRxn5f5fjNUgjy3dCADwqU0YPsQiT4RQ1p1iDhQqGwXdFj0lE_S6pwlIJUrQ8fOyXUJicnRKcRMGPKWt3qUZgq3aFFEWAfntomV-OhvVOyzmUKG06dntf15WZfQx3Lnfws49Agm7LhzD2VONKuQi2yjwPZZ_LpMvSxY5ocrgmtJyS3vVnUuWEWaOglfOgVE0RohY_r1Kmdj1yfpEMhKFUQp7_hom7tDXMuRIQEQmcZ74_1QZusBOhJ"/>
      </div>
      </div>
      {/* Context Below Sheet */}
      <div className="w-full max-w-4xl flex flex-col gap-md">
      <div className="bg-paper border border-line p-md">
      <p className="font-body text-body text-ink-muted leading-relaxed">
                              Generated by <span className="font-data text-data text-ink bg-paper px-1">Stitch · Gemini 3.1 Pro</span> on <span className="font-data text-data text-ink bg-paper px-1">2026-06-10</span>. The model received the shared palette and type, plus one artifact named precisely: a graduate CS lecture handout.
                          </p>
      </div>
      <div className="bg-paper border border-line p-md flex flex-col gap-sm">
      <h4 className="font-label text-label text-ink border-b border-line pb-xs w-full">THE EXACT WORDS</h4>
      <blockquote className="font-data text-data text-ink bg-paper p-sm border-l-2 border-primary">
                              "Design a UI interface representing a highly technical academic document. Focus on harsh monochrome contrast, schematic diagrammatic elements, and raw informational density. Do not round any corners. Do not use decorative gradients."
                          </blockquote>
      <p className="font-label text-label text-ink-muted mt-2">
                              Identical color and type tokens were attached to every treatment; only these words varied.
                          </p>
      </div>
      </div>
      <div className="h-xl"></div> {/* Bottom padding */}
      </div>
      </main>
    </>
  );
}
