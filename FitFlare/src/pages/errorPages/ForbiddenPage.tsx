export default function ForbiddenPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F7FA] dark:bg-[#1C1C1E]">
      <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">
        403 - Forbidden
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 text-center">
        Sorry, you don't have permission to access this page.
      </p>
      <a
        href="/"
        className="px-6 py-3 bg-[#4B3F72] text-white rounded-lg shadow-md hover:bg-[#3B2F62] dark:bg-[#B794F4] dark:hover:bg-[#A784E4] transition-colors duration-300"
      >
        Go Back to Home
      </a>
    </div>
  );
}
