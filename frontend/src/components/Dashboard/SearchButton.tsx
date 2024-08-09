import { PlusIcon } from "@heroicons/react/24/outline";
import React from "react";

interface SearchButtonProps {
  onClick?: () => void;
  loading: boolean;
}

const SearchButton: React.FC<SearchButtonProps> = ({ onClick, loading }) => {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`flex mt-1 h-10 items-center rounded-2xl px-4 text-sm font-medium text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 ${
        loading
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-green-500 hover:bg-green-600"
      }`}
    >
      <span className="hidden md:block">Search</span>{" "}
      <PlusIcon className="h-5 md:ml-4" />
    </button>
  );
};

export default SearchButton;
