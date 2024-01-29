import { Placeholder } from "./Placeholder";

const QuestDetailPlaceholder = () => {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between w-full">
        <div className="flex gap-2 items-center w-full">
          <Placeholder.Circle size="xl" />
          <Placeholder.Line width="sm" />
        </div>
        <div className="flex items-center gap-3">
          <Placeholder.Line className="!w-12" />
          <Placeholder.Line className="!w-8" />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-0.5">
          <Placeholder.Line size="xs" width="lg" />
          <Placeholder.Line size="xs" width="lg" />
        </div>
        <Placeholder.Line width="xs" />
      </div>
    </div>
  );
};

QuestDetailPlaceholder.displayName = "QuestDetailPlaceholder";
export { QuestDetailPlaceholder };
