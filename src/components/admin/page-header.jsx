import { HugeiconsIcon } from "@hugeicons/react";

const PageHeader = ({ title, description, icon, children }) => (
  <div className="space-y-5">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      {icon && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <HugeiconsIcon icon={icon} size={20} className="text-primary" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h1>

        {description && (
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {children}
    </div>
  </div>
);

export default PageHeader;
