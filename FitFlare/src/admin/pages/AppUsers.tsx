import BasicTableOne from "../components/tables/BasicTables/BasicTableOne";

export default function AppUsers() {
  return (
    <div className="grid grid-cols-1 gap-4 md:gap-6 ">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="col-span-1 space-y-6 xl:col-span-1">
        <BasicTableOne/>
        {/*paginationn twin pagination*/}
        </div>
      </div>
    </div>
  );
}
