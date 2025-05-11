import { Link, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GridIcon, UserCircleIcon, MoreDotIcon } from "../admin/icons";
import { useEffect, useRef, useState } from "react";
import {
  faSun,
  faMoon,
  faGear,
  faRightFromBracket,
  faHouse,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Sidebar() {
  const [visible, setVisible] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored) setTheme(stored);
    document.documentElement.classList.toggle("dark", stored === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <>
      <aside className=" hidden md:flex md:w-72 md:flex-col bg-[#F5F7FA] dark:bg-[#2A2A2D] shadow-[0_4px_20px_rgba(0,0,0,0.1)] rounded-xl fixed h-full">
        <div className="icon size-10 flex justify-start items-center w-10/12 m-4 ">
          <Link
            to={"/"}
            className="size-10 flex justify-start items-center w-10/12"
          >
            <img className="size-14" src="./icon.svg" alt="logo" />
            <span className="prevent-select text-[#2E2E2E] dark:text-[#EAEAEA] text-2xl">
              Fitflare
            </span>
          </Link>
        </div>

        <div className="flex items-start m-3 border-b border-[#D3D3D3] text-xl text-[#2E2E2E] dark:border-[#3C3C3F] dark:text-[#EAEAEA]">
          <h6>Menu</h6>
        </div>

        <nav className="flex-grow prevent-select ">
          <ul className="flex flex-col justify-start w-full">
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
                <FontAwesomeIcon
                  icon={faHouse}
                  className="ml-2 mr-2 "
                  size="lg"
                />
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
                <UserCircleIcon className="ml-2 mr-2 size-8" />
                Profile
              </NavLink>
            </li>
          </ul>
        </nav>

        <section className="relative prevent-select  w-full mt-auto mb-4 p-2 ">
          <div
            ref={buttonRef}
            onClick={() => setVisible(!visible)}
            className="w-full hover:cursor-pointer dark:text-[#EAEAEA] h-10 flex items-center justify-start dark:hover:bg-[#B794F4] dark:hover:text-[#2A2A2D] text-[#2E2E2E] transition-all hover:rounded-xl duration-300 ease-in-out hover:bg-[#4B3F72] hover:text-[#EAF2EF]"
          >
            <MoreDotIcon className="text-2xl mr-2 size-7" />
            <h6 className="text-xl">More</h6>
          </div>

          <AnimatePresence>
            {visible && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="absolute left-0 bottom-full  mb-2 z-50 rounded-xl w-full shadow-xl dark:shadow-[0_4px_20px_rgba(255,255,255,0.1)] shadow-[0_4px_20px_rgba(0,0,0,0.1)] bg-white dark:bg-[#1C1C1E] text-[#2E2E2E] dark:text-[#EAEAEA]"
              >
                <ul className="m-4">
                  <li>
                    <button
                      onClick={toggleTheme}
                      className="w-full flex items-center  px-4 py-2 text-lg transition-all duration-300 rounded-xl
              hover:bg-[#4B3F72] hover:text-[#EAF2EF] dark:hover:bg-[#B794F4] dark:hover:text-[#2A2A2D]"
                    >
                      <FontAwesomeIcon
                        className="mr-2"
                        icon={theme === "dark" ? faSun : faMoon}
                      />
                      Switch appearance
                    </button>
                  </li>
                  <li>
                    <NavLink
                      to="/settings"
                      onClick={() => setVisible(false)}
                      className={({ isActive }) =>
                        `flex items-center px-4 py-2 text-lg transition-all duration-300 rounded-xl w-full ${
                          isActive
                            ? "text-[#E07A5F] bg-[#f0f0f0] dark:bg-[#4B3F72] dark:text-[#4DD0E1]"
                            : "hover:bg-[#4B3F72] hover:text-[#EAF2EF] dark:hover:bg-[#B794F4] dark:hover:text-[#2A2A2D]"
                        }`
                      }
                    >
                      <FontAwesomeIcon className="mr-2" icon={faGear} />
                      Settings
                    </NavLink>
                  </li>
                  <li className="border-t mt-2 border-[#D3D3D3] text-xl text-[#2E2E2E] dark:border-[#3C3C3F] dark:text-[#EAEAEA]">
                    <button
                      onClick={toggleTheme}
                      className="w-full flex items-center px-4 py-2 text-lg transition-all duration-300 rounded-xl
              hover:bg-[#4B3F72] hover:text-[#EAF2EF] dark:hover:bg-[#B794F4] dark:hover:text-[#2A2A2D]"
                    >
                      <FontAwesomeIcon
                        className="mr-2 prevent-select "
                        icon={faRightFromBracket}
                      />
                      Log out
                    </button>
                  </li>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </aside>
    </>
  );
}
