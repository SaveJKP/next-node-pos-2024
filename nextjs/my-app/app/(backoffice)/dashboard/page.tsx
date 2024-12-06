"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Chart as ChartJS } from "chart.js/auto";
import Swal from "sweetalert2";
import axios from "axios";
import config from "@/app/config";

export default function Dashboard() {
  const [ , setIncomePerDays] = useState<any[]>([]);
  const [incomePerMonths, setIncomePerMonths] = useState<any[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [monthName, setMonthName] = useState<string[]>([
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
  const [days, setDays] = useState<number[]>([]);
  const [year, setYear] = useState<number>(0);
  const [selectedYear, setSelectedYear] = useState<number>(dayjs().year());
  const [month, setMonth] = useState<number>(dayjs().month() + 1);
  const [chartPerDay, setChartPerDay] = useState<ChartJS | null>(null);
  const [chartPerMonth, setChartPerMonth] = useState<ChartJS | null>(null);

  useEffect(() => {
    const totalDayInMonth = dayjs().daysInMonth();

    setDays(Array.from({ length: totalDayInMonth }, (_, index) => index + 1));
    setYears(Array.from({ length: 5 }, (_, index) => dayjs().year() - index));

    fetchData();
  }, []);

  const fetchData = () => {
    fetchDataSumPerDayInYearAndMonth();
    fetchDataSumPerMonthInYear();
  };

  const createBarChartDays = (incomePerDays: any[]) => {
    let labels: number[] = [];
    let datas: number[] = [];

    for (let i = 0; i < incomePerDays.length; i++) {
      const item = incomePerDays[i];
      labels.push(i + 1);
      datas.push(item.amount);
    }

    const ctx = document.getElementById("chartPerDay") as HTMLCanvasElement;

    if (chartPerDay) {
      chartPerDay.destroy();
    }

    const chart = new ChartJS(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "รายรับรวมตามวัน (บาท)",
            data: datas,
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    setChartPerDay(chart);
  };

  const fetchDataSumPerDayInYearAndMonth = async () => {
    try {
      const payload = {
        year: selectedYear,
        month: month,
      };
      const headers = {
        Authorization: "Bearer " + localStorage.getItem(config.token),
      };
      const res = await axios.post(
        `${config.apiServer}/api/report/sumPerDayInYearAndMonth`,
        payload,
        { headers }
      );
      setIncomePerDays(res.data.results);
      createBarChartDays(res.data.results);
    } catch (e: any) {
      Swal.fire({
        icon: "error",
        title: "error",
        text: e.message,
      });
    }
  };

  const createBarChartMonths = (incomePerMonths: any[]) => {
    let datas: number[] = [];

    for (let i = 0; i < incomePerMonths.length; i++) {
      datas.push(incomePerMonths[i].amount);
    }

    const ctx = document.getElementById("chartPerMonth") as HTMLCanvasElement;

    if (chartPerMonth) {
      chartPerMonth.destroy();
    }

    const chart = new ChartJS(ctx, {
      type: "bar",
      data: {
        labels: monthName,
        datasets: [
          {
            label: "รายรับรวมตามเดือน (บาท)",
            data: datas,
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    setChartPerMonth(chart);
  };

  const fetchDataSumPerMonthInYear = async () => {
    try {
      const payload = {
        year: selectedYear,
      };

      const headers = {
        Authorization: "Bearer " + localStorage.getItem(config.token),
      };

      const res = await axios.post(
        `${config.apiServer}/api/report/sumPerMonthInYear`,
        payload,
        { headers }
      );
      setIncomePerMonths(res.data.results);
      createBarChartMonths(res.data.results);
    } catch (e: any) {
      Swal.fire({
        icon: "error",
        title: "error",
        text: e.message,
      });
    }
  };

  return (
    <div className="min-h-full  border border-gray-200 bg-white rounded-md shadow-md overflow-hidden">
      <div className="bg-white border-b border-gray-200 text-lg font-bold p-3">
        Dashboard
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ปี
            </label>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {years.map((item, index) => (
                <option key={index} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              เดือน
            </label>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
            >
              {monthName.map((item, index) => (
                <option key={index} value={index + 1}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              className="w-full px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
              onClick={fetchData}
            >
              <i className="fa fa-search mr-2" />
              แสดงข้อมูล
            </button>
          </div>
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <div className="text-lg font-bold text-gray-800 mb-4">
              สรุปยอดขายรายวัน
            </div>
            <div className="bg-gray-50 p-4 border border-gray-200 rounded-md shadow-sm">
              <canvas id="chartPerDay" height="200" />
            </div>
          </div>
  
          <div>
            <div className="text-lg font-bold text-gray-800 mb-4">
              สรุปยอดขายรายเดือน
            </div>
            <div className="bg-gray-50 p-4 border border-gray-200 rounded-md shadow-sm">
              <canvas id="chartPerMonth" height="200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
}
