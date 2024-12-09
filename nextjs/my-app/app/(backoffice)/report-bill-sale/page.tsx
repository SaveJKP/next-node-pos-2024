"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import config from "@/app/config";
import dayjs from "dayjs";
import MyModal from "../components/MyModal";

export default function Page() {
  const [billSales, setBillSales] = useState([]);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [sumAmount, setSumAmount] = useState(0);
  const [billSaleDetails, setBillSaleDetails] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // ฟังก์ชันสำหรับปิด Modal
  const closeModal = () => setIsOpen(false);

  // ฟังก์ชันสำหรับเปิด Modal
  const openModal = () => setIsOpen(true);
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const payload = {
        startDate: new Date(fromDate),
        endDate: new Date(toDate),
      };

      const res = await axios.post(
        config.apiServer + "/api/billSale/list",
        payload
      );
      setBillSales(res.data.results);

      const sum = handleSumAmount(res.data.results);
      setSumAmount(sum);
    } catch (e: any) {
      Swal.fire({
        title: "error",
        text: e.message,
        icon: "error",
      });
    }
  };

  const handleSumAmount = (rows: any) => {
    let sum = 0;

    rows.forEach((row: any) => {
      sum += row.amount;
    });

    return sum;
  };

  const handCancelBill = async (id: string) => {
    try {
      const button = await Swal.fire({
        title: "ยืนยันการยกเลิกบิล",
        text: "คุณต้องการยกเลิกบิลนี้หรือไม่?",
        icon: "warning",
        showCancelButton: true,
        showConfirmButton: true,
      });

      if (button.isConfirmed) {
        await axios.delete(config.apiServer + "/api/billSale/remove/" + id);
        fetchData();
      }
    } catch (e: any) {
      Swal.fire({
        title: "error",
        text: e.message,
        icon: "error",
      });
    }
  };

  return (
    <>
      <div className="min-h-full  border border-gray-200 bg-white rounded-md shadow-md overflow-hidden">
        <div className="bg-white border-b border-gray-200 text-lg font-bold p-3">
          รายงานการขาย
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-2">จากวันที่</label>
              <input
                type="date"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-200"
                value={dayjs(fromDate).format("YYYY-MM-DD")}
                onChange={(e) => setFromDate(new Date(e.target.value))}
              />
            </div>
            <div>
              <label className="block mb-2">ถึงวันที่</label>
              <input
                type="date"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-200"
                value={dayjs(toDate).format("YYYY-MM-DD")}
                onChange={(e) => setToDate(new Date(e.target.value))}
              />
            </div>
            <div className="flex items-end">
              <button
                className="px-4 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
                onClick={fetchData}
              >
                <i className="fa fa-search mr-2"></i>
                แสดงรายการ
              </button>
            </div>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full table-auto border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="border px-4 py-2 text-center">ยกเลิกบิล</th>
                  <th className="border px-4 py-2 text-center">วันที่</th>
                  <th className="border px-4 py-2">รหัสบิล</th>
                  <th className="border px-4 py-2">พนักงานขาย</th>
                  <th className="border px-4 py-2 text-right">โต๊ะ</th>
                  <th className="border px-4 py-2 text-right">จำนวนเงิน</th>
                </tr>
              </thead>
              <tbody>
                {billSales.length > 0 &&
                  billSales.map((billSale: any, index: number) => (
                    <tr
                      key={index}
                      className={`${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } `}
                    >
                      <td className="border px-4 py-2 text-center">
                        <button
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 focus:ring focus:ring-red-300 mr-2"
                          onClick={() => handCancelBill(billSale.id)}
                        >
                          <i className="fa fa-times mr-2"></i>ยกเลิกบิล
                        </button>
                        <button
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 focus:ring focus:ring-blue-300"
                          onClick={() => {
                            setBillSaleDetails(billSale.BillSaleDetails);
                            openModal();
                          }}
                          data-bs-toggle="modal"
                          data-bs-target="#modalBillSaleDetail"
                        >
                          <i className="fa fa-info mr-2"></i>รายละเอียด
                        </button>
                      </td>
                      <td className="border px-4 py-2 text-center">
                        {dayjs(billSale.payDate).format("DD/MM/YYYY HH:mm")}
                      </td>
                      <td className="border px-4 py-2">{billSale.id}</td>
                      <td className="border px-4 py-2">{billSale.User.name}</td>
                      <td className="border px-4 py-2 text-right">
                        {billSale.tableNo}
                      </td>
                      <td className="border px-4 py-2 text-right">
                        {billSale.amount.toLocaleString("th-TH")}
                      </td>
                    </tr>
                  ))}
              </tbody>
              <tfoot>
                <tr className="font-bold">
                  <td colSpan={5} className="border px-4 py-2">
                    รวม
                  </td>
                  <td className="border px-4 py-2 text-right">
                    {sumAmount.toLocaleString("th-TH")}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {isOpen && (
        <MyModal
          id="modalBillSaleDetail"
          title="รายละเอียดบิล"
          onClose={closeModal}
        >
          <table className="w-full table-auto border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2">รายการ</th>
                <th className="border px-4 py-2 text-right">ราคา</th>
                <th className="border px-4 py-2">รสชาติ</th>
                <th className="border px-4 py-2">ขนาด</th>
              </tr>
            </thead>
            <tbody>
              {billSaleDetails.length > 0 &&
                billSaleDetails.map((billSaleDetail: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">
                      {billSaleDetail.Food.name}
                    </td>
                    <td className="border px-4 py-2 text-right">
                      {(
                        billSaleDetail.price + billSaleDetail.moneyAdded
                      ).toLocaleString("th-TH")}
                    </td>
                    <td className="border px-4 py-2">
                      {billSaleDetail.Taste?.name}
                    </td>
                    <td className="border px-4 py-2">
                      {billSaleDetail.foodSizeId &&
                        `${billSaleDetail.FoodSize?.name} +${billSaleDetail.moneyAdded}`}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </MyModal>
      )}
    </>
  );
}
