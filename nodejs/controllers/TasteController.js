const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
  // ฟังก์ชันสร้างรสชาติใหม่
  create: async (req, res) => {
    try {
      // สร้างรสชาติใหม่ในฐานข้อมูล
      await prisma.taste.create({
        data: {
          foodTypeId: req.body.foodTypeId, // ประเภทอาหารที่เกี่ยวข้อง
          name: req.body.name, // ชื่อรสชาติ
          remark: req.body.remark, // หมายเหตุเพิ่มเติม
        },
      });

      return res.send({ message: "success" }); // ส่งข้อความสำเร็จกลับไป
    } catch (e) {
      return res.status(500).send({ error: e.message }); // ส่งข้อความผิดพลาดกลับไป
    }
  },
  // ฟังก์ชันดึงรายการรสชาติทั้งหมดที่ใช้งาน
  list: async (req, res) => {
    try {
      // ดึงข้อมูลรสชาติที่สถานะ 'ใช้' พร้อมข้อมูลประเภทอาหาร
      const rows = await prisma.taste.findMany({
        include: {
          FoodType: { select: { name: true } }, // รวมข้อมูลประเภทอาหาร
        },
        where: {
          status: "use", // เงื่อนไขกรองรสชาติที่ใช้งาน
        },
        orderBy: {
          id: "desc", // เรียงลำดับจากมากไปน้อยตาม id
        },
      });

      return res.send({ results: rows }); // ส่งผลลัพธ์กลับไป
    } catch (e) {
      return res.status(500).send({ error: e.message }); // ส่งข้อความผิดพลาดกลับไป
    }
  },
  // ฟังก์ชันลบรสชาติ
  remove: async (req, res) => {
    try {
      // อัปเดตสถานะรสชาติเป็น 'delete' แทนการลบจริง
      await prisma.taste.update({
        data: {
          status: "delete", // เปลี่ยนสถานะเป็น 'ลบ'
        },
        where: {
          id: parseInt(req.params.id), // ระบุรสชาติที่จะลบด้วย id
        },
      });

      return res.send({ message: "success" }); // ส่งข้อความสำเร็จกลับไป
    } catch (e) {
      return res.status(500).send({ error: e.message }); // ส่งข้อความผิดพลาดกลับไป
    }
  },
  // ฟังก์ชันอัปเดตรสชาติ
  update: async (req, res) => {
    try {
      // อัปเดตข้อมูลรสชาติที่ระบุ
      await prisma.taste.update({
        data: {
          foodTypeId: req.body.foodTypeId, // ประเภทอาหารที่เกี่ยวข้อง
          name: req.body.name, // ชื่อรสชาติ
          remark: req.body.remark, // หมายเหตุเพิ่มเติม
        },
        where: {
          id: req.body.id, // ระบุรสชาติที่ต้องการอัปเดต
        },
      });

      return res.send({ message: "success" }); // ส่งข้อความสำเร็จกลับไป
    } catch (e) {
      return res.status(500).send({ error: e.message }); // ส่งข้อความผิดพลาดกลับไป
    }
  },
};
