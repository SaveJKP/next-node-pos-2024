const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
  //ทำการเปลี่ยนชื่อไฟล์ แล้วย้ายไปยังที่อยู่ใหม่ uploads
  upload: async (req, res) => {
    try {
      // ตรวจสอบว่าไฟล์ถูกส่งมาหรือไม่
      if (req.files != undefined) {
        const myFile = req.files.myFile; // เก็บไฟล์ที่อัปโหลดจากฟอร์ม (ชื่อไฟล์เป็น 'myFile')

        // ชื่อไฟล์เดิมที่อัปโหลด
        const fileName = myFile.name;

        // แยกนามสกุลไฟล์และสร้างชื่อไฟล์ใหม่
        const fileExtension = fileName.split(".").pop(); // ใช้ .split() เพื่อแยกชื่อไฟล์กับนามสกุล
        const newFileName = new Date().getTime() + "." + fileExtension; // สร้างชื่อไฟล์ใหม่โดยใช้เวลาปัจจุบัน (timestamp)
        const path = "uploads/" + newFileName; // กำหนดเส้นทางที่จะบันทึกไฟล์

        // บันทึกไฟล์ไปยังโฟลเดอร์ 'uploads'
        myFile.mv(path, async (err) => {
          // ใช้ .mv() เพื่อย้ายไฟล์ไปยังที่อยู่ใหม่
          if (err) {
            // ถ้ามีข้อผิดพลาดในการย้ายไฟล์
            return res.status(500).send({ error: err.message }); // ส่งข้อผิดพลาดกลับไป
          }

          // ถ้าย้ายไฟล์สำเร็จ ส่งข้อความตอบกลับที่มีชื่อไฟล์ใหม่
          return res.send({ message: "success", fileName: newFileName });
        });
      } else {
        // ถ้าไม่พบไฟล์ในคำขอ ส่งข้อผิดพลาดว่าไม่มีไฟล์อัปโหลด
        return res.status(500).send({ error: "No file uploaded" });
      }
    } catch (e) {
      // ถ้ามีข้อผิดพลาดใดๆ ในการประมวลผล ฟังก์ชันนี้จะจับข้อผิดพลาดนั้นและส่งกลับเป็นข้อผิดพลาด 500
      return res.status(500).send({ error: e.message });
    }
  },
  create: async (req, res) => {
    try {
      await prisma.food.create({
        data: {
          foodTypeId: req.body.foodTypeId,
          name: req.body.name,
          remark: req.body.remark,
          price: req.body.price,
          img: req.body.img,
          foodType: req.body.foodType,
        },
      });

      return res.send({ message: "success" });
    } catch (e) {
      return res.status(500).send({ error: e.message });
    }
  },
  list: async (req, res) => {
    try {
      const foods = await prisma.food.findMany({
        include: {
          FoodType: true,
        },
        where: {
          status: "use",
        },
        orderBy: {
          id: "desc",
        },
      });

      return res.send({ results: foods });
    } catch (e) {
      return res.status(500).send({ error: e.message });
    }
  },
  remove: async (req, res) => {
    try {
      await prisma.food.update({
        data: {
          status: "delete",
        },
        where: {
          id: parseInt(req.params.id),
        },
      });

      return res.send({ message: "success" });
    } catch (e) {
      return res.status(500).send({ error: e.message });
    }
  },
  update: async (req, res) => {
    try {
      // ลบไฟล์เก่าในรายการอาหาร
      const oldFood = await prisma.food.findUnique({
        where: {
          id: req.body.id,
        },
      });

      if (oldFood.img != "") {
        if (req.body.img != "") {
          const fs = require("fs");
          fs.unlinkSync("uploads/" + oldFood.img);
        }
      }

      await prisma.food.update({
        where: {
          id: req.body.id,
        },
        data: {
          foodTypeId: req.body.foodTypeId,
          name: req.body.name,
          remark: req.body.remark,
          price: req.body.price,
          img: req.body.img,
          foodType: req.body.foodType,
        },
      });

      return res.send({ message: "success" });
    } catch (e) {
      return res.status(500).send({ error: e.message });
    }
  },
  filter: async (req, res) => {
    try {
      // กำหนดเงื่อนไขเริ่มต้นสำหรับการค้นหา
      let condition = {
        status: "use", // กำหนดเงื่อนไขให้ค้นหาเฉพาะรายการที่สถานะเป็น "use"
      };

      // เช็คว่า foodType ที่รับมาจากพารามิเตอร์ของ URL เป็น "all" หรือไม่
      if (req.params.foodType != "all") {
        // ถ้าไม่ใช่ "all" จะทำการเพิ่มเงื่อนไขสำหรับ foodType
        condition.foodType = req.params.foodType;
      }

      // ใช้ Prisma เพื่อค้นหาข้อมูลในฐานข้อมูล
      const foods = await prisma.food.findMany({
        where: condition, // ส่งเงื่อนไขที่สร้างขึ้นในการค้นหาผ่าน Prisma
        orderBy: {
          id: "desc", // เรียงลำดับผลลัพธ์จากรายการล่าสุด (เรียงตาม id ในลำดับจากมากไปน้อย)
        },
      });

      // ส่งผลลัพธ์ที่ได้กลับไปยัง client
      return res.send({ results: foods });
    } catch (e) {
      // ถ้ามีข้อผิดพลาดเกิดขึ้นจะส่งสถานะ 500 และข้อความแสดงข้อผิดพลาด
      return res.status(500).send({ error: e.message });
    }
  },

  paginate: async (req, res) => {
    try {
      const page = req.body.page;
      const itemsPerPage = req.body.itemsPerPage;
      const foods = await prisma.food.findMany({
        skip: (page - 1) * itemsPerPage,
        take: itemsPerPage,
        orderBy: {
          id: "desc",
        },
        where: {
          status: "use",
        },
      });
      const totalItems = await prisma.food.count({
        where: {
          status: "use",
        },
      });
      const totalPage = Math.ceil(totalItems / itemsPerPage);

      return res.send({
        results: foods,
        totalItems: totalItems,
        totalPage: totalPage,
      });
    } catch (e) {
      return res.status(500).send({ error: e.message });
    }
  },
};
