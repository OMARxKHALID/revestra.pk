import SiteHeader from "@/components/site-header";
import Loader from "@/components/ui/loader";

const PageLoader = ({ label = "Loading" }) => (
  <main id="main" className="flex min-h-svh flex-col bg-white">
    <SiteHeader />

    <section className="flex flex-1 items-center justify-center px-6 sm:px-10">
      <Loader label={label} />
    </section>
  </main>
);

export default PageLoader;
