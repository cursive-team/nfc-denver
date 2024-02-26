import useRequireAdmin from "@/hooks/useRequireAdmin";
import { FormStepLayout } from "@/layouts/FormStepLayout";
import Link from "next/link";

const LocalStorageBenchmark = () => {
  useRequireAdmin();

  return (
    <FormStepLayout title="Local storage benchmark" description="TODO">
      <div className="flex flex-col gap-4">
        <Link href="/admin/bench" className="link text-center">
          Back
        </Link>
      </div>
    </FormStepLayout>
  );
};

LocalStorageBenchmark.getInitialProps = () => {
  return { showFooter: false, showHeader: true };
};

export default LocalStorageBenchmark;
