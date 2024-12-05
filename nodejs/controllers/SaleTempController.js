const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
  // ฟังก์ชันสร้างข้อมูลขายชั่วคราว
  create: async (req, res) => {
    try {
      // ตรวจสอบข้อมูลในตาราง saleTemp โดยการค้นหาข้อมูลที่ตรงกับ userId, tableNo และ foodId
      const rowSaleTemp = await prisma.saleTemp.findFirst({
        where: {
          userId: req.body.userId, // ตรวจสอบ userId จาก body ของ request
          tableNo: req.body.tableNo, // ตรวจสอบ tableNo จาก body ของ request
          foodId: req.body.foodId, // ตรวจสอบ foodId จาก body ของ request
        },
        include: {
          SaleTempDetails: true, // รวมข้อมูลรายละเอียด SaleTempDetails มาในผลลัพธ์
        },
      });

      // เช็คว่าไม่พบข้อมูลใน saleTemp (กรณีไม่มีการบันทึกขายชั่วคราว)
      if (!rowSaleTemp) {
        // ถ้ายังไม่มีข้อมูลขายชั่วคราว ให้สร้างรายการขายใหม่
        await prisma.saleTemp.create({
          data: {
            userId: req.body.userId, // ใช้ userId จาก request body
            tableNo: req.body.tableNo, // ใช้ tableNo จาก request body
            foodId: req.body.foodId, // ใช้ foodId จาก request body
            qty: 1, // ตั้งจำนวนเริ่มต้นเป็น 1
          },
        });
      } else {
        // ถ้ามีข้อมูล saleTemp อยู่แล้ว
        // เช็คว่ามีรายละเอียดใน SaleTempDetails หรือไม่
        if (rowSaleTemp.SaleTempDetails.length === 0) {
          // ถ้าไม่มีรายละเอียดใน SaleTempDetails
          // ให้ทำการอัปเดตยอดขายใน saleTemp โดยเพิ่มจำนวนขึ้น 1
          await prisma.saleTemp.update({
            where: {
              id: rowSaleTemp.id, // ใช้ id ของ rowSaleTemp ที่ค้นพบ
            },
            data: {
              qty: rowSaleTemp.qty + 1, // เพิ่มจำนวนสินค้าใน saleTemp
            },
          });
        }
      }

      // ถ้าทุกอย่างสำเร็จ ส่งผลลัพธ์กลับไปยัง client
      return res.send({ message: "success" });
    } catch (e) {
      // ถ้ามีข้อผิดพลาด ส่งรหัสสถานะ 500 และข้อความแสดงข้อผิดพลาด
      return res.status(500).send({ error: e.message });
    }
  },

  // ฟังก์ชันดึงรายการ saleTemp ทั้งหมด
  list: async (req, res) => {
    try {
      const saleTemps = await prisma.saleTemp.findMany({
        include: {
          SaleTempDetails: {
            include: {
              Food: true,
              Taste: true,
              FoodSize: true,
            },
          },
          Food: true,
        },
        orderBy: {
          id: "desc",
        },
      });

      return res.send({ results: saleTemps });
    } catch (e) {
      return res.status(500).send({ error: e.message });
    }
  },
  // ฟังก์ชันลบรายการ saleTemp
  remove: async (req, res) => {
    try {
      const saleTempId = parseInt(req.params.id);

      // ลบรายละเอียดของ saleTemp
      await prisma.saleTempDetail.deleteMany({
        where: {
          saleTempId: saleTempId,
        },
      });

      // ลบ saleTemp
      await prisma.saleTemp.delete({
        where: {
          id: saleTempId,
        },
      });

      return res.send({ message: "success" });
    } catch (e) {
      return res.status(500).send({ error: e.message });
    }
  },
  // ฟังก์ชันลบรายการ saleTemp ทั้งหมด
  removeAll: async (req, res) => {
    try {
      const saleTemp = await prisma.saleTemp.findMany({
        where: {
          userId: req.body.userId,
          tableNo: req.body.tableNo,
        },
      });

      for (let i = 0; i < saleTemp.length; i++) {
        const item = saleTemp[i];
        // ลบรายละเอียดของ saleTemp ทุกตัว
        await prisma.saleTempDetail.deleteMany({
          where: {
            saleTempId: item.id,
          },
        });
      }

      // ลบ saleTemp ทั้งหมด
      await prisma.saleTemp.deleteMany({
        where: {
          userId: req.body.userId,
          tableNo: req.body.tableNo,
        },
      });

      return res.send({ message: "success" });
    } catch (e) {
      return res.status(500).send({ error: e.message });
    }
  },
  // ฟังก์ชันอัพเดทจำนวนของ saleTemp
  updateQty: async (req, res) => {
    try {
      await prisma.saleTemp.update({
        where: {
          id: req.body.id,
        },
        data: {
          qty: req.body.qty,
        },
      });

      return res.send({ message: "success" });
    } catch (e) {
      return res.status(500).send({ error: e.message });
    }
  },
  // ฟังก์ชันสร้างรายละเอียดของ saleTemp หากยังไม่มี
  generateSaleTempDetail: async (req, res) => {
    try {
      const saleTemp = await prisma.saleTemp.findFirst({
        where: {
          id: req.body.saleTempId,
        },
        include: {
          SaleTempDetails: true,
        },
      });

      // ถ้าไม่มี SaleTempDetails ให้สร้างใหม่
      if (saleTemp.SaleTempDetails.length === 0) {
        for (let i = 0; i < saleTemp.qty; i++) {
          await prisma.saleTempDetail.create({
            data: {
              saleTempId: saleTemp.id,
              foodId: saleTemp.foodId,
            },
          });
        }
      }

      return res.send({ message: "success" });
    } catch (e) {
      return res.status(500).send({ error: e.message });
    }
  },
  // ฟังก์ชันดึงข้อมูล saleTemp โดย id
  info: async (req, res) => {
    try {
      const saleTemp = await prisma.saleTemp.findFirst({
        where: {
          id: parseInt(req.params.id),
        },
        include: {
          Food: {
            include: {
              FoodType: {
                include: {
                  Tastes: {
                    where: {
                      status: "use",
                    },
                  },
                  FoodSizes: {
                    where: {
                      status: "use",
                    },
                    orderBy: {
                      moneyAdded: "asc",
                    },
                  },
                },
              },
            },
          },
          SaleTempDetails: {
            include: {
              Food: true,
              FoodSize: true,
            },
            orderBy: {
              id: "asc",
            },
          },
        },
      });

      return res.send({ results: saleTemp });
    } catch (e) {
      return res.status(500).send({ error: e.message });
    }
  },
  // ฟังก์ชันเลือกรสชาติสำหรับ saleTempDetail
  selectTaste: async (req, res) => {
    try {
      await prisma.saleTempDetail.update({
        where: {
          id: req.body.saleTempDetailId,
        },
        data: {
          tasteId: req.body.tasteId,
        },
      });

      return res.send({ message: "success" });
    } catch (e) {
      return res.status(500).send({ error: e.message });
    }
  },
  // ฟังก์ชันยกเลิกการเลือก รสชาติ
  unselectTaste: async (req, res) => {
    try {
      await prisma.saleTempDetail.update({
        where: {
          id: req.body.saleTempDetailId,
        },
        data: {
          tasteId: null,
        },
      });

      return res.send({ message: "success" });
    } catch (e) {
      return res.status(500).send({ error: e.message });
    }
  },
  // ฟังก์ชันเลือกขนาดสำหรับ saleTempDetail
  selectSize: async (req, res) => {
    try {
      await prisma.saleTempDetail.update({
        where: {
          id: req.body.saleTempDetailId,
        },
        data: {
          foodSizeId: req.body.sizeId,
        },
      });

      return res.send({ message: "success" });
    } catch (e) {
      return res.status(500).send({ error: e.message });
    }
  },
  // ฟังก์ชันยกเลิกการเลือกขนาด
  unselectSize: async (req, res) => {
    try {
      await prisma.saleTempDetail.update({
        where: {
          id: req.body.saleTempDetailId,
        },
        data: {
          foodSizeId: null,
        },
      });

      return res.send({ message: "success" });
    } catch (e) {
      return res.status(500).send({ error: e.message });
    }
  },
  // ฟังก์ชันสร้าง saleTempDetail ใหม่
  createSaleTempDetail: async (req, res) => {
    try {
      const saleTempId = req.body.saleTempId;

      const saleTempDetail = await prisma.saleTempDetail.findFirst({
        where: {
          saleTempId: saleTempId,
        },
      });

      await prisma.saleTempDetail.create({
        data: {
          saleTempId: saleTempDetail.saleTempId,
          foodId: saleTempDetail.foodId,
        },
      });

      const countSaleTempDetail = await prisma.saleTempDetail.count({
        where: {
          saleTempId: saleTempId,
        },
      });

      // อัพเดทจำนวนใน saleTemp
      await prisma.saleTemp.update({
        where: {
          id: saleTempId,
        },
        data: {
          qty: countSaleTempDetail,
        },
      });

      return res.send({ message: "success" });
    } catch (e) {
      return res.status(500).send({ error: e.message });
    }
  },
  // ฟังก์ชันลบ saleTempDetail
  removeSaleTempDetail: async (req, res) => {
    try {
      const saleTempDetailId = req.body.saleTempDetailId;
      const saleTempDetail = await prisma.saleTempDetail.findFirst({
        where: {
          id: saleTempDetailId,
        },
      });

      // ลบ saleTempDetail
      await prisma.saleTempDetail.delete({
        where: {
          id: saleTempDetailId,
        },
      });

      // อัพเดทจำนวนใน saleTemp
      const countSaleTempDetail = await prisma.saleTempDetail.count({
        where: {
          saleTempId: saleTempDetail.saleTempId,
        },
      });

      await prisma.saleTemp.update({
        where: {
          id: saleTempDetail.saleTempId,
        },
        data: {
          qty: countSaleTempDetail,
        },
      });

      return res.send({ message: "success" });
    } catch (e) {
      return res.status(500).send({ error: e.message });
    }
  },
};
