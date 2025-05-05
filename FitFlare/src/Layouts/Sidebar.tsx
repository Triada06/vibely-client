import { Link, NavLink } from "react-router-dom";

import { GridIcon, UserCircleIcon, MoreDotIcon } from "../admin/icons";

export default function Sidebar() {
  return (
    <>
      <aside className="hidden md:flex md:w-82 md:flex-col bg-[#F5F7FA] dark:bg-[#2A2A2D] shadow-[0_4px_20px_rgba(0,0,0,0.1)] rounded-xl  fixed h-full">
        <div className="icon size-10 flex justify-start items-center w-10/12 m-4 ">
          <Link
            to={"/"}
            className=" size-10 flex justify-start items-center w-10/12  "
          >
            <img className="size-14" src="public\icon.svg" alt="logo" />
            <span className="text-[#2E2E2E] dark:text-[#EAEAEA] text-2xl">
              Fitflare
            </span>
          </Link>
        </div>
        <div className="flex items-start m-3 border-b-1 border-[#D3D3D3] text-xl text-[#2E2E2E] dark:text-[#EAEAEA]">
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
                    ? "transition-all dark:text-[#4DD0E1] hover:rounded-xl duration-300 ease-in-out dark:hover:bg-[#B794F4] dark:hover:text-[#2A2A2D] hover:bg-[#4B3F72] hover:brightness-110 hover:text-[#EAF2EF] text-[#E07A5F]  flex text-start h-10 items-center text-xl"
                    : "transition-all dark:text-[#EAEAEA] hover:rounded-xl duration-300 ease-in-out dark:hover:bg-[#B794F4] dark:hover:text-[#2A2A2D] hover:bg-[#4B3F72] hover:brightness-110 hover:text-[#EAF2EF] text-[#2E2E2E]  flex text-start h-10 items-center text-xl"
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
                    ? "transition-all dark:text-[#4DD0E1] hover:rounded-xl duration-300 ease-in-out dark:hover:bg-[#B794F4] dark:hover:text-[#2A2A2D] hover:bg-[#4B3F72] hover:brightness-110 hover:text-[#EAF2EF] text-[#E07A5F]  flex text-start h-10 items-center text-xl"
                    : "transition-all dark:text-[#EAEAEA] hover:rounded-xl duration-300 ease-in-out dark:hover:bg-[#B794F4] dark:hover:text-[#2A2A2D] hover:bg-[#4B3F72] hover:brightness-110 hover:text-[#EAF2EF] text-[#2E2E2E]  flex text-start h-10 items-center text-xl"
                }
              >
                <UserCircleIcon className="ml-2 mr-2" />
                Profile
              </NavLink>
            </li>
          </ul>
        </nav>
        <section className="m-4 hover:cursor-pointer hover:brightness-110 border-[#D3D3D3] border-t-1 dark:	border-[#3C3C3F]">
          <div className=" dark:text-[#EAEAEA] h-10 flex items-center justify-start  dark:hover:bg-[#B794F4] dark:hover:text-[#2A2A2D]  text-[#2E2E2E] transition-all hover:rounded-xl duration-300 ease-in-out hover:bg-[#4B3F72] hover:text-[#EAF2EF] mt-1">
            <MoreDotIcon className="text-2xl transition-all hover:rounded-xl duration-300  dark:hover:text-[#2A2A2D]  " />
            <h6 className="text-xl">More</h6>
          </div>
        </section>
      </aside>
    </>
  );
}
