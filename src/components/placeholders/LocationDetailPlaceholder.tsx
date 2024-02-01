import { Placeholder } from "./Placeholder";

const LocationDetailPlaceholder = () => {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <Placeholder.Line className="!w-2/3" />
        <Placeholder.Line className="!w-1/3" />
      </div>
      <Placeholder.Card className="h-[300px]" />
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-0.5">
          <Placeholder.Line size="xs" width="lg" />
          <Placeholder.Line size="xs" width="lg" />
        </div>
      </div>
    </div>
  );
};

LocationDetailPlaceholder.displayName = "LocationDetailPlaceholder";
export { LocationDetailPlaceholder };
