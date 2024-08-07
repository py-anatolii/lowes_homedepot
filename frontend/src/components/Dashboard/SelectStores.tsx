"use client";

import React, { useState } from "react";
import useData from "@/hooks/useData";
import { SearchPayload } from "@/type";

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
                    className="w-4 h-4 dark:text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 16 20"
                  >
                    <path d="M8 0a7.992 7.992 0 0 0-6.583 12.535 1 1 0 0 0 .12.183l.12.146c.112.145.227.285.326.4l5.245 6.374a1 1 0 0 0 1.545-.003l5.092-6.205c.206-.222.4-.455.578-.7l.127-.155a.934.934 0 0 0 .122-.192A8.001 8.001 0 0 0 8 0Zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="zip-input"
                  aria-describedby="helper-text-explanation"
                  className="border border-gray-500 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
              <input
                type="number"
                id="number-input"
                aria-describedby="helper-text-explanation"
                className="mt-3 border border-gray-500 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="100000m"
                value={radius}
                required
                onChange={handleRadiusChange}
              />
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
                  className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
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
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
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
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
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
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
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
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
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
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
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
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
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
