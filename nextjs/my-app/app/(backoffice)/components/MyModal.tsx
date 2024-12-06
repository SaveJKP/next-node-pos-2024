import { ReactNode, useState } from "react";

interface ModalProps {
  id: string; // ID ของ Modal เพื่อระบุว่าเป็น Modal ใด
  title: string; // ชื่อหรือหัวข้อของ Modal
  modalSize?: string; // ขนาดของ Modal ใช้เป็น Tailwind class เช่น 'max-w-lg'
  children: ReactNode; // เนื้อหาที่จะถูกแสดงภายใน Modal
  onClose: () => void; // Callback เมื่อปิด Modal
}

const Modal: React.FC<ModalProps> = ({
  id,
  title,
  modalSize = "max-w-md", // ขนาดค่าเริ่มต้นของ Modal คือ 'max-w-md'
  children,
  onClose,
}) => {
  

  return (
    <>
      {/* Modal */}
        <div
          className="fixed inset-0 z-10 flex items-center justify-center backdrop-blur-sm" // ครอบพื้นที่หน้าจอและใส่พื้นหลังโปร่งใส
          aria-labelledby={`${id}-label`} // ระบุ label สำหรับ Screen Reader
        >
          {/* ตัวกล่อง Modal */}
          <div
            className={`bg-white rounded-lg shadow-lg w-full ${modalSize}`} // ใช้ Tailwind CSS สำหรับการจัดรูปแบบ
          >
            {/* ส่วน Header ของ Modal */}
            <div className="flex items-center justify-between p-4 border-b">
              <h1 id={`${id}-label`} className="text-lg font-semibold">
                {title} {/* แสดงหัวข้อของ Modal */}
              </h1>
              <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>
              
            </div>

            {/* ส่วนเนื้อหาของ Modal */}
            <div className="p-4">{children}</div>

          
              
            </div>
          </div>
  
    </>
  );
};

export default Modal;
