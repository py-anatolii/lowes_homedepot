"use client";

import React, { useEffect, useState } from "react";
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
          [name: string]: { [store: string]: { price: string; stock: string }[] };
        }>((acc2, product) => {
          if (!acc2[product.name]) {
            acc2[product.name] = {};
          }
          if (!acc2[product.name][product.store]) {
            acc2[product.name][product.store] = [];
          }
          acc2[product.name][product.store].push({ price: product.price, stock: product.stock || "0" });
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
            const numericPrice = parseFloat(price.replace(/[^0-9.-]+/g, ''));
            const numericStock = parseFloat(stock);
            return !isNaN(numericPrice) && !isNaN(numericStock)
              ? sum + (numericPrice * numericStock)
              : sum;
          }, 0);

          const priceDetails = prices.length
            ? `${prices.map(({ price, stock }) => `${price} (${stock})`).join(", ")}`
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
            const numericPrice = parseFloat(price.replace(/[^0-9.-]+/g, ''));
            const numericStock = parseFloat(stock);
            return !isNaN(numericPrice) && !isNaN(numericStock)
              ? sum + (numericPrice * numericStock)
              : sum;
          }, 0);

          const priceDetails = prices.length
            ? `${prices.map(({ price, stock }) => `${price} (${stock})`).join(", ")}`
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





  return (
    <div className="relative overflow-x-auto sm:rounded-lg">
      <div className="flex justify-end space-x-4 p-4 border-b border-gray-700">
        <button onClick={exportToPDF} className="px-4 py-2 text-white bg-blue-500 rounded-md">
          Export to PDF
        </button>
        <button onClick={exportToCSV} className="px-4 py-2 text-white bg-green-500 rounded-md">
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
              <th scope="col" className="px-6 py-3" style={{ width: '150px' }}>
                Brand
              </th>
              <th scope="col" className="px-6 py-3" style={{ width: '200px' }}>
                Product Name
              </th>
              {stores.map((store) => (
                <th key={store} scope="col" className="px-6 py-3" style={{ width: '200px' }}>
                  {store}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {brands.map((brand) => (
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
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label htmlFor={`checkbox-${name}`} className="sr-only">
                        checkbox
                      </label>
                    </div>
                  </td>
                  <th scope="row" className="px-6 py-4 font-medium whitespace-nowrap dark:text-white">
                    {brand}
                  </th>
                  <td className="px-6 py-4">
                    {name}
                  </td>
                  {stores.map((store) => {
                    const prices = priceMatrix[brand]?.[name]?.[store] || [];
                    const totalPrice = prices.reduce((sum, { price, stock }) => {
                      const numericPrice = parseFloat(price.replace(/[^0-9.-]+/g, '')); // Remove currency symbols and commas
                      const numericStock = parseFloat(stock);
                      return !isNaN(numericPrice) && !isNaN(numericStock)
                        ? sum + (numericPrice * numericStock)
                        : sum;
                    }, 0);
                    return (
                      <td key={store} className="px-6 py-4">
                        {prices.length ? (
                          <>
                            <ul>
                              {prices.map(({ price, stock }, index) => (
                                <li key={index}>{price} ({stock})</li>
                              ))}
                            </ul>
                            <div><strong>Total: ${totalPrice.toFixed(2)}</strong></div>
                          </>
                        ) : (
                          "N/A"
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ProductTable;
