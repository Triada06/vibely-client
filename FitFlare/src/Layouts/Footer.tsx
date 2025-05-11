import { NavLink } from "react-router-dom";
import { UserCircleIcon } from "../admin/icons";
import { faHouse } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Footer() {
  return (
    <>
      <footer className="border-t-2  md:hidden fixed w-full bottom-0 bg-[#F5F7FA] dark:bg-[#2A2A2D] shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
        <nav className="flex-grow prevent-select ">
          <ul className="flex justify-evenly items-center w-full ">
            <li className="m-2 sm:m-3 md:m-4 ">
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
                <FontAwesomeIcon
                  icon={faHouse}
                  className="ml-2 mr-2 "
                  size="lg"
                />
              </NavLink>
            </li>
            <li className="m-2 sm:m-3 md:m-4">
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
                <UserCircleIcon className="ml-2 mr-2 size-8" />
              </NavLink>
            </li>
          </ul>
        </nav>
      </footer>
    </>
  );
}
