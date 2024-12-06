"use client";

import { useEffect, useState } from "react";
import MyModal from "../components/MyModal"; // import โมดัลที่สร้างขึ้นมาใช้ซ้ำได้
import Swal from "sweetalert2"; // import SweetAlert สำหรับแสดงการแจ้งเตือน
import axios from "axios"; // import Axios สำหรับการเรียก API
import config from "@/app/config"; // import การตั้งค่า config เช่น URL ของ API

export default function Page() {
  const [name, setName] = useState("");
  const [remark, setRemark] = useState("");
  const [foodTypes, setFoodTypes] = useState([]);
  const [id, setId] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // ฟังก์ชันสำหรับปิด Modal
  const closeModal = () => setIsOpen(false);

  // ฟังก์ชันสำหรับเปิด Modal
  const openModal = () => setIsOpen(true);

  useEffect(() => {
    fetchData();
  }, []);

  const edit = (item: any) => {
    setId(item.id);
    setName(item.name);
    setRemark(item.remark);
    openModal();
  };

  const fetchData = async () => {
    try {
      const res = await axios.get(config.apiServer + "/api/foodType/list");
      setFoodTypes(res.data.results);
    } catch (e: any) {
      Swal.fire({
        title: "Error",
        icon: "error",
        text: e.message,
      });
    }
  };

  const save = async () => {
    try {
      const payload = { name, remark, id };

      if (id == 0) {
        await axios.post(config.apiServer + "/api/foodType/create", payload);
      } else {
        await axios.put(config.apiServer + "/api/foodType/update", payload);
        setId(0);
      }

      fetchData();
      closeModal();
    } catch (e: any) {
      Swal.fire({
        title: "Error",
        text: e.message,
        icon: "error",
      });
    }
  };

  const clearForm = () => {
    setName("");
    setRemark("");
    setId(0);
    openModal();
  };

  const remove = async (item: any) => {
    try {
      const button = await Swal.fire({
        title: "ยืนยันการลบ",
        text: "คุณต้องการลบใช่หรือไม่",
        icon: "question",
        showCancelButton: true,
        showConfirmButton: true,
      });

      if (button.isConfirmed) {
        await axios.delete(
          config.apiServer + "/api/foodType/remove/" + item.id
        );
        fetchData();
      }
    } catch (e: any) {
      Swal.fire({
        title: "Error",
        text: e.message,
        icon: "error",
      });
    }
  };

  return (
    <div className="min-h-full  border border-gray-200 bg-white rounded-md shadow-md overflow-hidden">
      <div className="bg-white border-b border-gray-200 text-lg font-bold p-3">
        ประเภทอาหาร/เครื่องดื่ม
      </div>
      <div className=" p-4">
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          onClick={() => {
            clearForm();
          }}
        >
          <i className="fa fa-plus mr-2"></i> เพิ่มรายการ
        </button>

        <table className="text-center mt-3 w-full  border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border border-gray-300 w-24">ชื่อ</th>
              <th className="p-2 border border-gray-300 w-auto">หมายเหตุ</th>
              <th className="p-2 border border-gray-300 w-28"></th>
            </tr>
          </thead>
          <tbody>
            {foodTypes.map((item: any, index: number) => (
              <tr key={index} className={`${
                index % 2 === 0 ? "bg-white" : "bg-gray-50"
              } border-b`}>
                <td className="p-2 border border-gray-300">{item.name}</td>
                <td className="p-2 border border-gray-300">{item.remark}</td>
                <td className="p-2 border border-gray-300 ">
                  <div className="w-full h-full flex space-x-2">
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md"
                      onClick={() => {
                        edit(item);
                      
                      }}
                    >
                      <i className="fa fa-edit"></i>
                    </button>

                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md"
                      onClick={(e) => remove(item)}
                    >
                      <i className="fa fa-times"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isOpen && (
        <MyModal id="modalFoodType" title="ประเภทอาหาร/เครื่องดื่ม" onClose={closeModal}>
          <div className="mt-3">ชื่อ</div>
          <input
            className="mt-2 p-2 w-full border border-gray-300 rounded-md"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="mt-4">หมายเหตุ</div>
          <input
            className="mt-2 p-2 w-full border border-gray-300 rounded-md"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
          />
          <div className="mt-4 flex justify-end space-x-3">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={save}
            >
              บันทึก
            </button>
          </div>
        </MyModal>
      )}
    </div>
  );
}
