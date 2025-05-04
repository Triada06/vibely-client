import { Link, NavLink } from "react-router-dom";

import { GridIcon, UserCircleIcon, MoreDotIcon } from "../admin/icons";

export default function Sidebar() {
  return (
    <>
      <aside className="hidden md:flex md:w-82 md:flex-col bg-[#EAF2EF] dark:bg-[#361F27] shadow-[0_4px_20px_rgba(0,0,0,0.1)] rounded-xl text-white fixed h-full">
        <div className="icon size-10 flex justify-start items-center w-10/12 m-4 ">
          <Link
            to={"/"}
            className=" size-10 flex justify-start items-center w-10/12  "
          >
            <img className="size-14" src="public\icon.svg" alt="logo" />
            <span className="text-[#361F27] text-2xl">Fitflare</span>
          </Link>
        </div>
        <div className="flex items-start m-3 border-b-1 border-[#361F27] text-xl text-[#361F27]">
          <h6>Menu</h6>
        </div>
        <nav className="flex items-center justify-center  w-full">
          <ul className=" h-8/10 flex justify-center flex-col w-full">
            <li className="m-4 h-2/3">
              <NavLink
                to="/"
                className={({ isActive, isPending }) =>
                  isPending
                    ? "pending "
                    : isActive
                    ? "transition-all hover:rounded-xl duration-300 ease-in-out hover:bg-[#521945] hover:text-[#EAF2EF] text-[#912F56]  flex text-start h-10 items-center text-xl"
                    : "transition-all hover:rounded-xl duration-300 ease-in-out hover:bg-[#521945] hover:text-[#EAF2EF] text-[#361F27]  flex text-start h-10 items-center text-xl"
                }
              >
                <GridIcon className="ml-2 mr-2" />
                Home
              </NavLink>
            </li>
            <li className="m-4">
              <NavLink
                to="/profile"
                className={({ isActive, isPending }) =>
                  isPending
                    ? "pending "
                    : isActive
                    ? "transition-all hover:rounded-xl duration-300 ease-in-out hover:bg-[#521945] hover:text-[#EAF2EF] text-[#912F56]  flex text-start h-10 items-center text-xl"
                    : "transition-all hover:rounded-xl duration-300 ease-in-out hover:bg-[#521945] hover:text-[#EAF2EF] text-[#361F27]  flex text-start h-10 items-center text-xl"
                }
              >
                <UserCircleIcon className="ml-2 mr-2" />
                Profile
              </NavLink>
            </li>
          </ul>
        </nav>
        <section className="m-4 hover:cursor-pointer">
          <div className="h-10 flex items-center justify-start border-t-1 border-[#361F27]  text-[#361F27] transition-all hover:rounded-xl duration-300 ease-in-out hover:bg-[#521945] hover:text-[#EAF2EF]">
            <MoreDotIcon className="text-2xl transition-all hover:rounded-xl duration-300 dark:text-[#EAF2EF] " />
            <h6 className="text-xl">More</h6>
          </div>
        </section>
      </aside>
    </>
  );
}
