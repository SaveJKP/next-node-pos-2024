const { PrismaClient } = require("@prisma/client"); // นำเข้า PrismaClient สำหรับเชื่อมต่อกับฐานข้อมูล
const prisma = new PrismaClient(); // สร้าง instance ของ PrismaClient

module.exports = {
  // ฟังก์ชัน create ใช้สำหรับสร้างขนาดอาหารใหม่
  create: async (req, res) => {
    try {
      await prisma.foodSize.create({
        data: {
          foodTypeId: req.body.foodTypeId, // รหัสประเภทอาหาร
          name: req.body.name, // ชื่อขนาดอาหาร
          remark: req.body.remark, // หมายเหตุ
          moneyAdded: req.body.moneyAdded, // จำนวนเงินเพิ่มเติม
          status: "use", // กำหนดสถานะเป็น 'use'
        },
      });

      return res.send({ message: "success" }); // ส่งข้อความ success เมื่อสร้างเสร็จ
    } catch (e) {
      return res.status(500).send({ error: e.message }); // ส่งข้อความ error ถ้าเกิดข้อผิดพลาด
    }
  },

  // ฟังก์ชัน list ใช้เพื่อดึงรายการขนาดอาหารทั้งหมดที่มีสถานะ 'use'
  list: async (req, res) => {
    try {
      const rows = await prisma.foodSize.findMany({
        include: {
          FoodType: { select: { name: true }}, // รวมข้อมูลประเภทอาหาร
        },
        where: {
          status: "use", // เงื่อนไขสถานะต้องเป็น 'use'
        },
        orderBy: {
          id: "desc", // จัดเรียงข้อมูลตาม id จากมากไปน้อย
        },
      });

      return res.send({ results: rows }); // ส่งผลลัพธ์กลับในรูปแบบ JSON
    } catch (e) {
      return res.status(500).send({ error: e.message }); // ส่งข้อความ error ถ้าเกิดข้อผิดพลาด
    }
  },

  // ฟังก์ชัน remove ใช้เพื่อลบขนาดอาหารโดยการเปลี่ยนสถานะเป็น 'delete'
  remove: async (req, res) => {
    try {
      await prisma.foodSize.update({
        data: {
          status: "delete", // เปลี่ยนสถานะเป็น 'delete'
        },
        where: {
          id: parseInt(req.params.id), // ใช้ id จากพารามิเตอร์เพื่อระบุตัวรายการที่ต้องการลบ
        },
      });

      return res.send({ message: "success" }); // ส่งข้อความ success เมื่อทำการลบเสร็จ
    } catch (e) {
      return res.status(500).send({ error: e.message }); // ส่งข้อความ error ถ้าเกิดข้อผิดพลาด
    }
  },

  // ฟังก์ชัน update ใช้เพื่ออัปเดตข้อมูลขนาดอาหาร
  update: async (req, res) => {
    try {
      await prisma.foodSize.update({
        data: {
          foodTypeId: req.body.foodTypeId, // รหัสประเภทอาหาร
          name: req.body.name, // ชื่อขนาดอาหาร
          remark: req.body.remark, // หมายเหตุ
          moneyAdded: req.body.moneyAdded, // จำนวนเงินเพิ่มเติม
        },
        where: {
          id: req.body.id, // ระบุ id ของรายการที่ต้องการอัปเดต
        },
      });

      return res.send({ message: "success" }); // ส่งข้อความ success เมื่ออัปเดตเสร็จ
    } catch (e) {
      return res.status(500).send({ error: e.message }); // ส่งข้อความ error ถ้าเกิดข้อผิดพลาด
    }
  },
};
