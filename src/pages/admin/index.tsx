import { Button } from "@/components/Button";
import Link from "next/link";

const AdminPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-center">Admin</h1>
      <p className="text-center text-gray-500">
        This page is for administrative features. All endpoints on this page
        require your user to be authorized. Please contact support if you need
        access to these features.
      </p>
      <div className="flex flex-col items-center min-h-screen p-4 m-0 gap-4">
        <Link href="/admin/create_quest">
          <Button className="mb-4 px-6 py-3 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:shadow-outline transition duration-300 ease-in-out">
            Create a Quest
          </Button>
        </Link>
        <Link href="/admin/create_item">
          <Button className="mb-4 px-6 py-3 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:shadow-outline transition duration-300 ease-in-out">
            Create an Item
          </Button>
        </Link>
        <Link href="/admin/bench">
          <Button className="mb-4 px-6 py-3 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:shadow-outline transition duration-300 ease-in-out">
            Benchmarks
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default AdminPage;
