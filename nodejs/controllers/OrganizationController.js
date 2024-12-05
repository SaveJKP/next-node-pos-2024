const { PrismaClient } = require("@prisma/client"); // นำเข้า PrismaClient สำหรับเชื่อมต่อกับฐานข้อมูล
const prisma = new PrismaClient(); // สร้าง instance ของ PrismaClient

module.exports = {
  // ฟังก์ชัน create ใช้สำหรับสร้างหรืออัปเดตข้อมูลองค์กร
  create: async (req, res) => {
    try {
      const oldOrganization = await prisma.organization.findMany(); // ดึงข้อมูลองค์กรที่มีอยู่

      // สร้าง payload สำหรับข้อมูลองค์กรใหม่
      const payload = {
        name: req.body.name, // ชื่อองค์กร
        phone: req.body.phone, // หมายเลขโทรศัพท์
        address: req.body.address, // ที่อยู่
        email: req.body.email, // อีเมล
        website: req.body.website, // เว็บไซต์
        promptpay: req.body.promptpay, // PromptPay
        logo: req.body.logo, // โลโก้
        taxCode: req.body.taxCode, // รหัสภาษี
      };

      // ตรวจสอบว่ามีองค์กรอยู่ในฐานข้อมูลหรือไม่
      if (oldOrganization.length == 0) {
        // หากไม่มีองค์กร ให้สร้างองค์กรใหม่
        await prisma.organization.create({
          data: payload,
        });
      } else {
        // หากมีองค์กรอยู่แล้ว ให้ทำการอัปเดตข้อมูลขององค์กร
        await prisma.organization.update({
          where: { id: oldOrganization[0].id }, // ใช้ id ขององค์กรที่มีอยู่
          data: payload, // ข้อมูลที่จะอัปเดต
        });
      }

      return res.send({ message: "success" }); // ส่งข้อความ success เมื่อสร้างหรืออัปเดตเสร็จ
    } catch (err) {
      return res.status(500).send({ message: err.message }); // ส่งข้อความ error ถ้าเกิดข้อผิดพลาด
    }
  },

  // ฟังก์ชัน info ใช้เพื่อดึงข้อมูลขององค์กร
  info: async (req, res) => {
    try {
      const organization = await prisma.organization.findFirst(); // ดึงข้อมูลองค์กรแรก
      return res.send({ result: organization }); // ส่งข้อมูลองค์กรกลับ
    } catch (err) {
      return res.status(500).send({ message: err.message }); // ส่งข้อความ error ถ้าเกิดข้อผิดพลาด
    }
  },

  // ฟังก์ชัน upload ใช้เพื่ออัปโหลดโลโก้ขององค์กร
  upload: async (req, res) => {
    try {
      const file = req.files.file; // ดึงไฟล์โลโก้ที่ถูกอัปโหลด
      const extension = file.name.split(".").pop(); // ดึงนามสกุลของไฟล์
      const fileName = `logo_${Date.now()}.${extension}`; // สร้างชื่อไฟล์ใหม่โดยใช้ timestamp

      file.mv(`./uploads/${fileName}`); // ย้ายไฟล์ไปยังโฟลเดอร์ uploads

      const organization = await prisma.organization.findFirst(); // ดึงข้อมูลองค์กรแรก

      if (organization) {
        const fs = require("fs"); // นำเข้า fs เพื่อจัดการไฟล์
        fs.unlinkSync(`./uploads/${organization.logo}`); // ลบไฟล์โลโก้เก่า

        await prisma.organization.update({
          where: {
            id: organization.id, // ใช้ id ขององค์กรในการอัปเดต
          },
          data: {
            logo: fileName, // อัปเดตโลโก้เป็นไฟล์ใหม่
          },
        });
      }

      return res.send({ fileName: fileName }); // ส่งชื่อไฟล์โลโก้ที่อัปโหลดกลับ
    } catch (err) {
      return res.status(500).send({ message: err.message }); // ส่งข้อความ error ถ้าเกิดข้อผิดพลาด
    }
  },
};
