import { Button } from "@/components/Button";
import { FormStepLayout } from "@/layouts/FormStepLayout";
import Link from "next/link";

const BenchmarkPage = () => {
  return (
    <FormStepLayout
      title="Benchmarks"
      description="Timing different features"
      actions={
        <div className="flex flex-col gap-4">
          <Link href="/admin/bench/encryption">
            <Button>Encryption</Button>
          </Link>
          <Button disabled={true}>Local Storage</Button>
          <Button disabled={true}>Requests</Button>
          <Link href="/admin" className="link text-center">
            Back
          </Link>
        </div>
      }
    >
      <></>
    </FormStepLayout>
  );
};

BenchmarkPage.getInitialProps = () => {
  return { showFooter: false, showHeader: true };
};

export default BenchmarkPage;
