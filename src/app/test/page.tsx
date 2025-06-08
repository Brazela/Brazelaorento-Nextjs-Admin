import { getSession } from '@/app/lib/session';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
};

export default async function AdminPage() {
  const session = await getSession();
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Admin Dashboard
        </h1>
        
        {session?.userId ? (
          <div className="text-center">
            <div className="mb-4">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold">
              Welcome, {session.username}!
            </h2>
            <p className="text-gray-600 mt-2">
              You're logged in as {session.email}
            </p>
            <div className="mt-6 bg-green-100 text-green-800 p-3 rounded-md">
              Cross-subdomain authentication successful!
            </div>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">
              Access Denied
            </h2>
            <p className="text-gray-600">
              Please sign in to access the admin dashboard
            </p>
          </div>
        )}
      </div>
    </div>
  );
}