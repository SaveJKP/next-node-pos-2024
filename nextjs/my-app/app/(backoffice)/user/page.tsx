"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import MyModal from "../components/MyModal";
import axios from "axios";
import config from "../../config";

export default function Page() {
  const [users, setUsers] = useState<any[]>([]);
  const [id, setId] = useState<number>(0);
  const [name, setName] = useState<string>("");
  const [level, setLevel] = useState<string[]>(["admin", "user"]);
  const [levelSelected, setLevelSelected] = useState<string>("admin");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [currentUserId, setCurrentUserId] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);

  // ฟังก์ชันสำหรับปิด Modal
  const closeModal = () => setIsOpen(false);

  // ฟังก์ชันสำหรับเปิด Modal
  const openModal = () => setIsOpen(true);
  useEffect(() => {
    setCurrentUserId(parseInt(localStorage.getItem("next_user_id") || "0"));
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(config.apiServer + "/api/user/list");
      setUsers(response.data.results);
    } catch (e: any) {
      Swal.fire({
        title: "error",
        text: e.message,
        icon: "error",
      });
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        id: id,
        name: name,
        level: levelSelected,
        username: username,
        password: password,
      };

      if (id == 0) {
        const response = await axios.post(
          config.apiServer + "/api/user/create",
          payload
        );
      } else {
        const response = await axios.put(
          config.apiServer + "/api/user/update",
          payload
        );
        setId(0);
      }

      fetchData();
      closeModal();
    } catch (e: any) {
      Swal.fire({
        title: "error",
        text: e.message,
        icon: "error",
      });
    }
  };

  const handleClearForm = () => {
    setName("");
    setLevelSelected("admin");
    setUsername("");
    setPassword("");
  };

  const handleEdit = (id: number) => {
    setId(id);

    const user = users.find((user) => user.id == id);

    setName(user.name);
    setLevelSelected(user.level);
    setUsername(user.username);
    setPassword(user.password);
    openModal();
  };

  const handleDelete = async (id: number) => {
    try {
      const button = await Swal.fire({
        title: "ยืนยันการลบ",
        text: "คุณต้องการลบผู้ใช้งานนี้หรือไม่?",
        icon: "warning",
        showCancelButton: true,
        showConfirmButton: true,
      });

      await axios.delete(config.apiServer + "/api/user/remove/" + id);
      fetchData();
    } catch (e: any) {
      Swal.fire({
        title: "error",
        text: e.message,
        icon: "error",
      });
    }
  };

  return (
    <div className="min-h-full  border border-gray-200 bg-white rounded-md shadow-md overflow-hidden">
      <div className="bg-white border-b border-gray-200 text-lg font-bold p-3">
        ผู้ใช้งาน
      </div>
      <div className="p-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
          onClick={() => {
            handleClearForm();
            openModal();
          }}
        >
          <i className="fa fa-plus mr-2"></i>
          เพิ่มผู้ใช้งาน
        </button>

        <table className="min-w-full table-auto mt-4 border-collapse">
          <thead>
            <tr className="bg-gray-100 text-center">
              <th className="px-4 py-2 border">ชื่อ</th>
              <th className="px-4 py-2 border">username</th>
              <th className="px-4 py-2 border">ระดับผู้ใช้งาน</th>
              <th className="px-4 py-2 border w-28"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">{user.name}</td>
                <td className="px-4 py-2 border">{user.username}</td>
                <td className="px-4 py-2 border">{user.level}</td>
                <td className="px-4 py-2 border  ">
                  <div className="w-full h-full flex justify-center items-center space-x-2">
                    {currentUserId !== user.id ? (
                      <>
                        <button
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md"
                          onClick={() => handleEdit(user.id)}
                        >
                          <i className="fa fa-edit"></i>
                        </button>
                        <button
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md"
                          onClick={() => handleDelete(user.id)}
                        >
                          <i className="fa fa-trash"></i>
                        </button>
                      </>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isOpen && (
        <MyModal id="modalUser" title="ผู้ใช้งาน" onClose={() => closeModal()}>
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700">
              ชื่อ
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700">
              ระดับผู้ใช้งาน
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={levelSelected}
              onChange={(e) => setLevelSelected(e.target.value)}
            >
              {level.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700">
              username
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700">
              password
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            className="px-4 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 mt-3"
            onClick={handleSave}
          >
            <i className="fa fa-check mr-2"></i>
            บันทึก
          </button>
        </MyModal>
      )}
    </div>
  );
}
