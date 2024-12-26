"use client";

import { useEffect, useState } from "react";
import MyModal from "../components/MyModal"; // import โมดัลที่สร้างขึ้นมาใช้ซ้ำได้
import Swal from "sweetalert2"; // import SweetAlert สำหรับแสดงการแจ้งเตือน
import axios from "axios"; // import Axios สำหรับการเรียก API
import config from "@/app/config"; // import การตั้งค่า config เช่น URL ของ API

export default function Page() {
  const [foodTypes, setFoodTypes] = useState([]);

  const [name, setName] = useState("");
  const [remark, setRemark] = useState("");
  const [id, setId] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

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

  const edit = (item: any) => {
    setId(item.id);
    setName(item.name);
    setRemark(item.remark);
    openModal();
  };

  const save = async () => {
    try {
      const payload = { name, remark, id };

      if (id == 0) {
        await axios.post(config.apiServer + "/api/foodType/create", payload);
      } else {
        await axios.put(config.apiServer + "/api/foodType/update", payload);
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
  const clearForm = () => {
    setName("");
    setRemark("");
    setId(0);
  };

  const closeModal = () => setIsOpen(false);
  const openModal = () => setIsOpen(true);

  return (
    <div className="card">
      <div className="card-title">
        ประเภทอาหาร/เครื่องดื่ม
      </div>
      <div className=" p-4">
        <button
          className="btn"
          onClick={() => {
            clearForm();
            openModal();
          }}
        >
          <i className="fa fa-plus mr-2"></i> เพิ่มรายการ
        </button>

        <table className="table">
          <thead className="thead">
            <tr>
              <th className="th w-24">ชื่อ</th>
              <th className="th w-auto">หมายเหตุ</th>
              <th className="th w-28"></th>
            </tr>
          </thead>
          <tbody>
            {foodTypes.map((foodType: any, index: number) => (
              <tr
                key={index}
                className={`${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                } border-b`}
              >
                <td className="td">{foodType.name}</td>
                <td className="td">{foodType.remark}</td>
                <td className="td ">
                  <div className="w-full h-full flex justify-center items-center space-x-2">
                    <button
                      className="btn-edit"
                      onClick={() => {
                        edit(foodType);
                      }}
                    >
                      <i className="fa fa-edit"></i>
                    </button>

                    <button
                      className="btn-delete"
                      onClick={() => remove(foodType)}
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
        <MyModal
          id="modalFoodType"
          title="ประเภทอาหาร/เครื่องดื่ม"
          onClose={closeModal}
        >
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
              className="btn"
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
