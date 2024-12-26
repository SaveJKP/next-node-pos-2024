const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
  //ทำการเปลี่ยนชื่อไฟล์ แล้วย้ายไปยังที่อยู่ใหม่ uploads
  upload: async (req, res) => {
    try {
      if (!req.files || !req.files.myFile) {
        return res.status(400).send({ error: "No file uploaded" });
      }
  
      const myFile = req.files.myFile;
      const allowedExtensions = ["jpg", "jpeg", "png", "gif", "pdf"];
      const maxFileSize = 5 * 1024 * 1024;
  
      // ตรวจสอบประเภทไฟล์และขนาด
      const fileExtension = myFile.name.split(".").pop().toLowerCase();
      if (!allowedExtensions.includes(fileExtension)) {
        return res.status(400).send({ error: "Invalid file type" });
      }
  
      if (myFile.size === 0) {
        return res.status(400).send({ error: "Empty file uploaded" });
      }
  
      if (myFile.size > maxFileSize) {
        return res.status(400).send({ error: "File size exceeds limit" });
      }
  
      // ป้องกันชื่อไฟล์ซ้ำ
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      const newFileName = `${uniqueSuffix}-${myFile.name}`;
      const uploadPath = `uploads/${newFileName}`;
  
      myFile.mv(uploadPath, (err) => {
        if (err) {
          return res.status(500).send({ error: "File upload failed", details: err.message });
        }
        return res.send({ message: "success", fileName: newFileName });
      });
    } catch (e) {
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
          FoodType: {
            select: {
              name: true,
            },
          },
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
      // ดึงข้อมูลอาหารที่ต้องการลบ เพื่อเข้าถึงชื่อไฟล์ภาพ
      const food = await prisma.food.findUnique({
        where: {
          id: parseInt(req.params.id),
        },
      });

      if (!food) {
        return res.status(404).send({ error: "Food not found" });
      }

      // ลบไฟล์ภาพในโฟลเดอร์ uploads (ถ้ามีภาพ)
      if (food.img && food.img !== "") {
        const fs = require("fs");
        const filePath = `uploads/${food.img}`;
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath); // ลบไฟล์ภาพ
        }
      }

      // อัปเดตสถานะของอาหารเป็น 'delete'
      await prisma.food.update({
        data: {
          status: "delete",
        },
        where: {
          id: parseInt(req.params.id),
        },
      });
      await prisma.saleTempDetail.deleteMany({
        where: {
          foodId: parseInt(req.params.id),
        },
      });
      // ลบข้อมูลที่เกี่ยวข้องใน saleTemp และ saleTempDetail
      await prisma.saleTemp.deleteMany({
        where: {
          foodId: parseInt(req.params.id),
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
