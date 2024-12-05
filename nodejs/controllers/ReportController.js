const { PrismaClient } = require("@prisma/client"); // นำเข้า PrismaClient สำหรับเชื่อมต่อกับฐานข้อมูล
const prisma = new PrismaClient(); // สร้าง instance ของ PrismaClient
const dayjs = require("dayjs"); // นำเข้า dayjs สำหรับการจัดการวันที่

module.exports = {
  // ฟังก์ชัน sumPerDayInYearAndMonth ใช้เพื่อคำนวณยอดรวมต่อวันในปีและเดือนที่ระบุ
  sumPerDayInYearAndMonth: async (req, res) => {
    try {
      const year = req.body.year; // รับปีจากคำขอ
      const month = req.body.month; // รับเดือนจากคำขอ

      // ลูปวันที่จาก 1 ถึงวันที่สิ้นสุดของเดือน
      const sumPerDay = [];
      const startDate = dayjs(`${year}-${month}-01`); // สร้างวันที่เริ่มต้น
      const endDate = startDate.endOf("month"); // ค้นหาวันที่สิ้นสุดของเดือน

      // ลูปสำหรับแต่ละวันในเดือน
      for (let day = startDate.date(); day <= endDate.date(); day++) {
        const dateFrom = startDate.date(day).format("YYYY-MM-DD"); // วันที่เริ่มต้น
        const dateTo = startDate.date(day).add(1, "day").format("YYYY-MM-DD"); // วันที่สิ้นสุด

        // ค้นหาข้อมูล billSale ในวันที่
        const billSales = await prisma.billSale.findMany({
          where: {
            createdDate: {
              gte: new Date(dateFrom), // วันที่เริ่มต้น
              lte: new Date(dateTo), // วันที่สิ้นสุด
            },
          },
          include: {
            BillSaleDetails: true, // รวมรายละเอียดของบิลขาย
          },
        });

        let sum = 0; // ตัวแปรสำหรับเก็บยอดรวม

        // ลูปผ่านบิลขายเพื่อคำนวณยอดรวม
        for (let i = 0; i < billSales.length; i++) {
          const billSaleDetails = billSales[i].BillSaleDetails; // รายละเอียดของบิลขาย

          for (let j = 0; j < billSaleDetails.length; j++) {
            sum += billSaleDetails[j].price + billSaleDetails[j].moneyAdded; // คำนวณยอดรวม
          }
        }

        sumPerDay.push({
          date: dateFrom, // เพิ่มวันที่และยอดรวมในผลลัพธ์
          amount: sum,
        });
      }

      res.json({ results: sumPerDay }); // ส่งผลลัพธ์กลับ
    } catch (error) {
      res.status(500).json({ error: error.message }); // ส่งข้อความ error ถ้าเกิดข้อผิดพลาด
    }
  },

  // ฟังก์ชัน sumPerMonthInYear ใช้เพื่อคำนวณยอดรวมต่อเดือนในปีที่ระบุ
  sumPerMonthInYear: async (req, res) => {
    try {
      const year = req.body.year; // รับปีจากคำขอ
      const sumPerMonth = []; // อาเรย์สำหรับเก็บยอดรวมต่อเดือน

      // ลูปสำหรับแต่ละเดือนในปี
      for (let month = 1; month <= 12; month++) {
        const startDate = dayjs(`${year}-${month}-01`); // วันที่เริ่มต้นของเดือน
        const endDate = startDate.endOf("month"); // วันที่สิ้นสุดของเดือน

        // ค้นหาข้อมูล billSale ในเดือน
        const billSales = await prisma.billSale.findMany({
          where: {
            createdDate: {
              gte: new Date(startDate), // วันที่เริ่มต้น
              lte: new Date(endDate), // วันที่สิ้นสุด
            },
            status: "use", // เฉพาะบิลที่มีสถานะ 'use'
          },
          include: {
            BillSaleDetails: true, // รวมรายละเอียดของบิลขาย
          },
        });

        let sum = 0; // ตัวแปรสำหรับเก็บยอดรวม

        // ลูปผ่านบิลขายเพื่อคำนวณยอดรวม
        for (let i = 0; i < billSales.length; i++) {
          const billSaleDetails = billSales[i].BillSaleDetails; // รายละเอียดของบิลขาย

          for (let j = 0; j < billSaleDetails.length; j++) {
            sum += billSaleDetails[j].price + billSaleDetails[j].moneyAdded; // คำนวณยอดรวม
          }
        }

        sumPerMonth.push({
          month: startDate.format("MM"), // เพิ่มเดือนและยอดรวมในผลลัพธ์
          amount: sum,
        });
      }

      res.json({ results: sumPerMonth }); // ส่งผลลัพธ์กลับ
    } catch (error) {
      res.status(500).json({ error: error.message }); // ส่งข้อความ error ถ้าเกิดข้อผิดพลาด
    }
  },
};
