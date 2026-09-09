"use client";

const GlobalError = ({ reset }) => (
  <html lang="en">
    <body className="bg-white text-black antialiased">
      <main className="flex min-h-svh items-center justify-center px-6 text-center">
        <div className="max-w-[46ch]">
          <h1 className="text-[30px] leading-[1.15]">Something went wrong</h1>

          <p className="mt-5 text-sm leading-relaxed text-black/70">
            The application failed to start. Reload the page, or try again in a
            moment.
          </p>

          <button
            type="button"
            onClick={reset}
            className="mt-10 rounded-full bg-black px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-white"
          >
            Reload
          </button>
        </div>
      </main>
    </body>
  </html>
);

export default GlobalError;
