interface ListLayoutProps {
  label: string;
  children?: React.ReactNode;
  className?: string;
}

const ListLayout = ({ label, children, className }: ListLayoutProps) => {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <span className="text-gray-10 font-light text-xs">{label}</span>
      <div>{children}</div>
    </div>
  );
};

ListLayout.displayName = "ListLayout";
export { ListLayout };
