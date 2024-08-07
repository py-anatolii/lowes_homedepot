"use client";

import React, { useEffect, useState } from "react";
import useData from "@/hooks/useData";
import { Product, PriceMatrix } from "@/type";
import Loader from "../common/Loading";
import { jsPDF } from "jspdf";
import "jspdf-autotable";  // Ensure this import is added
import Papa from "papaparse";

interface ProductTableProps {
  loading: boolean;
}

const ProductTable: React.FC<ProductTableProps> = (props) => {
  const [brands, setBrands] = useState<string[]>([]);
  const [stores, setStores] = useState<string[]>([]);
  const [priceMatrix, setPriceMatrix] = useState<PriceMatrix>({});

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
        acc[brand] = uniqueStores.reduce<{ [store: string]: { prices: { price: string, stock: string }[], total: string } }>(
          (acc2, store) => {
            const products = data_result.filter(
              (p) => p.brand === brand && p.store === store
            );
            const prices = products.map((product) => ({
              price: product.price,
              stock: product.stock || '1',
            }));
            const total = prices
              .map((item) => parseFloat(item.price.replace(/[^0-9.-]+/g, "")) * parseFloat(item.stock || "1"))
              .filter((price) => !isNaN(price))
              .reduce((a, b) => a + b, 0)
              .toFixed(2);
            acc2[store] = { prices, total };
            return acc2;
          },
          {}
        );
        return acc;
      }, {} as PriceMatrix);

      setPriceMatrix(matrix);
    }
  }, [data, data_result]);

  const exportToPDF = () => {
    const doc = new jsPDF();
    const rows: any[] = [];

    brands.forEach((brand) => {
      const row: any[] = [brand];
      stores.forEach((store) => {
        const { prices, total } = priceMatrix[brand]?.[store] || { prices: [], total: '0.00' };
        
        const priceDetails = prices.length
          ? `${prices.map(({ price, stock }, index) => `${price} (${stock})`).join(', ')}\nTotal: $${total}`
          : "N/A";

        row.push(priceDetails);
      });
      rows.push(row);
    });

    const header = ["Brand", ...stores];
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
      const row: any = { Brand: brand };
      stores.forEach((store) => {
        const { prices, total } = priceMatrix[brand]?.[store] || { prices: [], total: '0.00' };
        
        row[store] = prices.length
          ? `${prices.map(({ price, stock }) => `${price} (${stock})`).join(', ')}\nTotal: $${total}`
          : "N/A";
      });
      csvData.push(row);
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

  return (
    <div className="relative overflow-x-auto sm:rounded-lg">
      <div className="flex justify-end space-x-4 p-4 border-b border-gray-700">
        <button
          onClick={exportToPDF}
          className="px-4 py-2 text-white bg-blue-500 rounded-md"
        >
          Export to PDF
        </button>
        <button
          onClick={exportToCSV}
          className="px-4 py-2 text-white bg-green-500 rounded-md"
        >
          Export to CSV
        </button>
      </div>
      {loading ? (
        <Loader />
      ) : (
        <table className="w-full text-sm text-left rtl:text-right dark:text-gray-400">
          <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 border-b border-gray-700">
            <tr>
              <th scope="col" className="p-4">
                <div className="flex items-center">
                  <input
                    id="checkbox-all"
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor="checkbox-all" className="sr-only">
                    checkbox
                  </label>
                </div>
              </th>
              <th scope="col" className="px-6 py-3">
                Brand
              </th>
              {stores.map((store) => (
                <th key={store} scope="col" className="px-6 py-3">
                  {store}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {brands.map((brand) => (
              <tr
                key={brand}
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <td className="w-4 p-4">
                  <div className="flex items-center">
                    <input
                      id={`checkbox-${brand}`}
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor={`checkbox-${brand}`} className="sr-only">
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
                {stores.map((store) => {
                  const { prices, total } = priceMatrix[brand]?.[store] || { prices: [], total: '0.00' };

                  return (
                    <td key={store} className="px-6 py-4">
                      {prices.length ? (
                        <div>
                          <ul>
                            {prices.map(({ price, stock }, index) => (
                              <li key={index}>{price} ({stock})</li>
                            ))}
                          </ul>
                          <strong>Total: ${total}</strong>
                        </div>
                      ) : (
                        "N/A"
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ProductTable;
