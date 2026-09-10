import cn from "@/lib/utils/cn";

const PageLayout = ({ children, className }) => (
  <div className="min-h-full w-full overflow-x-hidden bg-background p-4 sm:p-6 lg:p-8">
    <div
      className={cn(
        "mx-auto flex w-full max-w-[1600px] flex-col gap-6",
        className
      )}
    >
      {children}
    </div>
  </div>
);

export default PageLayout;
