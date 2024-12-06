"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import config from "@/app/config";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

export default function Sidebar() {
  const [name, setName] = useState("");
  const router = useRouter();
  const [userLevel, setUserLevel] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("next_name");
    setName(name ?? "");

    getUserLevel();
  }, []);

  const getUserLevel = async () => {
    try {
      const token = localStorage.getItem(config.token);

      if (token !== null) {
        const headers = {
          Authorization: "Bearer " + token,
        };

        const res = await axios.get(
          config.apiServer + "/api/user/getLevelByToken",
          { headers }
        );
        setUserLevel(res.data.level);
      }
    } catch (e: any) {
      Swal.fire({
        title: "error",
        text: e.message,
        icon: "error",
      });
    }
  };

  const signOut = async () => {
    try {
      const button = await Swal.fire({
        title: "ออกจากระบบ",
        text: "คุณต้องการออกจากระบบ",
        icon: "question",
        showCancelButton: true,
        showConfirmButton: true,
      });

      if (button.isConfirmed) {
        localStorage.removeItem(config.token);
        localStorage.removeItem("next_name");
        localStorage.removeItem("next_user_id");

        router.push("/signin");
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
      <aside className="position-fixed bg-black h-screen w-60 rounded-r-3xl flex  flex-col ">
        <header className="mt-4 w-full flex flex-col items-center justify-center  ">
          <p className="text-white text-2xl">Food Pos</p>

          <img
            className="w-20 h-20 object-cover rounded-full border-2 border-yellow-400"
            src="https://cdn.pixabay.com/photo/2023/08/30/22/59/chicken-8224162_1280.jpg"
            alt=""
          />

          <a href="#" className="">
            {name}
          </a>
          <button className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded" onClick={signOut}>
            <i className="fa fa-times mr-2"></i>ออกจากระบบ
          </button>
        </header>

        <nav className=" ml-4 mt-5">
          <ul className="gap-5 flex flex-col">
            {userLevel === "admin" && (
              <li className="">
                <Link href="/dashboard" className="">
                  <i className="nav-icon fas fa-tachometer-alt mr-2"></i>
                  Dashboard
                </Link>
              </li>
            )}

            {userLevel === "admin" || userLevel === "user" ? (
              <li className="">
                <Link href="/sale" className="">
                  <i className="nav-icon fas fa-dollar-sign text-lg mr-2"></i>
                  ขาย
                </Link>
              </li>
            ) : (
              <></>
            )}

            {userLevel === "admin" && (
              <>
                <li className="">
                  <Link href="/food-type" className="">
                    <i className="nav-icon fas fa-th mr-2"></i>
                    ประเภทอาหาร
                  </Link>
                </li>
                <li className="">
                  <Link href="/food-size" className="">
                    <i className="nav-icon fas fa-list mr-2"></i>
                    ขนาด
                  </Link>
                </li>
                <li className="">
                  <Link href="/food-taste" className="">
                    <i className="nav-icon fas fa-file-alt mr-2"></i>
                    รสชาติอาหาร
                  </Link>
                </li>
                <li className="">
                  <Link href="/food" className="">
                    <i className="nav-icon fas fa-utensils mr-2"></i>
                    อาหาร
                  </Link>
                </li>
                <li className="">
                  <Link href="/food-paginate" className="">
                    <i className="nav-icon fas fa-utensils mr-2"></i>
                    อาหาร (แบ่งหน้า)
                  </Link>
                </li>
                <li className="">
                  <Link href="/organization" className="">
                    <i className="nav-icon fas fa-building mr-2"></i>
                    ข้อมูลร้าน
                  </Link>
                </li>
                <li className="">
                  <Link
                    href="/report-bill-sale"
                    className=""
                  >
                    <i className="nav-icon fas fa-file-alt mr-2"></i>
                    รายงานการขาย
                  </Link>
                </li>
                <li className="">
                  <Link
                    href="/report-sum-sale-per-day"
                    className=""
                  >
                    <i className="nav-icon fas fa-calendar mr-2"></i>
                    สรุปยอดขายรายวัน
                  </Link>
                </li>
                <li className="">
                  <Link
                    href="/report-sum-sale-per-month"
                    className=""
                  >
                    <i className="nav-icon fas fa-calendar mr-2"></i>
                    สรุปยอดขายรายเดือน
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </aside>
    </>
  );
}
