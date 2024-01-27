import { Button } from "@/components/Button";
import Link from "next/link";

const BenchmarkPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-center">Benchmarks</h1>
      <p className="text-center text-gray-500">
        This page is for benchmarking different features of the app.
      </p>
      <div className="flex flex-col items-center min-h-screen p-4 m-0 gap-4">
        <Link href="/bench/encryption">
          <Button className="mb-4 px-6 py-3 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:shadow-outline transition duration-300 ease-in-out">
            Encryption
          </Button>
        </Link>
        <Link href="/bench/requests">
          <Button className="mb-4 px-6 py-3 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:shadow-outline transition duration-300 ease-in-out">
            Requests
          </Button>
        </Link>
        <Link href="/bench/local_storage">
          <Button className="px-6 py-3 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:shadow-outline transition duration-300 ease-in-out">
            Local Storage
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default BenchmarkPage;
