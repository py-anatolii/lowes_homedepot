"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { SearchPayload } from "@/type";
import { useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";

interface SearchInputProps {
  searchPayload: SearchPayload;
  changeSearchPayload: (payload: SearchPayload) => void;
}

const SearchInput: React.FC<SearchInputProps> = (props) => {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [inputKeywords, setInputKeywords] = useState<string>("");
  const [inputMethod, setInputMethod] = useState<'user' | 'file'>('user');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputKeywords(e.target.value);
    const newKeywords = e.target.value.split(',').map(k => k.trim());
    setKeywords(newKeywords);
    setInputMethod('user');
    props.changeSearchPayload({
      zipCode: props.searchPayload.zipCode,
      radius: props.searchPayload.radius,
      keyWord: newKeywords.join(','), // Join the array to a single string
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
    setInputMethod('file');
    props.changeSearchPayload({
      zipCode: props.searchPayload.zipCode,
      radius: props.searchPayload.radius,
      keyWord: newKeywords.join(','),
    });
  };

  const parseExcel = (data: ArrayBuffer) => {
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    const newKeywords = jsonData.flat().map((k: any) => k.trim());
    setKeywords(newKeywords);
    setInputMethod('file');
    props.changeSearchPayload({
      zipCode: props.searchPayload.zipCode,
      radius: props.searchPayload.radius,
      keyWord: newKeywords.join(','),
    });
  };

  return (
    <div className="relative flex flex-col flex-1 flex-shrink-0 space-y-4">
      <div className="relative flex flex-1 flex-shrink-0">
        <label htmlFor="search" className="sr-only">
          Search
        </label>
        <input
          className="peer block w-full rounded-3xl border border-gray-200 py-[13px] pl-10 text-sm outline-2 placeholder:text-gray-500"
          placeholder="Please enter product name separated by commas..."
          value={inputMethod === 'file' ? keywords.join(', ') : inputKeywords}
          onChange={handleChange}
        />
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
      </div>
      <input
        className="block w-full text-md text-gray-900 bg-gray-50 border-b border-gray-300 rounded-lg cursor-pointer focus:outline-none hover:bg-gray-100 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:text-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:hover:bg-gray-600 dark:focus:border-blue-500 dark:focus:ring-blue-500"
        type="file"
        accept=".csv, .xlsx, .xls"
        onChange={handleFileUpload}
      />
    </div>
  );
};

export default SearchInput;
