"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { SearchPayload } from "@/type";
import { useState } from "react";

interface SearchInputProps {
  searchPayload: SearchPayload;
  changeSearchPayload: (payload: SearchPayload) => void;
}

const SearchInput: React.FC<SearchInputProps> = (props) => {
  const [keyWord, setKeyWord] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKeyword = e.target.value;
    setKeyWord(newKeyword);
    props.changeSearchPayload({
      zipCode: props.searchPayload.zipCode,
      radius: props.searchPayload.radius,
      keyWord: newKeyword,
    });
  };

  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="peer block w-full rounded-3xl border border-gray-200 py-[13px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder="Please enter product name..."
        value={keyWord}
        onChange={handleChange}
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
};

export default SearchInput;
