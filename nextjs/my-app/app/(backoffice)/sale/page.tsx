"use client";

import { useEffect, useState, useRef } from "react";
import config from "@/app/config";
import axios from "axios";
import Swal from "sweetalert2";
import MyModal from "../components/MyModal";

export default function Page() {
  const [table, setTable] = useState(1);
  const [foods, setFoods] = useState([]);
  const [saleTemps, setSaleTemps] = useState([]);
  const [amount, setAmount] = useState(0);
  const [amountAdded, setAmountAdded] = useState(0);
  const [tastes, setTastes] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [saleTempDetails, setSaleTempDetails] = useState([]);
  const [saleTempId, setSaleTempId] = useState(0);
  const [payType, setPayType] = useState("cash");
  const [inputMoney, setInputMoney] = useState(0);
  const [billUrl, setBillUrl] = useState("");

  // สร้าง state สําหรับเปิดและปิด Modal
  const [isOpenModalEdit, setIsOpenModalEdit] = useState(false);
  const [isOpenModalSale, setIsOpenModalSale] = useState(false);
  const [isOpenModalBill, setIsOpenModalBill] = useState(false);

  const closeModalSale = () => setIsOpenModalSale(false);
  const openModalSale = () => setIsOpenModalSale(true);

  const closeModalEdit = () => setIsOpenModalEdit(false);
  const openModalEdit = (item: any) => {
    setIsOpenModalEdit(true);
    setSaleTempId(item.id);
    genereateSaleTempDetail(item.id);
  };

  const closeModalBill = () => setIsOpenModalBill(false);
  const openModalBill = () => setIsOpenModalBill(true);

  const myRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getFoods();
    fetchDataSaleTemp();
    (myRef.current as HTMLInputElement).focus();
  }, []);

  const sumAmount = (saleTemps: any) => {
    let sum = 0;
    saleTemps.forEach((item: any) => {
      sum += item.Food.price * item.qty;
    });

    setAmount(sum);
  };

  const getFoods = async () => {
    try {
      const res = await axios.get(config.apiServer + "/api/food/list");
      setFoods(res.data.results);
    } catch (e: any) {
      Swal.fire({
        title: "error",
        text: e.message,
        icon: "error",
      });
    }
  };

  const filterFoods = async (foodType: string) => {
    try {
      const res = await axios.get(
        config.apiServer + "/api/food/filter/" + foodType
      );
      setFoods(res.data.results);
    } catch (e: any) {
      Swal.fire({
        title: "error",
        text: e.message,
        icon: "error",
      });
    }
  };

  const sale = async (foodId: number) => {
    try {
      const payload = {
        tableNo: table,
        userId: Number(localStorage.getItem("next_user_id")),
        foodId: foodId,
      };

      await axios.post(config.apiServer + "/api/saleTemp/create", payload);
      fetchDataSaleTemp();
    } catch (e: any) {
      Swal.fire({
        title: "error",
        text: e.message,
        icon: "error",
      });
    }
  };

  const fetchDataSaleTemp = async () => {
    try {
      const res = await axios.get(config.apiServer + "/api/saleTemp/list");
      setSaleTemps(res.data.results);

      const results = res.data.results;
      let sum = 0;

      results.forEach((item: any) => {
        sum += sumMoneyAdded(item.SaleTempDetails);
      });

      sumAmount(results);
      setAmountAdded(sum);
    } catch (e: any) {
      Swal.fire({
        title: "error",
        text: e.message,
        icon: "error",
      });
    }
  };

  const removeSaleTemp = async (id: number) => {
    try {
      const button = await Swal.fire({
        title: "คุณต้องการลบรายการนี้ใช่หรือไม่?",
        icon: "warning",
        showCancelButton: true,
        showConfirmButton: true,
      });

      if (button.isConfirmed) {
        await axios.delete(config.apiServer + "/api/saleTemp/remove/" + id);
        fetchDataSaleTemp();
      }
    } catch (e: any) {
      Swal.fire({
        title: "error",
        text: e.message,
        icon: "error",
      });
    }
  };

  const removeAllSaleTemp = async () => {
    try {
      const button = await Swal.fire({
        title: "คุณต้องการลบรายการนี้ใช่หรือไม่?",
        icon: "warning",
        showCancelButton: true,
        showConfirmButton: true,
      });

      if (button.isConfirmed) {
        const payload = {
          tableNo: table,
          userId: Number(localStorage.getItem("next_user_id")),
        };

        await axios.delete(config.apiServer + "/api/saleTemp/removeAll", {
          data: payload,
        });
        fetchDataSaleTemp();
      }
    } catch (e: any) {
      Swal.fire({
        title: "error",
        text: e.message,
        icon: "error",
      });
    }
  };

  const updateQty = async (id: number, qty: number) => {
    try {
      const payload = {
        qty: qty,
        id: id,
      };

      await axios.put(config.apiServer + "/api/saleTemp/updateQty", payload);
      fetchDataSaleTemp();
    } catch (e: any) {
      Swal.fire({
        title: "error",
        text: e.message,
        icon: "error",
      });
    }
  };

  const genereateSaleTempDetail = async (saleTempId: number) => {
    try {
      const payload = {
        saleTempId: saleTempId,
      };

      await axios.post(
        config.apiServer + "/api/saleTemp/generateSaleTempDetail",
        payload
      );
      await fetchDataSaleTemp();
      fetchDataSaleTempInfo(saleTempId);
    } catch (e: any) {
      Swal.fire({
        title: "error",
        text: e.message,
        icon: "error",
      });
    }
  };

  const fetchDataSaleTempInfo = async (saleTempId: number) => {
    try {
      const res = await axios.get(
        config.apiServer + "/api/saleTemp/info/" + saleTempId
      );
      setSaleTempDetails(res.data.results.SaleTempDetails);
      setTastes(res.data.results.Food.FoodType?.Tastes || []);
      setSizes(res.data.results.Food.FoodType?.FoodSizes || []);
    } catch (e: any) {
      Swal.fire({
        title: "error",
        text: e.message,
        icon: "error",
      });
    }
  };

  const sumMoneyAdded = (saleTempDetails: any) => {
    let sum = 0;

    for (let i = 0; i < saleTempDetails.length; i++) {
      const item = saleTempDetails[i];
      sum += item.FoodSize?.moneyAdded || 0;
    }

    return sum;
  };

  const selectTaste = async (
    tasteId: number,
    saleTempDetailId: number,
    saleTempId: number
  ) => {
    try {
      const payload = {
        tasteId: tasteId,
        saleTempDetailId: saleTempDetailId,
      };

      await axios.put(config.apiServer + "/api/saleTemp/selectTaste", payload);
      fetchDataSaleTempInfo(saleTempId);
    } catch (e: any) {
      Swal.fire({
        title: "error",
        text: e.message,
        icon: "error",
      });
    }
  };

  const unSelectTaste = async (
    saleTempDetailId: number,
    saleTempId: number
  ) => {
    try {
      const payload = {
        saleTempDetailId: saleTempDetailId,
      };

      await axios.put(
        config.apiServer + "/api/saleTemp/unSelectTaste",
        payload
      );
      fetchDataSaleTempInfo(saleTempId);
    } catch (e: any) {
      Swal.fire({
        title: "error",
        text: e.message,
        icon: "error",
      });
    }
  };

  const selectSize = async (
    sizeId: number,
    saleTempDetailId: number,
    saleTempId: number
  ) => {
    try {
      const payload = {
        saleTempDetailId: saleTempDetailId,
        sizeId: sizeId,
      };

      await axios.put(config.apiServer + "/api/saleTemp/selectSize", payload);
      await fetchDataSaleTempInfo(saleTempId);
      await fetchDataSaleTemp();
    } catch (e: any) {
      Swal.fire({
        title: "error",
        text: e.message,
        icon: "error",
      });
    }
  };

  const unSelectSize = async (saleTempDetailId: number, saleTempId: number) => {
    try {
      const payload = {
        saleTempDetailId: saleTempDetailId,
      };

      await axios.put(config.apiServer + "/api/saleTemp/unSelectSize", payload);
      await fetchDataSaleTempInfo(saleTempId);
      await fetchDataSaleTemp();
    } catch (e: any) {
      Swal.fire({
        title: "error",
        text: e.message,
        icon: "error",
      });
    }
  };

  const createSaleTempDetail = async () => {
    try {
      const payload = {
        saleTempId: saleTempId,
      };

      await axios.post(
        config.apiServer + "/api/saleTemp/createSaleTempDetail",
        payload
      );
      await fetchDataSaleTemp();
      await fetchDataSaleTempInfo(saleTempId);
    } catch (e: any) {
      Swal.fire({
        title: "error",
        text: e.message,
        icon: "error",
      });
    }
  };

  const removeSaleTempDetail = async (saleTempDetailId: number) => {
    try {
      const payload = {
        saleTempDetailId: saleTempDetailId,
      };

      await axios.delete(
        config.apiServer + "/api/saleTemp/removeSaleTempDetail",
        { data: payload }
      );
      await fetchDataSaleTemp();
      fetchDataSaleTempInfo(saleTempId);
    } catch (e: any) {
      Swal.fire({
        title: "error",
        text: e.message,
        icon: "error",
      });
    }
  };

  const printBillBeforePay = async () => {
    try {
      const payload = {
        tableNo: table,
        userId: Number(localStorage.getItem("next_user_id")),
      };

      const res = await axios.post(
        config.apiServer + "/api/saleTemp/printBillBeforePay",
        payload
      );
      setTimeout(() => {
        setBillUrl(res.data.fileName);

      openModalBill();
      }, 500);
    } catch (e: any) {
      Swal.fire({
        title: "error",
        text: e.message,
        icon: "error",
      });
    }
  };

  const endSale = async () => {
    try {
      // confirm for end sale
      const button = await Swal.fire({
        title: "ยืนยันการจบการขาย",
        text: "คุณต้องการจบการขายหรือไม่?",
        icon: "question",
        showCancelButton: true,
        showConfirmButton: true,
      });

      if (button.isConfirmed) {
        const payload = {
          tableNo: table,
          userId: Number(localStorage.getItem("next_user_id")),
          payType: payType,
          inputMoney: inputMoney,
          amount: amount + amountAdded,
          returnMoney: inputMoney - (amount + amountAdded),
        };

        await axios.post(config.apiServer + "/api/saleTemp/endSale", payload);
        fetchDataSaleTemp();

        closeModalSale();
        printBillAfterPay();
      }
    } catch (e: any) {
      Swal.fire({
        title: "error",
        text: e.message,
        icon: "error",
      });
    }
  };

  const printBillAfterPay = async () => {
    try {
      const payload = {
        tableNo: table,
        userId: Number(localStorage.getItem("next_user_id")),
      };

      const res = await axios.post(
        config.apiServer + "/api/saleTemp/printBillAfterPay",
        payload
      );

      setTimeout(() => {
        setBillUrl(res.data.fileName);

        openModalBill();
      }, 500);
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
        <div className="min-h-full border border-gray-200 bg-white rounded-md shadow-md overflow-hidden">
        <div className="text-white bg-gray-800 border-b border-gray-200 text-lg font-bold p-3">
          ขายสินค้า
        </div>
        <div className="p-4 bg-white">
          <div className="flex flex-wrap gap-4">
            <div className=" flex justify-center items-center">
              <label className="h-10 w-full  px-2 pt-2 rounded-l-md">
                Table No.
              </label>
              <input
                ref={myRef}
                type="text"
                className=" px-4 py-2 border border-gray-300 rounded-md"
                value={table}
                onChange={(e) => setTable(Number(e.target.value))}
              />
            </div>
            <div className="flex-1 flex gap-2">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center"
                onClick={() => filterFoods("food")}
              >
                <i className="fa fa-hamburger mr-2"></i>
                อาหาร
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center"
                onClick={() => filterFoods("drink")}
              >
                <i className="fa fa-coffee mr-2"></i>
                เครื่องดื่ม
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center"
                onClick={() => filterFoods("all")}
              >
                <i className="fa fa-list mr-2"></i>
                ทั้งหมด
              </button>
              <button
                disabled={saleTemps.length === 0}
                className="bg-red-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
                onClick={() => removeAllSaleTemp()}
              >
                <i className="fa fa-times mr-2"></i>
                ล้างรายการ
              </button>
              {amount > 0 && (
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded-md"
                  onClick={() => {
                    openModalBill();
                    printBillBeforePay();
                  }}
                >
                  <i className="fa fa-print mr-2"></i>
                  พิมพ์ใบแจ้งรายการ
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap mt-4 gap-4">
            {/* แมพอาหารมาแสดง */}
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {foods.map((food: any) => (
                <div
                  className="bg-white shadow-md rounded-md overflow-hidden h-72"
                  key={food.id}
                >
                  <img
                    src={config.apiServer + "/uploads/" + food.img}
                    className="w-full h-48 object-cover cursor-pointer"
                    alt={food.name}
                    onClick={() => sale(food.id)}
                  />
                  <div className="p-2">
                    <h5 className="text-lg font-bold">{food.name}</h5>
                    <p className="text-green-500 font-semibold text-xl">
                      {food.price} .-
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="w-full md:w-1/4">
              <div className="bg-gray-800 text-white text-end text-2xl p-4 rounded-md">
                {(amount + amountAdded).toLocaleString("th-TH")} .-
              </div>
              {amount > 0 && (
                <button
                  onClick={() => openModalSale()}
                  className="bg-green-500 text-white w-full py-3 text-lg rounded-md mt-4"
                >
                  <i className="fa fa-check mr-2"></i>
                  จบการขาย
                </button>
              )}

              {saleTemps.map((item: any) => (
                <div className="grid mt-2" key={item.id}>
                  {" "}
                  {/* เพิ่ม key ที่ไม่ซ้ำกัน */}
                  <div className="border border-gray-200 bg-white rounded-md shadow-md">
                    <div className="p-4 flex flex-col justify-center items-center">
                      <div className="font-bold">{item.Food.name}</div>
                      <div>
                        {item.Food.price} x {item.qty} ={" "}
                        {item.Food.price * item.qty}
                      </div>

                      <div className="mt-2">
                        <div className="flex items-center">
                          <button
                            disabled={item.SaleTempDetails.length > 0}
                            className={`px-3 py-2 bg-blue-500 text-white rounded-l-md hover:bg-blue-600 ${
                              item.SaleTempDetails.length > 0
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                            onClick={(e) => updateQty(item.id, item.qty - 1)}
                          >
                            <i className="fa fa-minus"></i>
                          </button>
                          <input
                            type="text"
                            className="w-12 text-center font-bold border-t border-b border-gray-300"
                            value={item.qty}
                            disabled
                          />
                          <button
                            disabled={item.SaleTempDetails.length > 0}
                            className={`px-3 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 ${
                              item.SaleTempDetails.length > 0
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                            onClick={(e) => updateQty(item.id, item.qty + 1)}
                          >
                            <i className="fa fa-plus"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="p-2 border-t border-gray-200">
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => removeSaleTemp(item.id)}
                          className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                        >
                          <i className="fa fa-times mr-2"></i>
                          ยกเลิก
                        </button>
                        <button
                          onClick={(e) => openModalEdit(item)}
                          className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                        >
                          <i className="fa fa-cog mr-2"></i>
                          แก้ไข
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {isOpenModalEdit && (
        <MyModal id="modalEdit" title="แก้ไขรายการ" modalSize="modal-xl" onClose={closeModalEdit}>
          <div>
            <button
              onClick={() => createSaleTempDetail()}
              className="py-2 px-4 bg-blue-500 hover:bg-blue-700 text-white rounded"
            >
              <i className="fa fa-plus me-2"></i>
              เพิ่มรายการ
            </button>
          </div>

          <table className="table-auto border-collapse border border-gray-300 w-full mt-3">
            <thead>
              <tr className="bg-gray-100">
                <th className="w-16 border border-gray-300"></th>
                <th className="border border-gray-300">ชื่ออาหาร</th>
                <th className="w-72 border border-gray-300 text-center">
                  รสชาติ
                </th>
                <th className="w-96 border border-gray-300 text-center">
                  ขนาด
                </th>
              </tr>
            </thead>
            <tbody>
              {saleTempDetails.map((item: any) => (
                <tr key={item.id}>
                  <td className="text-center border border-gray-300">
                    <button
                      onClick={() => removeSaleTempDetail(item.id)}
                      className="py-1 px-2 bg-red-500 hover:bg-red-700 text-white rounded"
                    >
                      <i className="fa fa-times"></i>
                    </button>
                  </td>
                  <td className="border border-gray-300">{item.Food.name}</td>
                  <td className="text-center border border-gray-300">
                    {tastes.map((taste: any) =>
                      item.tasteId === taste.id ? (
                        <button
                          onClick={() =>
                            unSelectTaste(item.id, item.saleTempId)
                          }
                          className="py-1 px-2 bg-red-500 hover:bg-red-700 text-white rounded mr-1"
                          key={taste.id}
                        >
                          {taste.name}
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            selectTaste(taste.id, item.id, item.saleTempId)
                          }
                          className="py-1 px-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded mr-1"
                          key={taste.id}
                        >
                          {taste.name}
                        </button>
                      )
                    )}
                  </td>
                  <td className="text-center border border-gray-300">
                    {sizes.map((size: any) =>
                      size.moneyAdded > 0 ? (
                        item.foodSizeId === size.id ? (
                          <button
                            onClick={() =>
                              unSelectSize(item.id, item.saleTempId)
                            }
                            className="py-1 px-2 bg-green-500 hover:bg-green-700 text-white rounded mr-1"
                            key={size.id}
                          >
                            +{size.moneyAdded} {size.name}
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              selectSize(size.id, item.id, item.saleTempId)
                            }
                            className="py-1 px-2 border border-green-500 text-green-500 hover:bg-green-500 hover:text-white rounded mr-1"
                            key={size.id}
                          >
                            +{size.moneyAdded} {size.name}
                          </button>
                        )
                      ) : null
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </MyModal>
      )}
      {isOpenModalSale && (
        <MyModal id="modalSale" title="จบการขาย" onClose={closeModalSale}>
          <div className="font-bold mb-2">รูปแบบการชำระเงิน</div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <button
              className={`py-3 text-xl rounded ${
                payType === "cash"
                  ? "bg-gray-700 text-white"
                  : "border border-gray-700 text-gray-700 hover:bg-gray-700 hover:text-white"
              }`}
              onClick={() => setPayType("cash")}
            >
              เงินสด
            </button>
            <button
              className={`py-3 text-xl rounded ${
                payType === "transfer"
                  ? "bg-gray-700 text-white"
                  : "border border-gray-700 text-gray-700 hover:bg-gray-700 hover:text-white"
              }`}
              onClick={() => setPayType("transfer")}
            >
              เงินโอน
            </button>
          </div>

          <div className="font-bold mb-2">ยอดเงิน</div>
          <input
            type="text"
            className="w-full text-right text-2xl p-4 border border-gray-400 rounded mb-4"
            value={amount + amountAdded}
            disabled
          />

          <div className="font-bold mb-2">รับเงิน</div>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[50, 100, 500, 1000].map((value) => (
              <button
                key={value}
                onClick={() => setInputMoney(value)}
                className={`py-3 rounded ${
                  inputMoney === value
                    ? "bg-gray-700 text-white"
                    : "border border-gray-700 text-gray-700 hover:bg-gray-700 hover:text-white"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
          <input
            type="number"
            className="w-full text-right text-2xl p-4 border border-gray-400 rounded mb-4"
            placeholder="0.00"
            value={inputMoney}
            onChange={(e) => setInputMoney(Number(e.target.value))}
          />

          <div className="font-bold mb-2">เงินทอน</div>
          <input
            type="text"
            className="w-full text-right text-2xl p-4 border border-gray-400 rounded mb-4"
            value={inputMoney - (amount + amountAdded)}
            disabled
          />

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setInputMoney(amount + amountAdded)}
              className="py-3 bg-blue-500 hover:bg-blue-700 text-white rounded"
            >
              จ่ายพอดี
            </button>
            <button
              disabled={inputMoney - (amount + amountAdded) < 0}
              onClick={() => endSale()}
              className={`py-3 rounded ${
                inputMoney - (amount + amountAdded) >= 0
                  ? "bg-green-500 hover:bg-green-700 text-white"
                  : "bg-gray-400 text-gray-700"
              }`}
            >
              จบการขาย
            </button>
          </div>
        </MyModal>
      )}
      {isOpenModalBill && (
        <MyModal id="modalPrint" title="พิมพ์เอกสาร" onClose={closeModalBill}>
          {billUrl && (
              <iframe
                src={`${config.apiServer}/${billUrl}`}
                className="w-full h-[600px]"
              ></iframe>
          )}
        </MyModal>
      )}
    </>
  );
}
