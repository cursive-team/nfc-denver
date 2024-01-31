import { classed } from "@tw-classed/react";

const ProfileImage = classed.div(
  "h-32 w-32 rounded-[4px] bg-slate-200 relative overflow-hidden",
  {}
);

ProfileImage.displayName = "ProfileImage";

export { ProfileImage };
