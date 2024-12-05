const { PrismaClient } = require("@prisma/client"); // นำเข้า PrismaClient สำหรับเชื่อมต่อกับฐานข้อมูล
const prisma = new PrismaClient(); // สร้าง instance ของ PrismaClient
const dayjs = require("dayjs"); // นำเข้า dayjs สำหรับการจัดการวันที่และเวลา

module.exports = {
  // ฟังก์ชัน list ใช้เพื่อดึงรายการใบเสร็จ (billSale) ตามวันที่ที่กำหนด
  list: async (req, res) => {
    try {
      // กำหนดวันที่เริ่มต้นและวันที่สิ้นสุดจาก request body
      const startDate = dayjs(req.body.startDate)
        .set("hour", 0)
        .set("minute", 0)
        .set("second", 0)
        .toDate(); // วันที่เริ่มต้น
      const endDate = dayjs(req.body.endDate)
        .set("hour", 23)
        .set("minute", 59)
        .set("second", 59)
        .toDate(); // วันที่สิ้นสุด

      // ดึงข้อมูลใบเสร็จที่มีวันที่อยู่ในช่วงที่กำหนด และสถานะเป็น 'use'
      const billSale = await prisma.billSale.findMany({
        where: {
          payDate: {
            gte: startDate, // วันที่จ่ายต้องมากกว่าหรือเท่ากับ startDate
            lte: endDate, // วันที่จ่ายต้องน้อยกว่าหรือเท่ากับ endDate
          },
          status: "use", // เงื่อนไขสถานะของใบเสร็จต้องเป็น 'use'
        },
        include: {
          // รวมข้อมูลรายละเอียดใบเสร็จ (BillSaleDetails) พร้อมข้อมูลที่เกี่ยวข้อง
          BillSaleDetails: {
            include: {
              Food: true, // รวมข้อมูลอาหาร
              FoodSize: true, // รวมข้อมูลขนาดอาหาร
              Taste: true, // รวมข้อมูลรสชาติ
            },
          },
          User: true, // รวมข้อมูลผู้ใช้ (User) ที่ทำการชำระเงิน
        },
        orderBy: {
          id: "desc", // จัดเรียงข้อมูลตาม id จากมากไปน้อย
        },
      });

      // ส่งผลลัพธ์กลับไปในรูปแบบ JSON
      res.json({ results: billSale });
    } catch (error) {
      // ส่งข้อความ error ถ้าเกิดข้อผิดพลาด
      res.status(500).json({ error: error.message });
    }
  },

  // ฟังก์ชัน remove ใช้เพื่อลบใบเสร็จ (billSale) โดยการเปลี่ยนสถานะเป็น 'delete'
  remove: async (req, res) => {
    try {
      // อัปเดตสถานะของใบเสร็จที่มี id ตามที่ระบุในพารามิเตอร์
      await prisma.billSale.update({
        where: {
          id: parseInt(req.params.id), // แปลง id จากพารามิเตอร์ให้เป็นจำนวนเต็ม
        },
        data: {
          status: "delete", // เปลี่ยนสถานะเป็น 'delete'
        },
      });

      // ส่งข้อความ success เมื่อทำการลบสำเร็จ
      res.json({ message: "success" });
    } catch (error) {
      // ส่งข้อความ error ถ้าเกิดข้อผิดพลาด
      res.status(500).json({ error: error.message });
    }
  },
};
