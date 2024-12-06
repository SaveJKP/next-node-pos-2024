"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import config from "@/app/config";
import axios from "axios";

const OrganizationPage = () => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [logo, setLogo] = useState("");
  const [promptpay, setPromptpay] = useState("");
  const [taxCode, setTaxCode] = useState("");
  const [fileSelected, setFileSelected] = useState<File | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await axios.get(`${config.apiServer}/api/organization/info`);
    setName(res.data.result.name);
    setAddress(res.data.result.address);
    setPhone(res.data.result.phone);
    setEmail(res.data.result.email);
    setWebsite(res.data.result.website);
    setLogo(res.data.result.logo);
    setPromptpay(res.data.result.promptpay);
    setTaxCode(res.data.result.taxCode);
  };

  const save = async () => {
    try {
      const fileName = await uploadFile();
      const payload = {
        name: name,
        address: address,
        phone: phone,
        email: email,
        website: website,
        logo: fileName,
        promptpay: promptpay,
        taxCode: taxCode,
      };

      await axios.post(`${config.apiServer}/api/organization/create`, payload);
      Swal.fire({
        title: "success",
        icon: "success",
        text: "บันทึกข้อมูลร้านสำเร็จ",
        timer: 1000,
      });
    } catch (e: any) {
      Swal.fire({
        title: "error",
        icon: "error",
        text: e.message,
      });
    }
  };

  const handleFileChange = (e: any) => {
    setFileSelected(e.target.files[0]);
  };

  const uploadFile = async () => {
    const formData = new FormData();
    formData.append("file", fileSelected as Blob);
    const response = await axios.post(
      `${config.apiServer}/api/organization/upload`,
      formData
    );
    return response.data.fileName;
  };

  return (
    <div className="min-h-full  border border-gray-200 bg-white rounded-md shadow-md overflow-hidden">
      <div className="bg-white border-b border-gray-200 text-lg font-bold p-3">
        ข้อมูลร้าน
      </div>
      <div className="p-4">
        <div className="mb-2">ชื่อ</div>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-200"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="mt-3 mb-2">ที่อยู่</div>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-200"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <div className="mt-3 mb-2">เบอร์โทร</div>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-200"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <div className="mt-3 mb-2">อีเมล</div>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-200"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="mt-3 mb-2">เว็บไซต์</div>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-200"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />

        <div className="mt-3 mb-2">โลโก้</div>
        {logo && (
          <img
            src={`${config.apiServer}/uploads/${logo}`}
            alt="logo"
            className="mb-3 mt-2 w-24 h-auto"
          />
        )}
        <input
          type="file"
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-200"
          onChange={handleFileChange}
        />

        <div className="mt-3 mb-2">เลขประจำตัวผู้เสียภาษี</div>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-200"
          value={taxCode}
          onChange={(e) => setTaxCode(e.target.value)}
        />

        <div className="mt-3 mb-2">เลขบัญชีพร้อมเพย์</div>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-200"
          value={promptpay}
          onChange={(e) => setPromptpay(e.target.value)}
        />

        <button
          onClick={save}
          className="mt-3 w-full px-4 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
        >
          <i className="fa fa-save mr-2"></i>
          บันทึก
        </button>
      </div>
    </div>
  );
};

export default OrganizationPage;
