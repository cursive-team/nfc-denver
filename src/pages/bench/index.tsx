import { Button } from "@/components/Button";
import { FormStepLayout } from "@/layouts/FormStepLayout";
import Link from "next/link";

const BenchmarkPage = () => {
  return (
    <FormStepLayout title="Benchmarks" description="Timing different features">
      <div className="flex flex-col gap-4">
        <Link href="/bench/encryption">
          <Button>Encryption</Button>
        </Link>

        <Link href="/bench/psi">
          <Button>2P-PSI</Button>
        </Link>

        <Link href="/bench/requests">
          <Button>Requests</Button>
        </Link>

        <Link href="/bench/local_storage">
          <Button>Local Storage</Button>
        </Link>
      </div>
    </FormStepLayout>
  );
};

export default BenchmarkPage;
