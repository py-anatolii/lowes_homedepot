"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { SearchPayload } from "@/type";
import { useState, useRef } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";

interface SearchInputProps {
  searchPayload: SearchPayload;
  changeSearchPayload: (payload: SearchPayload) => void;
}

const SearchInput: React.FC<SearchInputProps> = (props) => {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [inputKeywords, setInputKeywords] = useState<string>("");
  const [inputMethod, setInputMethod] = useState<"user" | "file">("user");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputKeywords(e.target.value);
    const newKeywords = e.target.value.split(",").map((k) => k.trim());
    setKeywords(newKeywords);
    setInputMethod("user");
    props.changeSearchPayload({
      zipCode: props.searchPayload.zipCode,
      radius: props.searchPayload.radius,
      keyWord: newKeywords.join(","), // Join the array to a single string
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = event.target?.result;
        if (file.type === "text/csv") {
          parseCSV(data as string);
        } else {
          parseExcel(data as ArrayBuffer);
        }
      };
      if (file.type === "text/csv") {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    }
  };

  const parseCSV = (data: string) => {
    const result = Papa.parse(data, { header: true });
    const newKeywords = result.data.map((row: any) => row.keywords.trim());
    setKeywords(newKeywords);
    setInputMethod("file");
    props.changeSearchPayload({
      zipCode: props.searchPayload.zipCode,
      radius: props.searchPayload.radius,
      keyWord: newKeywords.join(","),
    });
  };

  const parseExcel = (data: ArrayBuffer) => {
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    const newKeywords = jsonData.flat().map((k: any) => k.trim());
    setKeywords(newKeywords);
    setInputMethod("file");
    props.changeSearchPayload({
      zipCode: props.searchPayload.zipCode,
      radius: props.searchPayload.radius,
      keyWord: newKeywords.join(","),
    });
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log(`Selected file: ${file.name}`);
    }
  };

  return (
    <div className="relative flex flex-col flex-1 flex-shrink-0 space-y-4">
      <div className="relative flex flex-1 flex-shrink-0">
        <label htmlFor="search" className="sr-only">
          Search
        </label>
        <input
          className="peer block w-full rounded-3xl border border-gray-200 py-[13px] pl-10 pr-32 text-sm outline-2 placeholder:text-gray-500"
          placeholder="Please enter product name separated by commas..."
          value={inputMethod === "file" ? keywords.join(", ") : inputKeywords}
          onChange={handleChange}
        />
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />

        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
          <button
            onClick={handleButtonClick}
            className="mx-3 text-white p-1 bg-green-400 rounded hover:bg-green-600 transition duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-4"
            >
              <path
                fillRule="evenodd"
                d="M11.47 2.47a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1-1.06 1.06l-3.22-3.22V16.5a.75.75 0 0 1-1.5 0V4.81L8.03 8.03a.75.75 0 0 1-1.06-1.06l4.5-4.5ZM3 15.75a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".csv, .xlsx, .xls"
            onChange={handleFileUpload}
          />
        </div>
      </div>
    </div>
  );
};

export default SearchInput;
