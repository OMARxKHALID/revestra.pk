import SiteHeader from "@/components/site-header";
import Footer from "@/components/footer";
import cn from "@/lib/utils/cn";

const Bar = ({ className }) => (
  <div className={cn("rounded-full bg-black/5", className)} />
);

const PageSkeleton = ({ label = "Loading", grid = false }) => (
  <main className="flex min-h-svh flex-col bg-white">
    <SiteHeader />

    <section className="flex-1 px-6 pb-24 pt-12 sm:px-10 sm:pb-32 sm:pt-16">
      <div
        aria-busy="true"
        aria-live="polite"
        aria-label={label}
        className={cn(
          "mx-auto w-full motion-safe:animate-pulse",
          grid ? "max-w-[1200px]" : "max-w-[900px]"
        )}
      >
        <Bar className="h-8 w-[220px] sm:h-9" />

        {grid ? (
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <div key={index}>
                <div className="aspect-square w-full bg-black/5" />
                <Bar className="mt-5 h-3.5 w-2/3" />
                <Bar className="mt-2.5 h-3.5 w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-12 space-y-4">
            {[0, 1, 2, 3, 4].map((index) => (
              <Bar key={index} className="h-11 w-full" />
            ))}
          </div>
        )}
      </div>
    </section>

    <Footer />
  </main>
);

export default PageSkeleton;
