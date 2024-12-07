"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import config from "@/app/config";
import MyModal from "../components/MyModal";

export default function Page() {
  const [foodTypeId, setFoodTypeId] = useState(0);
  const [foodTypes, setFoodTypes] = useState([]);
  const [name, setName] = useState("");
  const [remark, setRemark] = useState("");
  const [id, setId] = useState(0);
  const [price, setPrice] = useState(0);
  const [img, setImg] = useState("");
  const [myFile, setMyFile] = useState<File | null>(null);
  const [foods, setFoods] = useState([]);
  const [foodType, setFoodType] = useState("food");
  const [isOpen, setIsOpen] = useState(false);

  // ฟังก์ชันสำหรับปิด Modal
  const closeModal = () => setIsOpen(false);

  // ฟังก์ชันสำหรับเปิด Modal
  const openModal = () => setIsOpen(true);

  useEffect(() => {
    fetchDataFoodTypes();
    fetchData();
  }, []);

  const fetchDataFoodTypes = async () => {
    try {
      const res = await axios.get(config.apiServer + "/api/foodType/list");

      if (res.data.results.length > 0) {
        setFoodTypes(res.data.results);
        setFoodTypeId(res.data.results[0].id);
      }
    } catch (e: any) {
      Swal.fire({
        icon: "error",
        title: "error",
        text: e.message,
      });
    }
  };

  const handleSelectedFile = (e: any) => {
    if (e.target.files.length > 0) {
      setMyFile(e.target.files[0]);
    }
  };

  const fetchData = async () => {
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

  const save = async () => {
    try {
      const img = await handleUpload();
      const payload = {
        id: id,
        foodTypeId: foodTypeId,
        foodType: foodType,
        img: img,
        name: name,
        remark: remark,
        price: price,
      };

      if (id == 0) {
        await axios.post(config.apiServer + "/api/food/create", payload);
      } else {
        await axios.put(config.apiServer + "/api/food/update", payload);
        setId(0);
      }

      Swal.fire({
        icon: "success",
        title: "บันทึกข้อมูล",
        text: "บันทึกข้อมูลสำเร็จ",
        timer: 1000,
      });

      fetchData();
      closeModal();
    } catch (e: any) {
      Swal.fire({
        icon: "error",
        title: "error",
        text: e.message,
      });
    }
  };

  const handleUpload = async () => {
    try {
      const formData = new FormData();
      formData.append("myFile", myFile as Blob);

      const res = await axios.post(
        config.apiServer + "/api/food/upload",
        formData
      );
      return res.data.fileName;
    } catch (e: any) {
      Swal.fire({
        icon: "error",
        title: "error",
        text: e.message,
      });
    }
  };
  

  const getFoodTypeName = (foodType: string): string => {
    if (foodType == "food") {
      return "อาหาร";
    } else {
      return "เครื่องดื่ม";
    }
  };

  const remove = async (item: any) => {
    try {
      const button = await Swal.fire({
        title: "ยืนยันการลบ",
        text: "คูณต้องการลบใช่หรือไม่",
        icon: "question",
        showCancelButton: true,
        showConfirmButton: true,
      });

      if (button.isConfirmed) {
        await axios.delete(config.apiServer + "/api/food/remove/" + item.id);
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

  const edit = (item: any) => {
    setId(item.id);
    setFoodTypeId(item.foodTypeId);
    setName(item.name);
    setRemark(item.remark);
    setPrice(item.price);
    setFoodType(item.foodType);
    setImg("");
    openModal();
  };

  const clearForm = () => {
    setId(0);
    setName("");
    setRemark("");
    setPrice(0);
    setFoodType("food");
    setImg("");
    // (document.getElementById('myFile') as HTMLInputElement).value = '';
    openModal();
  };

  return (
    <>
      <div className="min-h-full border border-gray-200 bg-white rounded-md shadow-md overflow-hidden">
        <div className="bg-white border-b border-gray-200 text-lg font-bold p-3">
          อาหาร
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
                <th className="p-2 border border-gray-300 w-32">ภาพ</th>
                <th className="p-2 border border-gray-300 w-12">ประเภท</th>
                <th className="p-2 border border-gray-300 w-16">ชนิด</th>
                <th className="p-2 border border-gray-300 w-48">ชื่อ</th>
                <th className="p-2 border border-gray-300 w-auto">หมายเหตุ</th>
                <th className="p-2 border border-gray-300 w-16">ราคา</th>
                <th className="p-2 border border-gray-300 w-28"></th>
              </tr>
            </thead>
            <tbody>
              {foods.map((item: any, index: number) => (
                <tr key={item.id} className={`${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                } border-b`}>
                  <td className="p-2 border border-gray-300">
                    <img
                      src={config.apiServer + "/uploads/" + item.img}
                      alt={item.name}
                      className="object-cover"
                    />
                  </td>
                  <td className="p-2 border border-gray-300">
                    {item.FoodType.name}
                  </td>
                  <td className="p-2 border border-gray-300">
                    {getFoodTypeName(item.foodType)}
                  </td>
                  <td className="p-2 border border-gray-300">{item.name}</td>
                  <td className="p-2 border border-gray-300">{item.remark}</td>
                  <td className="p-2 border border-gray-300">{item.price}</td>
                  <td className="p-2 border border-gray-300">
                    <div className="w-full h-full flex justify-center items-center space-x-2">
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
      </div>
      {isOpen && ( // แสดง Modal เฉพาะเมื่อ isOpen เป็น true
        <MyModal id="modalFood" title="อาหาร" onClose={closeModal}>
          <div className="mt-3">ประเภทอาหาร</div>
          <select
            className="w-full p-2 border border-gray-300 rounded-md"
            onChange={(e) => setFoodTypeId(parseInt(e.target.value))}
          >
            {foodTypes.map((item: any) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>

          <div className="mt-3">ภาพ</div>
          {img != "" && (
            <img
              className="mb-2 rounded-md shadow-md"
              src={config.apiServer + "/uploads/" + img}
              alt={name}
              width="100"
            />
          )}
          <input
            type="file"
            id="myFile"
            className="w-full p-2 border border-gray-300 rounded-md"
            onChange={(e) => handleSelectedFile(e)}
          />

          <div className="mt-3">ชื่ออาหาร</div>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded-md"
            onChange={(e) => setName(e.target.value)}
            value={name}
          />

          <div className="mt-3">หมายเหตุ</div>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded-md"
            onChange={(e) => setRemark(e.target.value)}
            value={remark}
          />

          <div className="mt-3">ราคา</div>
          <input
            type="number"
            className="w-full p-2 border border-gray-300 rounded-md"
            onChange={(e) => setPrice(parseInt(e.target.value))}
            value={price}
          />

          <div className="mt-3">ประเภทอาหาร</div>
          <div className="mt-1 flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="foodType"
                value="food"
                checked={foodType === "food"}
                onChange={(e) => setFoodType(e.target.value)}
                className="mr-2"
              />
              อาหาร
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="foodType"
                value="drink"
                checked={foodType === "drink"}
                onChange={(e) => setFoodType(e.target.value)}
                className="mr-2"
              />
              เครื่องดื่ม
            </label>
          </div>

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
    </>
  );
}
