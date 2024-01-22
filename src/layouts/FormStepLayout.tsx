"use client";

type FormStepLayoutProps = {
  title?: string;
  description?: string;
  children: React.ReactNode;
  header?: React.ReactNode;
  onSubmit?: (event: React.FormEvent) => void;
  className?: string;
};

const FormStepLayout = ({
  title,
  description,
  children,
  header,
  onSubmit,
  className,
}: FormStepLayoutProps) => {
  const handleSubmit = (event: React.FormEvent) => {
    if (typeof onSubmit === "function") {
      onSubmit?.(event);
    }
  };
  return (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-col justify-between grow pt-4 pb-8 py-4 focus ${className}`}
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
      <div className="flex flex-col gap-6">{children}</div>
    </form>
  );
};

FormStepLayout.displayName = "FormStepLayout";

export { FormStepLayout };
