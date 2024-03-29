import useRequireAdmin from "@/hooks/useRequireAdmin";
import { FormStepLayout } from "@/layouts/FormStepLayout";
import Link from "next/link";

const RequestsBenchmark = () => {
  useRequireAdmin();

  return (
    <FormStepLayout title="Requests benchmark" description="TODO">
      <div className="flex flex-col gap-4">
        <Link href="/admin/bench" className="link text-center">
          Back
        </Link>
      </div>
    </FormStepLayout>
  );
};

RequestsBenchmark.getInitialProps = () => {
  return { showFooter: false, showHeader: true };
};

export default RequestsBenchmark;
