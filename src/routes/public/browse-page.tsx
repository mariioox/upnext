import { RequestList } from "@/modules/browse/request-list"
import { BoardSidebar } from "@/modules/browse/board-sidebar"
import { PixelArrow } from "@/components/brand/pixel-arrow"

export function BrowsePage() {
  return (
    <div className="flex flex-col gap-8">
      <section className="relative -mx-4 -mt-8 overflow-hidden border-b-2 border-ink px-4 pt-9 pb-12">
        <div className="flex items-center justify-between gap-8">
          <div className="max-w-2xl">
            <p className="m-0 mb-3 font-mono text-[13px] font-semibold tracking-[0.12em] uppercase">Public feature board</p>
            <h1 className="m-0 text-[2.5rem] leading-[0.95] font-black tracking-[-0.03em] sm:text-6xl">
              What should we build next?
            </h1>
            <p className="mt-4 mb-0 max-w-lg text-[17px] leading-relaxed text-ink-muted">
              Ideas from the people who use the product. Vote for the ones you want. We build from the top of the pile.
            </p>
          </div>
          <PixelArrow fill="dither" className="hidden size-32 shrink-0 text-ink md:block" />
        </div>
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0">
          <div className="dither-50 h-1" />
          <div className="dither-25 h-1" />
          <div className="dither-06 h-1" />
        </div>
      </section>

      <div className="flex flex-wrap items-start gap-8">
        <div className="min-w-0 flex-[999_1_560px]">
          <RequestList />
        </div>
        <div className="flex-[1_1_280px]">
          <BoardSidebar />
        </div>
      </div>
    </div>
  )
}
