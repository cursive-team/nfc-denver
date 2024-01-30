import { Button } from "@/components/Button";
import Link from "next/link";

const LocalStorageBenchmark = () => {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-center">
        Local Storage Benchmark
      </h1>
      <p className="text-center text-gray-500">
        This benchmark will be implemented soonTM.
      </p>
      <Link href="/bench">
        <div className="flex flex-col items-center min-h-screen p-4 m-4 gap-4">
          <Button className="mb-4 px-6 py-3">Back</Button>
        </div>
      </Link>
    </div>
  );
};

export default LocalStorageBenchmark;
