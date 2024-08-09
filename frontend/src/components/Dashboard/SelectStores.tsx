"use client";

import React, { useState } from "react";
import useData from "@/hooks/useData";
import { SearchPayload } from "@/type";
import { MapPinIcon } from "@heroicons/react/24/outline";

interface SelectStoresProps {
  searchPayload: SearchPayload;
  changeSearchPayload: (payload: SearchPayload) => void;
}

const SelectStores: React.FC<SelectStoresProps> = (props) => {
  const [zipCode, setZipCode] = useState<string>(props.searchPayload.zipCode);
  const [radius, setRadius] = useState<string>(props.searchPayload.radius);

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newZipCode = e.target.value;
    setZipCode(newZipCode);
    props.changeSearchPayload({
      zipCode: newZipCode,
      radius: props.searchPayload.radius,
      keyWord: props.searchPayload.keyWord,
    });
  };

  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRadius = e.target.value;
    setRadius(newRadius);
    props.changeSearchPayload({
      zipCode: props.searchPayload.zipCode,
      radius: newRadius,
      keyWord: props.searchPayload.keyWord,
    });
  };

  return (
    <div
      id="sidebar-multi-level-sidebar"
      className="w-[300px] overflow-y-auto transition-transform -translate-x-full sm:translate-x-0"
      aria-label="Sidebar"
    >
      <div className="h-full px-3 py-4 overflow-y-auto dark:bg-gray-800">
        <ul className="space-y-4 font-medium">
          <li>
            <form className="max-w-sm mx-auto">
              <label
                htmlFor="zip-input"
                className="flex-1 text-left rtl:text-right whitespace-nowrap"
              >
                ZIP code:
              </label>
              <div className="relative mt-3">
                <div className="absolute inset-y-0 start-0 top-0 flex items-center ps-3.5 pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  id="zip-input"
                  aria-describedby="helper-text-explanation"
                  className="border border-gray-500 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-500 dark:focus:border-green-500"
                  placeholder="12345-6789"
                  pattern="^\d{5}(-\d{4})?$"
                  value={zipCode}
                  required
                  onChange={handleZipCodeChange}
                />
              </div>
            </form>
          </li>
          <li>
            <form className="max-w-sm mx-auto">
              <label
                htmlFor="number-input"
                className="flex-1 text-left rtl:text-right whitespace-nowrap"
              >
                Select a Radius:
              </label>
              <div className="relative mt-3">
                <div className="absolute inset-y-0 start-0 top-0 flex items-center ps-3.5 pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.755 10.059a7.5 7.5 0 0 1 12.548-3.364l1.903 1.903h-3.183a.75.75 0 1 0 0 1.5h4.992a.75.75 0 0 0 .75-.75V4.356a.75.75 0 0 0-1.5 0v3.18l-1.9-1.9A9 9 0 0 0 3.306 9.67a.75.75 0 1 0 1.45.388Zm15.408 3.352a.75.75 0 0 0-.919.53 7.5 7.5 0 0 1-12.548 3.364l-1.902-1.903h3.183a.75.75 0 0 0 0-1.5H2.984a.75.75 0 0 0-.75.75v4.992a.75.75 0 0 0 1.5 0v-3.18l1.9 1.9a9 9 0 0 0 15.059-4.035.75.75 0 0 0-.53-.918Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  type="number"
                  id="number-input"
                  aria-describedby="helper-text-explanation"
                  className="border border-gray-500 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-500 dark:focus:border-green-500"
                  placeholder="100000m"
                  value={radius}
                  required
                  onChange={handleRadiusChange}
                />
              </div>
            </form>
          </li>
          <li>
            <div className=""></div>
          </li>
          {/* <li>
            <div className="flex items-center border-t pt-4">
              <div className="flex items-center h-6">
                <input
                  id="helper-checkbox"
                  aria-describedby="helper-checkbox-text"
                  type="checkbox"
                  value=""
                  className="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div className="ms-2">
                <label htmlFor="helper-checkbox" className="dark:text-gray-300">
                  Select Stores
                </label>
              </div>
            </div>
            <ul className="mt-3 space-y-4 list-inside dark:text-gray-400">
              <li>
                Lowes:
                <ul className="ps-5 mt-2 space-y-1 list-inside">
                  <li>
                    <div className="flex">
                      <div className="flex items-center h-5">
                        <input
                          id="helper-checkbox"
                          aria-describedby="helper-checkbox-text"
                          type="checkbox"
                          value=""
                          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                      <div className="ms-2 text-sm">
                        <label
                          htmlFor="helper-checkbox"
                          className="font-medium dark:text-gray-300"
                        >
                          Free shipping via Flowbite
                        </label>
                        <p
                          id="helper-checkbox-text"
                          className="text-xs font-normal text-gray-500 dark:text-gray-300"
                        >
                          Address
                        </p>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="flex">
                      <div className="flex items-center h-5">
                        <input
                          id="helper-checkbox"
                          aria-describedby="helper-checkbox-text"
                          type="checkbox"
                          value=""
                          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                      <div className="ms-2 text-sm">
                        <label
                          htmlFor="helper-checkbox"
                          className="font-medium dark:text-gray-300"
                        >
                          Free shipping via Flowbite
                        </label>
                        <p
                          id="helper-checkbox-text"
                          className="text-xs font-normal text-gray-500 dark:text-gray-300"
                        >
                          Address
                        </p>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="flex">
                      <div className="flex items-center h-5">
                        <input
                          id="helper-checkbox"
                          aria-describedby="helper-checkbox-text"
                          type="checkbox"
                          value=""
                          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                      <div className="ms-2 text-sm">
                        <label
                          htmlFor="helper-checkbox"
                          className="font-medium dark:text-gray-300"
                        >
                          Free shipping via Flowbite
                        </label>
                        <p
                          id="helper-checkbox-text"
                          className="text-xs font-normal text-gray-500 dark:text-gray-300"
                        >
                          Address
                        </p>
                      </div>
                    </div>
                  </li>
                </ul>
              </li>
              <li>
                Home Depot:
                <ul className="ps-5 mt-2 space-y-1 list-inside">
                  <li>
                    <div className="flex">
                      <div className="flex items-center h-5">
                        <input
                          id="helper-checkbox"
                          aria-describedby="helper-checkbox-text"
                          type="checkbox"
                          value=""
                          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                      <div className="ms-2 text-sm">
                        <label
                          htmlFor="helper-checkbox"
                          className="font-medium dark:text-gray-300"
                        >
                          Free shipping via Flowbite
                        </label>
                        <p
                          id="helper-checkbox-text"
                          className="text-xs font-normal text-gray-500 dark:text-gray-300"
                        >
                          Address
                        </p>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="flex">
                      <div className="flex items-center h-5">
                        <input
                          id="helper-checkbox"
                          aria-describedby="helper-checkbox-text"
                          type="checkbox"
                          value=""
                          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                      <div className="ms-2 text-sm">
                        <label
                          htmlFor="helper-checkbox"
                          className="font-medium dark:text-gray-300"
                        >
                          Free shipping via Flowbite
                        </label>
                        <p
                          id="helper-checkbox-text"
                          className="text-xs font-normal text-gray-500 dark:text-gray-300"
                        >
                          Address
                        </p>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="flex">
                      <div className="flex items-center h-5">
                        <input
                          id="helper-checkbox"
                          aria-describedby="helper-checkbox-text"
                          type="checkbox"
                          value=""
                          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                      <div className="ms-2 text-sm">
                        <label
                          htmlFor="helper-checkbox"
                          className="font-medium dark:text-gray-300"
                        >
                          Free shipping via Flowbite
                        </label>
                        <p
                          id="helper-checkbox-text"
                          className="text-xs font-normal text-gray-500 dark:text-gray-300"
                        >
                          Address
                        </p>
                      </div>
                    </div>
                  </li>
                </ul>
              </li>
            </ul>
          </li> */}
        </ul>
      </div>
    </div>
  );
};

export default SelectStores;
