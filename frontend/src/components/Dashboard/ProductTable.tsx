"use client";

import React, { useEffect, useState, useRef } from "react";
import useData from "@/hooks/useData";
import { Product, PriceMatrix } from "@/type";
import Loader from "../common/Loading";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import Papa from "papaparse";

interface ProductTableProps {
  loading: boolean;
}

const ProductTable: React.FC<ProductTableProps> = (props) => {
  const [brands, setBrands] = useState<string[]>([]);
  const [stores, setStores] = useState<string[]>([]);
  const [priceMatrix, setPriceMatrix] = useState<PriceMatrix>({});
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data, error, loading, fetchData } = useData({
    method: "get",
    url: "/products/get_all_product",
  });

  let data_result: Product[] = data?.results || [];

  useEffect(() => {
    if (props.loading === false) {
      fetchData();
    }
  }, [props.loading]);

  useEffect(() => {
    if (data) {
      const uniqueBrands: string[] = [
        ...new Set(data_result.map((product: Product) => product.brand)),
      ];
      const uniqueStores: string[] = [
        ...new Set(data_result.map((product: Product) => product.store)),
      ];

      setBrands(uniqueBrands);
      setStores(uniqueStores);

      const matrix = uniqueBrands.reduce<PriceMatrix>((acc, brand) => {
        const brandProducts = data_result.filter((p) => p.brand === brand);
        acc[brand] = brandProducts.reduce<{
          [title: string]: {
            [store: string]: { price: string; stock: string }[];
          };
        }>((acc2, product) => {
          if (!acc2[product.title]) {
            acc2[product.title] = {};
          }
          if (!acc2[product.title][product.store]) {
            acc2[product.title][product.store] = [];
          }
          acc2[product.title][product.store].push({
            price: product.price,
            stock: product.stock || "0",
          });
          return acc2;
        }, {});
        return acc;
      }, {} as PriceMatrix);

      setPriceMatrix(matrix);
    }
  }, [data, data_result]);

  const exportToPDF = () => {
    const doc = new jsPDF();
    const rows: any[] = [];

    brands.forEach((brand) => {
      Object.keys(priceMatrix[brand] || {}).forEach((name) => {
        const row: any[] = [brand, name];
        stores.forEach((store) => {
          const prices = priceMatrix[brand]?.[name]?.[store] || [];

          // Calculate total price for this store and product
          const totalPrice = prices.reduce((sum, { price, stock }) => {
            const numericPrice = parseFloat(price.replace(/[^0-9.-]+/g, ""));
            const numericStock = parseFloat(stock);
            return !isNaN(numericPrice) && !isNaN(numericStock)
              ? sum + numericPrice * numericStock
              : sum;
          }, 0);

          const priceDetails = prices.length
            ? `${prices
                .map(({ price, stock }) => `${price} (${stock})`)
                .join(", ")}`
            : "N/A";

          row.push(`${priceDetails} | Total: $${totalPrice.toFixed(2)}`);
        });

        rows.push(row);
      });
    });

    const header = ["Brand", "Product Name", ...stores];
    (doc as any).autoTable({
      head: [header],
      body: rows,
      styles: { cellPadding: 2, fontSize: 10 },
      columnStyles: { 0: { cellWidth: 30 } },
    });

    doc.save("products.pdf");
  };

  const exportToCSV = () => {
    const csvData: any[] = [];

    brands.forEach((brand) => {
      Object.keys(priceMatrix[brand] || {}).forEach((name) => {
        const row: any = { Brand: brand, "Product Name": name };

        stores.forEach((store) => {
          const prices = priceMatrix[brand]?.[name]?.[store] || [];

          // Calculate total price for this store and product
          const totalPrice = prices.reduce((sum, { price, stock }) => {
            const numericPrice = parseFloat(price.replace(/[^0-9.-]+/g, ""));
            const numericStock = parseFloat(stock);
            return !isNaN(numericPrice) && !isNaN(numericStock)
              ? sum + numericPrice * numericStock
              : sum;
          }, 0);

          const priceDetails = prices.length
            ? `${prices
                .map(({ price, stock }) => `${price} (${stock})`)
                .join(", ")}`
            : "N/A";

          row[store] = `${priceDetails} | Total: $${totalPrice.toFixed(2)}`;
        });

        csvData.push(row);
      });
    });

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "products.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className="relative inline-block w-full text-right z-1" ref={dropdownRef}>
        <button
          onClick={toggleDropdown}
          className="inline-flex justify-center px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-6"
          >
            <path
              fillRule="evenodd"
              d="M12 2.25a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3a.75.75 0 0 1 .75-.75Zm-9 13.5a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {isOpen && (
          <div className="z-1 absolute right-0 z-10 mt-2 w-48 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
            <div
              className="py-1"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="options-menu"
            >
              <button
                onClick={exportToPDF}
                className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                role="menuitem"
              >
                Export to PDF
              </button>
              <button
                onClick={exportToCSV}
                className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                role="menuitem"
              >
                Export to CSV
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="relative mt-1 overflow-x-auto sm:rounded-lg">
        {loading ? (
          <Loader />
        ) : (
          <table className="w-full text-sm text-left rtl:text-right dark:text-gray-400">
            <thead className="text-xs uppercase bg-gray-200 dark:bg-gray-700 dark:text-gray-400 border-b border-gray-700">
              <tr>
                <th scope="col" className="p-4">
                  <div className="flex items-center">
                    <input
                      id="checkbox-all"
                      type="checkbox"
                      className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="checkbox-all" className="sr-only">
                      checkbox
                    </label>
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3"
                  style={{ width: "150px" }}
                >
                  Brand
                </th>
                <th
                  scope="col"
                  className="px-6 py-3"
                  style={{ width: "200px" }}
                >
                  Product Name
                </th>
                {stores.map((store) => (
                  <th
                    key={store}
                    scope="col"
                    className="px-6 py-3"
                    style={{ width: "200px" }}
                  >
                    {store}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {brands.map((brand) =>
                Object.keys(priceMatrix[brand] || {}).map((name) => (
                  <tr
                    key={name}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <td className="w-4 p-4">
                      <div className="flex items-center">
                        <input
                          id={`checkbox-${name}`}
                          type="checkbox"
                          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label htmlFor={`checkbox-${name}`} className="sr-only">
                          checkbox
                        </label>
                      </div>
                    </td>
                    <th
                      scope="row"
                      className="px-6 py-4 font-medium whitespace-nowrap dark:text-white"
                    >
                      {brand}
                    </th>
                    <td className="px-6 py-4">{name}</td>
                    {stores.map((store) => {
                      const prices = priceMatrix[brand]?.[name]?.[store] || [];
                      const totalPrice = prices.reduce(
                        (sum, { price, stock }) => {
                          const numericPrice = parseFloat(
                            price.replace(/[^0-9.-]+/g, "")
                          ); // Remove currency symbols and commas
                          const numericStock = parseFloat(stock);
                          return !isNaN(numericPrice) && !isNaN(numericStock)
                            ? sum + numericPrice * numericStock
                            : sum;
                        },
                        0
                      );
                      return (
                        <td key={store} className="px-6 py-4">
                          {prices.length ? (
                            <>
                              <ul>
                                {prices.map(({ price, stock }, index) => (
                                  <li key={index}>
                                    {price} ({stock})
                                  </li>
                                ))}
                              </ul>
                              <div>
                                <strong>Total: ${totalPrice.toFixed(2)}</strong>
                              </div>
                            </>
                          ) : (
                            "N/A"
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

export default ProductTable;
