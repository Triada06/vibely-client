import { NavLink } from "react-router-dom";
import { faHouseChimney } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleUser,
  faCompass,
  faSquarePlus,
} from "@fortawesome/free-regular-svg-icons";

export default function Footer({ profilePicUri }: { profilePicUri?: string }) {
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
                  icon={faHouseChimney}
                  className="mr-2 ml-2"
                  size="lg"
                />
              </NavLink>
            </li>
            <li className="m-2 sm:m-3 md:m-4 ">
              <NavLink
                to="/explore"
                className={({ isActive, isPending }) =>
                  isPending
                    ? "pending "
                    : isActive
                    ? "transition-all dark:text-[#4DD0E1] hover:rounded-xl duration-300 ease-in-out dark:hover:bg-[#B794F4] dark:hover:text-[#2A2A2D] hover:bg-[#4B3F72] hover:brightness-110 hover:text-[#EAF2EF] text-[#E07A5F]  flex text-start h-10 items-center text-xl"
                    : "transition-all dark:text-[#EAEAEA] hover:rounded-xl duration-300 ease-in-out dark:hover:bg-[#B794F4] dark:hover:text-[#2A2A2D] hover:bg-[#4B3F72] hover:brightness-110 hover:text-[#EAF2EF] text-[#2E2E2E]  flex text-start h-10 items-center text-xl"
                }
              >
                <FontAwesomeIcon
                  icon={faCompass}
                  className="mr-2 ml-2"
                  size="lg"
                />
              </NavLink>
            </li>
            <li className="m-2 sm:m-3 md:m-4">
              <NavLink
                to="/uploadpost"
                className={({ isActive, isPending }) =>
                  isPending
                    ? "pending "
                    : isActive
                    ? "transition-all dark:text-[#4DD0E1] hover:rounded-xl duration-300 ease-in-out dark:hover:bg-[#B794F4] dark:hover:text-[#2A2A2D] hover:bg-[#4B3F72] hover:brightness-110 hover:text-[#EAF2EF] text-[#E07A5F]  flex text-start h-10 items-center text-xl"
                    : "transition-all dark:text-[#EAEAEA] hover:rounded-xl duration-300 ease-in-out dark:hover:bg-[#B794F4] dark:hover:text-[#2A2A2D] hover:bg-[#4B3F72] hover:brightness-110 hover:text-[#EAF2EF] text-[#2E2E2E]  flex text-start h-10 items-center text-xl"
                }
              >
                <FontAwesomeIcon
                  icon={faSquarePlus}
                  className="mr-2 ml-2"
                  size="lg"
                />
              </NavLink>
            </li>
            <li className="m-2 sm:m-3 md:m-4">
              <NavLink
                to="/profile"
                className={({ isActive, isPending }) =>
                  isPending
                    ? "pending"
                    : isActive
                    ? "transition-all dark:text-[#4DD0E1] hover:rounded-xl duration-300 ease-in-out dark:hover:bg-[#B794F4] dark:hover:text-[#2A2A2D] hover:bg-[#4B3F72] hover:brightness-110 hover:text-[#EAF2EF] text-[#E07A5F] flex text-start h-10 items-center text-xl"
                    : "transition-all dark:text-[#EAEAEA] hover:rounded-xl duration-300 ease-in-out dark:hover:bg-[#B794F4] dark:hover:text-[#2A2A2D] hover:bg-[#4B3F72] hover:brightness-110 hover:text-[#EAF2EF] text-[#2E2E2E] flex text-start h-10 items-center text-xl"
                }
              >
                {({ isActive }) => (
                  <>
                    <img
                      className={`size-10 rounded-full mr-2 ml-2 transition-all duration-300 ${
                        isActive ? "border-2 dark:border-[#4DD0E1] border-[#E07A5F]" : ""
                      }`}
                      src={profilePicUri ?? "./default-profile-picture.jpg"}
                      alt="profilePic"
                    />
                  </>
                )}
              </NavLink>
            </li>
          </ul>
        </nav>
      </footer>
    </>
  );
}
