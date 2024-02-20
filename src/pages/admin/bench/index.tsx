import { Button } from "@/components/Button";
import { FormStepLayout } from "@/layouts/FormStepLayout";
import Link from "next/link";

const BenchmarkPage = () => {
  return (
    <FormStepLayout title="Benchmarks" description="Timing different features">
      <div className="flex flex-col gap-4">
        <Link href="/admin/bench/encryption">
          <Button>Encryption</Button>
        </Link>

        <Link href="/admin/bench/requests">
          <Button>Requests</Button>
        </Link>

        <Link href="/admin/bench/local_storage">
          <Button>Local Storage</Button>
        </Link>
      </div>
    </FormStepLayout>
  );
};

export default BenchmarkPage;
