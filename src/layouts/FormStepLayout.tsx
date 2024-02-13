"use client";

import { ReactNode } from "react";

type FormStepLayoutProps = {
  title?: ReactNode;
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
  className = "",
  actions,
  ...props
}: FormStepLayoutProps) => {
  return (
    <form {...props} className={`flex flex-col w-full grow focus ${className}`}>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-1">
          {description && (
            <span className="text-light text-xs text-gray-11 font-normal leading-4">
              {description}
            </span>
          )}
          {title && (
            <>
              {typeof title === "string" ? (
                <h3 className="font-normal leading-8 text-gray-12 text-light text-[20px]">
                  {title}
                </h3>
              ) : (
                title
              )}
            </>
          )}
        </div>
        {header}
      </div>
      {children && (
        <div className="flex flex-col gap-7 w-full mt-auto mb-4">
          {children}
        </div>
      )}
      {actions && (
        <div className="sticky bottom-0 right-0 left-0 bg-black-default mt-4">
          <div className="pb-6 pt-2">{actions}</div>
        </div>
      )}
    </form>
  );
};

FormStepLayout.displayName = "FormStepLayout";

export { FormStepLayout };
