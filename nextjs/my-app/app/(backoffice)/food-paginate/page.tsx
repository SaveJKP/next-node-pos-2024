"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import config from "@/app/config";
import Swal from "sweetalert2";

export default function FoodPaginate() {
  const [foods, setFoods] = useState([]);
  const [totalPage, setTotalPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(2);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (page: number = 1) => {
    try {
      const payload = {
        page: page,
        itemsPerPage: itemsPerPage,
      };

      const headers = {
        Authorization: "Bearer " + localStorage.getItem(config.token),
      };

      const res = await axios.post(
        config.apiServer + "/api/food/paginate",
        payload,
        { headers }
      );
      setFoods(res.data.results);
      setTotalPage(res.data.totalPage);
      setTotalItems(res.data.totalItems);
    } catch (e: any) {
      Swal.fire({
        title: "error",
        text: e.message,
        icon: "error",
      });
    }
  };

  const changePage = (page: number) => {
    if (page > 0 && page <= totalPage) {
      setCurrentPage(page);
      fetchData(page);
    }
  };

  return (
    <div className="min-h-full border border-gray-200 bg-white rounded-md shadow-md overflow-hidden">
      <div className="bg-white border-b border-gray-200 text-lg font-bold p-3">
        รายการอาหาร
      </div>
      <div className="p-4">
        <table className="table-auto w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">ชื่ออาหาร</th>
              <th className="px-4 py-2 text-right" style={{ width: "100px" }}>
                ราคา
              </th>
            </tr>
          </thead>
          <tbody>
            {foods.map((food: any, index: number) => (
              <tr
                key={food.id}
                className={`${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                } border-b`}
              >
                <td className="px-4 py-2">{food.name}</td>
                <td className="px-4 py-2 text-right">
                  {food.price.toLocaleString("th-TH")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
  
        <div className="mt-4">
          <div className="text-sm text-gray-600">
            จำนวนรายการ: {totalItems} | จำนวนหน้า: {totalPage}
          </div>
        </div>
  
        <div className="mt-4 flex flex-wrap justify-center items-center space-x-2">
          <button
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 ${
              currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={() => changePage(1)}
          >
            <i className="fa fa-chevron-left mr-2"></i>หน้าแรก
          </button>
          <button
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 ${
              currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={() => changePage(currentPage - 1)}
          >
            <i className="fa fa-chevron-left"></i>
          </button>
          {Array.from({ length: totalPage }, (_, index) => (
            <button
              key={index}
              disabled={currentPage === index + 1}
              className={`px-4 py-2 rounded ${
                currentPage === index + 1
                  ? "bg-blue-700 text-white"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
              onClick={() => changePage(index + 1)}
            >
              {index + 1}
            </button>
          ))}
          <button
            disabled={currentPage === totalPage}
            className={`px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 ${
              currentPage === totalPage ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={() => changePage(currentPage + 1)}
          >
            <i className="fa fa-chevron-right"></i>
          </button>
          <button
            disabled={currentPage === totalPage}
            className={`px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 ${
              currentPage === totalPage ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={() => changePage(totalPage)}
          >
            <i className="fa fa-chevron-right mr-2"></i>หน้าสุดท้าย
          </button>
        </div>
      </div>
    </div>
  );
  
}
