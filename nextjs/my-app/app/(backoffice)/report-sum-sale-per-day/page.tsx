"use client";

import { useState, useEffect } from "react";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import axios from "axios";
import config from "@/app/config";

export default function ReportSumSalePerDay() {
  const [arrYear, setArrYear] = useState<number[]>([]);
  const [arrMonth, setArrMonth] = useState([
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [data, setData] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    setArrYear(Array.from({ length: 5 }, (_, index) => dayjs().year() - index));
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const payload = {
        year: selectedYear,
        month: selectedMonth,
      };

      const headers = {
        Authorization: "Bearer " + localStorage.getItem(config.token),
      };

      const res = await axios.post(
        config.apiServer + "/api/report/sumPerDayInYearAndMonth",
        payload,
        { headers }
      );
      setData(res.data.results);
      setTotalAmount(sumTotalAmount(res.data.results));
    } catch (e: any) {
      Swal.fire({
        title: "Error",
        text: e.message,
        icon: "error",
      });
    }
  };

  const sumTotalAmount = (data: any[]) => {
    let sum = 0;
    data.forEach((item: any) => {
      sum += item.amount;
    });
    return sum;
  };

  return (
    <div className="min-h-full border border-gray-200 bg-white rounded-md shadow-md overflow-hidden">
        <div className="bg-white border-b border-gray-200 text-lg font-bold p-3">
        สรุปยอดขายรายวัน
      </div>
      <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block mb-2 font-semibold">ปี</label>
          <select
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-200"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {arrYear.map((year, index) => (
              <option key={index} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-2 font-semibold">เดือน</label>
          <select
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-200"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          >
            {arrMonth.map((month, index) => (
              <option key={index} value={index + 1}>
                {month}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            className="w-full px-4 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
            onClick={fetchData}
          >
            <i className="fa fa-search mr-2"></i>
            แสดงรายการ
          </button>
        </div>
      </div>
  
      <div className="overflow-x-auto mt-4">
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2 text-left">วันที่</th>
              <th className="border px-4 py-2 text-right">ยอดขาย</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item: any, index: number) => (
              <tr key={index}   className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} `} >
                <td className="border px-4 py-2">{dayjs(item.date).format("DD")}</td>
                <td className="border px-4 py-2 text-right">
                  {item.amount.toLocaleString("th-TH")}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-bold">
              <td className="border px-4 py-2">รวม</td>
              <td className="border px-4 py-2 text-right">
                {totalAmount.toLocaleString("th-TH")}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      </div>
    </div>
  );
  
}
