"use client";

type FormStepLayoutProps = {
  title?: string;
  description?: string;
  children: React.ReactNode;
  header?: React.ReactNode;
  onSubmit?: (event: React.FormEvent) => void;
  className?: string;
  actions?: React.ReactNode; // actions are the buttons at the bottom of the form
};

const FormStepLayout = ({
  title,
  description,
  children,
  header,
  onSubmit,
  className = "",
  actions,
}: FormStepLayoutProps) => {
  const handleSubmit = (event: React.FormEvent) => {
    if (typeof onSubmit === "function") {
      onSubmit?.(event);
    }
  };
  return (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-col w-full grow pt-4 pb-8 focus ${className}`}
    >
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-1">
          {description && (
            <span className="text-light text-xs text-gray-11 font-normal leading-4">
              {description}
            </span>
          )}
          <h3 className="font-normal leading-8 text-gray-12 text-light text-[20px]">
            {title}
          </h3>
        </div>
        {header}
      </div>
      {children && (
        <div className="flex flex-col gap-6 w-full mt-auto">{children}</div>
      )}
      {actions && (
        <div className="fixed bottom-0 right-0 left-0 bg-black-default">
          <div className="pb-6 pt-2 px-4">{actions}</div>
        </div>
      )}
    </form>
  );
};

FormStepLayout.displayName = "FormStepLayout";

export { FormStepLayout };
