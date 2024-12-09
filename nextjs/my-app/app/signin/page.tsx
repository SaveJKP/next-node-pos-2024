"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import config from "@/app/config";
import { useRouter } from "next/navigation";

export default function Page() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const signin = async () => {
    try {
      const payload = {
        username: username,
        password: password,
      };

      const res = await axios.post(
        config.apiServer + "/api/user/signIn",
        payload
      );

      if (res.data.token !== undefined) {
        localStorage.setItem(config.token, res.data.token);
        localStorage.setItem("next_name", res.data.name);
        localStorage.setItem("next_user_id", res.data.id);

        router.push("/sale");
      }
    } catch (e: any) {
      if (e.response.status == 401) {
        Swal.fire({
          title: "ตรวจ username",
          text: "username ไม่ถูกต้อง",
          icon: "error",
        });
      } else {
        Swal.fire({
          title: "error",
          text: e.message,
          icon: "error",
        });
      }
    }
  };

  return (
    <>
        <div className="flex items-center justify-center min-h-screen bg-gray-100 ">
          <div className="bg-white relative flex   rounded-lg shadow-lg ">
            <div className="flex flex-col justify-center items-center p-10 space-y-2  ">
              <img
                className="w-24 h-24 object-contain "
                src="https://www.svgrepo.com/show/333609/tailwind-css.svg"
                alt=""
              />
              <span className="text-4xl font-semibold">Login to DashBoard</span>
              <span className="font-light text-gray-400">
                Please enter your Details
              </span>

              <div className="flex flex-col items-start w-full py-4 space-y-2">
                <span>Email</span>
                <input
                  className="w-full border p-3 rounded-md border-gray-300 placeholder:font-light"
                  placeholder="Enter your Email"
                  type="email"
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="flex flex-col items-start w-full space-y-2">
                <span>Password</span>
                <input
                  className="w-full border p-3 rounded-md border-gray-300 placeholder:font-light"
                  placeholder="Enter your Password"
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="flex justify-between w-full py-4 ">
                <div>
                  <input className="w-4 h-4 mr-2  " type="checkbox" />
                  <span>Remember me</span>
                </div>

                <a href="">Forgot Password</a>
              </div>

              <div className="flex flex-col space-y-4 w-full">
                <button
                  className="bg-black text-white w-full p-3 rounded-lg"
                  onClick={signin}
                >
                  Login
                </button>
                <button className="bg-black text-white w-full p-3 rounded-lg">
                  <i className="fa-brands fa-google mr-2"></i>Login with Google
                </button>
              </div>

              <div className="py-4 space-x-2">
                <span className="text-gray-400">Don't have an account?</span>
                <a className="hover:text-gray-600" href="#">
                  Sign up
                </a>
              </div>
            </div>

            <div className="relative h-full">
              <img
                className="w-[400px] h-full hidden md:block rounded-r-xl object-cover"
                src="https://cdn.pixabay.com/photo/2024/05/15/20/57/developer-8764523_1280.jpg"
                alt=""
              />

              <div className="absolute hidden md:block bottom-10 right-6 p-6 bg-white bg-opacity-0 backdrop-blur-sm rounded-lg shadow-xl ">
                <span className="text-white text-xl">
                  Login to management your Project
                  <br />
                  <span className="text-cyan-400 text-md">
                    Enjoy your Coding with Kobdemy
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
    </>
  );
}
