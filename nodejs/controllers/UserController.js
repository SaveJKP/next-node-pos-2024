const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  // ฟังก์ชันสำหรับการลงชื่อเข้าใช้
  signIn: async (req, res) => {
    try {
      const u = req.body.username; // ดึงชื่อผู้ใช้จากคำขอ
      const p = req.body.password; // ดึงรหัสผ่านจากคำขอ

      // ค้นหาผู้ใช้ในฐานข้อมูล
      const user = await prisma.user.findFirst({
        select: {
          id: true,
          name: true,
          level: true, // เลือกข้อมูลที่ต้องการส่งกลับ
        },
        where: {
          username: u, // เงื่อนไขการค้นหาตามชื่อผู้ใช้
          password: p, // เงื่อนไขการค้นหาตามรหัสผ่าน
          status: "use", // เงื่อนไขว่าผู้ใช้ต้องมีสถานะ 'ใช้'
        },
      });

      if (user != null) {
        const key = process.env.SECRET_KEY; // ดึงคีย์ลับจากไฟล์ .env
        const token = jwt.sign(user, key, { expiresIn: "30d" }); // สร้าง JWT token

        return res.send({ token: token, name: user.name, id: user.id }); // ส่ง token และข้อมูลผู้ใช้กลับไป
      } else {
        return res.status(401).send(); // ส่งสถานะ 401 หากผู้ใช้ไม่ถูกต้อง
      }
    } catch (e) {
      return res.status(500).send({ error: e.message }); // ส่งข้อความผิดพลาดกลับไป
    }
  },
  // ฟังก์ชันสำหรับสร้างผู้ใช้ใหม่
  create: async (req, res) => {
    try {
      await prisma.user.create({
        data: {
          name: req.body.name, // ชื่อผู้ใช้
          username: req.body.username, // ชื่อผู้ใช้งาน
          password: req.body.password, // รหัสผ่าน
          level: req.body.level, // ระดับของผู้ใช้
        },
      });

      return res.send({ message: "success" }); // ส่งข้อความสำเร็จกลับไป
    } catch (e) {
      return res.status(500).send({ error: e.message }); // ส่งข้อความผิดพลาดกลับไป
    }
  },
  // ฟังก์ชันสำหรับดึงข้อมูลผู้ใช้ทั้งหมด
  list: async (req, res) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          username: true,
          level: true, // เลือกข้อมูลที่ต้องการส่งกลับ
        },
        where: {
          status: "use", // เงื่อนไขว่าผู้ใช้ต้องมีสถานะ 'ใช้'
        },
        orderBy: {
          id: "asc", // เรียงลำดับตาม id จากน้อยไปมาก
        },
      });

      return res.send({ results: users }); // ส่งผลลัพธ์กลับไป
    } catch (e) {
      return res.status(500).send({ error: e.message }); // ส่งข้อความผิดพลาดกลับไป
    }
  },
  // ฟังก์ชันสำหรับอัปเดตข้อมูลผู้ใช้
  update: async (req, res) => {
    try {
      await prisma.user.update({
        where: {
          id: req.body.id, // ระบุ id ของผู้ใช้ที่จะอัปเดต
        },
        data: {
          name: req.body.name, // อัปเดตชื่อผู้ใช้
          username: req.body.username, // อัปเดตชื่อผู้ใช้งาน
          level: req.body.level, // อัปเดตระดับของผู้ใช้
        },
      });

      return res.send({ message: "success" }); // ส่งข้อความสำเร็จกลับไป
    } catch (e) {
      return res.status(500).send({ error: e.message }); // ส่งข้อความผิดพลาดกลับไป
    }
  },
  // ฟังก์ชันสำหรับลบผู้ใช้
  remove: async (req, res) => {
    try {
      await prisma.user.update({
        where: {
          id: parseInt(req.params.id), // ระบุ id ของผู้ใช้ที่จะลบ
        },
        data: {
          status: "delete", // เปลี่ยนสถานะเป็น 'ลบ'
        },
      });

      prisma.billSale.updateMany({
        where: {
          userId: parseInt(req.params.id), // ระบุ id ของผู้ใช้ที่จะลบ
        },
        data: {
          status: "delete", // เปลี่ยนสถานะเป็น 'ลบ'
        },
      })

      return res.send({ message: "success" }); // ส่งข้อความสำเร็จกลับไป
    } catch (e) {
      return res.status(500).send({ error: e.message }); // ส่งข้อความผิดพลาดกลับไป
    }
  },
  // ฟังก์ชันสำหรับดึงระดับของผู้ใช้จาก token
  getLevelByToken: async (req, res) => {
    try {
      const token = req.headers.authorization.split(" ")[1]; // ดึง token จาก headers
      const user = jwt.verify(token, process.env.SECRET_KEY); // ยืนยัน token

      return res.send({ level: user.level }); // ส่งระดับของผู้ใช้กลับไป
    } catch (e) {
      return res.status(500).send({ error: e.message }); // ส่งข้อความผิดพลาดกลับไป
    }
  },
};
