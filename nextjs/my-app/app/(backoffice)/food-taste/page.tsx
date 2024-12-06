"use client";

import MyModal from "../components/MyModal";
import { useEffect, useState } from "react";
import axios from "axios";
import config from "@/app/config";
import Swal from "sweetalert2";

export default function Page() {
  // ใช้ state เพื่อเก็บข้อมูลประเภทอาหาร, รสชาติอาหาร, id และฟิลด์อื่นๆ
  const [foodTypes, setFoodTypes] = useState([]); // เก็บข้อมูลประเภทอาหาร
  const [foodTypeId, setFoodTypeId] = useState(0); // เก็บ foodTypeId ของรายการที่กำลังถูกเลือก
  const [name, setName] = useState(""); // เก็บชื่อรสชาติอาหาร
  const [remark, setRemark] = useState(""); // เก็บหมายเหตุ
  const [tastes, setTastes] = useState([]); // เก็บข้อมูลรสชาติอาหาร
  const [id, setId] = useState(0); // เก็บ id สำหรับใช้ในการแก้ไขข้อมูล
  const [isOpen, setIsOpen] = useState(false);

  // ฟังก์ชันสำหรับปิด Modal
  const closeModal = () => setIsOpen(false);

  // ฟังก์ชันสำหรับเปิด Modal
  const openModal = () => setIsOpen(true);
  // useEffect เพื่อดึงข้อมูลจาก API เมื่อ component ถูกโหลด
  useEffect(() => {
    fetchData(); // ดึงข้อมูลรสชาติอาหาร
    fetchDataFoodTypes(); // ดึงข้อมูลประเภทอาหาร
  }, []);

  // ฟังก์ชันดึงข้อมูลรสชาติอาหารจาก API
  const fetchData = async () => {
    try {
      const res = await axios.get(config.apiServer + "/api/taste/list");
      setTastes(res.data.results); // อัปเดต state 'tastes' ด้วยข้อมูลที่ได้รับ
    } catch (e: any) {
      Swal.fire({
        title: "error",
        icon: "error",
        text: e.message, // แสดงข้อผิดพลาดในกรณีที่ API ไม่สามารถดึงข้อมูลได้
      });
    }
  };

  // ฟังก์ชันบันทึกข้อมูลรสชาติอาหาร (ทั้งเพิ่มและแก้ไข)
  const save = async () => {
    try {
      const payload = {
        foodTypeId: foodTypeId, // foodTypeId ที่ถูกเลือก
        name: name, // ชื่อรสชาติอาหาร
        remark: remark, // หมายเหตุ
        id: id, // id สำหรับการแก้ไข (ถ้าเป็น 0 แสดงว่ากำลังเพิ่มข้อมูลใหม่)
      };

      // ถ้า id เป็น 0 ให้ทำการสร้างใหม่ ถ้าไม่ใช่ให้ทำการแก้ไข
      if (id === 0) {
        await axios.post(config.apiServer + "/api/taste/create", payload); // สร้างข้อมูลใหม่
      } else {
        await axios.put(config.apiServer + "/api/taste/update", payload); // อัปเดตข้อมูล
        setId(0); // รีเซ็ต id หลังจากการแก้ไขเสร็จ
      }

      fetchData(); // รีเฟรชข้อมูลรสชาติอาหารหลังจากบันทึก
      closeModal();
    } catch (e: any) {
      Swal.fire({
        title: "error",
        icon: "error",
        text: e.message, // แสดงข้อผิดพลาดในกรณีที่ไม่สามารถบันทึกข้อมูลได้
      });
    }
  };

  // ฟังก์ชันดึงข้อมูลประเภทอาหารจาก API
  const fetchDataFoodTypes = async () => {
    try {
      const res = await axios.get(config.apiServer + "/api/foodType/list");
      if (res.data.results.length > 0) {
        setFoodTypes(res.data.results); // อัปเดต state 'foodTypes' ด้วยข้อมูลที่ได้รับ
        setFoodTypeId(res.data.results[0].id); // ตั้งค่า foodTypeId เป็นประเภทอาหารตัวแรก
      }
    } catch (e: any) {
      Swal.fire({
        title: "error",
        icon: "error",
        text: e.message, // แสดงข้อผิดพลาดในกรณีที่ไม่สามารถดึงข้อมูลประเภทอาหารได้
      });
    }
  };

  // ฟังก์ชันรีเซ็ตฟอร์ม
  const clearForm = () => {
    setId(0); // รีเซ็ต id
    setName(""); // รีเซ็ตชื่อ
    setRemark(""); // รีเซ็ตหมายเหตุ
    openModal();
  };

  // ฟังก์ชันลบข้อมูลรสชาติอาหาร
  const remove = async (item: any) => {
    try {
      const button = await Swal.fire({
        title: "ลบข้อมูล",
        text: "คุณต้องการลบข้อมูลนี้",
        icon: "question",
        showCancelButton: true,
        showConfirmButton: true,
      });

      if (button.isConfirmed) {
        await axios.delete(config.apiServer + "/api/taste/remove/" + item.id); // ลบรายการที่เลือก
        fetchData(); // รีเฟรชข้อมูลหลังจากลบเสร็จ
      }
    } catch (e: any) {
      Swal.fire({
        title: "error",
        text: e.message, // แสดงข้อผิดพลาดในกรณีที่ไม่สามารถลบข้อมูลได้
        icon: "error",
      });
    }
  };

  // ฟังก์ชันแก้ไขข้อมูล (โหลดข้อมูลลงฟอร์ม)
  const edit = (item: any) => {
    setId(item.id); // ตั้งค่า id ของรายการที่จะแก้ไข
    setName(item.name); // ตั้งค่าชื่อให้ตรงกับรายการ
    setRemark(item.remark); // ตั้งค่าหมายเหตุ
    setFoodTypeId(item.foodTypeId); // ตั้งค่า foodTypeId ให้ตรงกับรายการ
    openModal();
  };

  return (
    <>
      <div className="mt-3 border border-gray-200 bg-white rounded-md shadow-md overflow-hidden">
        <div className="bg-white border-b border-gray-200 text-lg font-bold p-3">
          รสชาติอาหาร
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

          {/* แสดงข้อมูลรสชาติอาหารในตาราง */}
          <table className="text-center mt-3 w-full  border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border border-gray-300 w-44">ประเภทอาหาร</th>
                <th className="p-2 border border-gray-300 w-24">ชื่อ</th>
                <th className="p-2 border border-gray-300 w-auto">หมายเหตุ</th>
                <th className="p-2 border border-gray-300 w-28"></th>
              </tr>
            </thead>
            <tbody>
              {tastes.map((item: any) => (
                <tr key={item.id}>
                  <td className="p-2 border border-gray-300">
                    {item.FoodType.name}
                  </td>{" "}
                  {/* แสดงชื่อประเภทอาหาร */}
                  <td className="p-2 border border-gray-300">
                    {item.name}
                  </td>{" "}
                  {/* แสดงชื่อรสชาติอาหาร */}
                  <td className="p-2 border border-gray-300">
                    {item.remark}
                  </td>{" "}
                  {/* แสดงหมายเหตุ */}
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

          {/* Modal สำหรับเพิ่ม/แก้ไขรสชาติอาหาร */}
          {isOpen && ( // แสดง Modal เฉพาะเมื่อ isOpen เป็น true
            <MyModal id="modalTaste" title="รสชาติอาหาร" onClose={closeModal}>
              <div className="mt-3">ประเภทอาหาร</div>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={foodTypeId}
                onChange={(e) => setFoodTypeId(parseInt(e.target.value))} // อัปเดตค่า foodTypeId เมื่อผู้ใช้เลือกประเภทอาหาร
              >
                {foodTypes.map((item: any) => (
                  <option key={item.id} value={item.id}>
                    {item.name} {/* แสดงชื่อประเภทอาหารใน select */}
                  </option>
                ))}
              </select>

              <div className="mt-3">ชื่อ</div>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={name}
                onChange={(e) => setName(e.target.value)} // อัปเดตค่า name เมื่อผู้ใช้พิมพ์
              />

              <div className="mt-3">หมายเหตุ</div>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={remark}
                onChange={(e) => setRemark(e.target.value)} // อัปเดตค่า remark เมื่อผู้ใช้พิมพ์
              />

              <div className=" border-gray-300 mt-4 flex justify-end space-x-3">
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
      </div>
    </>
  );
}
