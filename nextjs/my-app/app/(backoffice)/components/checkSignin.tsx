'use client'

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import config from "@/app/config";

const CheckSignin = () => {
  const router = useRouter();

  useEffect(() => {
    // เช็คการล็อกอินหลังจากที่คอมโพเนนต์ถูกเรนเดอร์ในฝั่ง Client
    const token = localStorage.getItem(config.token);

    // ถ้าไม่มี token, เปลี่ยนเส้นทางไปยังหน้า signin
    if (token === null) {
      router.push("/signin");
    }
  }, [router]);

  return null; // ไม่ต้องเรนเดอร์อะไร
};

export default CheckSignin;
