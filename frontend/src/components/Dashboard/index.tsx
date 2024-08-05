"use client";

import React, { useEffect, useState } from "react";
import ProductTable from "./ProductTable";
import SearchButton from "./SearchButton";
import SearchInput from "./SearchInput";
import Pagination from "./Pagination";
import SelectStores from "./SelectStores";
import { SearchPayload } from "@/type";
import { useNotification } from "@/context/NotificationContext";
import useData from "@/hooks/useData";

export default function Dashboard() {
  const [searhPaylod, setSearchPayload] = useState<SearchPayload>({
    zipCode: "",
    radius: "",
    keyWord: "",
  });
  const [page, setPage] = useState<number>(1);
  const [per_page, setPerPage] = useState<number>(20);

  const { setSuccessMessage, setErrorMessage } = useNotification();

  const { data, error, loading, fetchData } = useData({
    method: "post",
    url: "/products/search",
    requestBody: searhPaylod,
  });

  const changeSearchPayload = (payload: SearchPayload) => {
    setSearchPayload({
      zipCode: payload.zipCode,
      radius: payload.radius,
      keyWord: payload.keyWord,
    });
  };

  const pageControl = ({
    page,
    per_page,
  }: {
    page: number;
    per_page: number;
  }) => {
    setPage(page);
    setPerPage(per_page);
  };
  return (
    <div>
      <div className="flex w-[50%] items-center gap-5 mt-8 ml-5">
        <SearchInput
          searchPayload={searhPaylod}
          changeSearchPayload={changeSearchPayload}
        />
        <SearchButton onClick={fetchData} />
      </div>
      <div className="flex gap-5 mt-5">
        <SelectStores
          searchPayload={searhPaylod}
          changeSearchPayload={changeSearchPayload}
        />
        <div className="w-full">
          <div className="mt-4">
            <span className="font-bold text-sm">Total Counts:</span>{" "}
            {/* <span className="text-sm">{data?.totalCount}</span> */}
          </div>
          <div className="mt-5">
            <ProductTable />
          </div>
          <div className="mt-5 pb-5 flex w-full justify-center">
            <Pagination totalPages={10} pageControl={pageControl} />
          </div>
        </div>
      </div>
    </div>
  );
}
