import { Placeholder } from "./Placeholder";

const QuestDetailPlaceholder = () => {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between w-full">
        <div className="flex gap-2 items-center w-full">
          <Placeholder.Circle size="xl" />
          <Placeholder.Line width="sm" size="xs" />
        </div>
        <div className="flex items-center gap-2">
          <Placeholder.Line className="!w-12" size="xs" />
          <Placeholder.Line className="!size-4" size="sm" />
        </div>
      </div>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-0.5">
          <Placeholder.Line size="xs" width="xs" />
        </div>
        <div className="flex items-center justify-between">
          <Placeholder.Line width="xs" size="xs" />
          <Placeholder.Line className="!w-5" size="xs" />
        </div>
      </div>
    </div>
  );
};

QuestDetailPlaceholder.displayName = "QuestDetailPlaceholder";
export { QuestDetailPlaceholder };
