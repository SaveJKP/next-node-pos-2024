const express = require("express");
const app = express();
const bodyPaser = require("body-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");

// ใช้ body-parser เพื่อแปลงข้อมูลในคำขอเป็น JSON
app.use(bodyPaser.json());
app.use(bodyPaser.urlencoded({ extended: true })); // รองรับการส่งข้อมูลในรูปแบบ URL-encoded
app.use(cors()); // เปิดใช้งาน CORS เพื่ออนุญาตให้เข้าถึง API จากโดเมนอื่น
app.use(fileUpload()); // เปิดใช้งานการอัปโหลดไฟล์
app.use("/uploads", express.static("uploads")); // ตั้งค่า static files สำหรับไฟล์ที่อัปโหลด

// นำเข้าตัวควบคุม (controllers) ต่างๆ
const userController = require("./controllers/UserController");
const foodTypeController = require("./controllers/FoodTypeController");
const foodSizeController = require("./controllers/FoodSizeController");
const tasteController = require("./controllers/TasteController");
const foodController = require("./controllers/FoodController");
const saleTempController = require("./controllers/SaleTempController");
const organizationController = require("./controllers/OrganizationController");
const billSaleController = require("./controllers/BillSaleController");
const reportController = require("./controllers/ReportController");

// นำเข้าไลบรารีสำหรับการทำ JWT
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config(); // โหลดค่าต่างๆ จากไฟล์ .env

// ฟังก์ชันสำหรับตรวจสอบการรับรองความถูกต้องของผู้ใช้
const isAuthen = (req, res, next) => {
  if (req.headers.authorization) {
    try {
      const token = req.headers.authorization.split(" ")[1]; // แยก token จาก headers
      const decoded = jwt.verify(token, process.env.SECRET_KEY); // ตรวจสอบความถูกต้องของ token

      if (decoded) {
        next(); // หาก token ถูกต้อง ให้ดำเนินการต่อไป
      } else {
        return res.status(401).send({ error: "Unauthorized" }); // ส่งสถานะ 401 หากไม่ถูกต้อง
      }
    } catch (e) {
      return res.status(401).send(e.message); // ส่งข้อผิดพลาดหากเกิดข้อผิดพลาด
    }
  } else {
    return res.status(401).send({ error: "Unauthorized" }); // ส่งสถานะ 401 หากไม่มี token
  }
};

// API สำหรับการรายงาน
app.post("/api/report/sumPerMonthInYear", isAuthen, (req, res) =>
  reportController.sumPerMonthInYear(req, res)
);
app.post("/api/report/sumPerDayInYearAndMonth", isAuthen, (req, res) =>
  reportController.sumPerDayInYearAndMonth(req, res)
);

// API สำหรับการขาย (billSale)
app.post("/api/billSale/list", (req, res) => billSaleController.list(req, res));
app.delete("/api/billSale/remove/:id", (req, res) =>
  billSaleController.remove(req, res)
);

// API สำหรับองค์กร
app.post("/api/organization/create", (req, res) =>
  organizationController.create(req, res)
);
app.get("/api/organization/info", (req, res) =>
  organizationController.info(req, res)
);
app.post("/api/organization/upload", (req, res) =>
  organizationController.upload(req, res)
);

// API สำหรับการขายชั่วคราว (saleTemp)
app.post("/api/saleTemp/printBillAfterPay", (req, res) =>
  saleTempController.printBillAfterPay(req, res)
);
app.post("/api/saleTemp/endSale", (req, res) =>
  saleTempController.endSale(req, res)
);
app.post("/api/saleTemp/printBillBeforePay", (req, res) =>
  saleTempController.printBillBeforePay(req, res)
);
app.delete("/api/saleTemp/removeSaleTempDetail", (req, res) =>
  saleTempController.removeSaleTempDetail(req, res)
);
app.post("/api/saleTemp/createSaleTempDetail", (req, res) =>
  saleTempController.createSaleTempDetail(req, res)
);
app.put("/api/saleTemp/unselectSize", (req, res) =>
  saleTempController.unselectSize(req, res)
);
app.put("/api/saleTemp/selectSize", (req, res) =>
  saleTempController.selectSize(req, res)
);
app.put("/api/saleTemp/unselectTaste", (req, res) =>
  saleTempController.unselectTaste(req, res)
);
app.put("/api/saleTemp/selectTaste", (req, res) =>
  saleTempController.selectTaste(req, res)
);
app.get("/api/saleTemp/info/:id", (req, res) =>
  saleTempController.info(req, res)
);
app.post("/api/saleTemp/generateSaleTempDetail", (req, res) =>
  saleTempController.generateSaleTempDetail(req, res)
);
app.put("/api/saleTemp/updateQty", (req, res) =>
  saleTempController.updateQty(req, res)
);
app.delete("/api/saleTemp/removeAll", (req, res) =>
  saleTempController.removeAll(req, res)
);
app.delete("/api/saleTemp/remove/:id", (req, res) =>
  saleTempController.remove(req, res)
);
app.get("/api/saleTemp/list", (req, res) => saleTempController.list(req, res));
app.post("/api/saleTemp/create", (req, res) =>
  saleTempController.create(req, res)
);

// API สำหรับอาหาร (food)
app.post("/api/food/paginate", (req, res) => foodController.paginate(req, res));
app.get("/api/food/filter/:foodType", (req, res) =>
  foodController.filter(req, res)
);
app.put("/api/food/update", (req, res) => foodController.update(req, res));
app.delete("/api/food/remove/:id", (req, res) =>
  foodController.remove(req, res)
);
app.get("/api/food/list", (req, res) => foodController.list(req, res));
app.post("/api/food/upload", (req, res) => foodController.upload(req, res));
app.post("/api/food/create", (req, res) => foodController.create(req, res));

// API สำหรับรสชาติ (taste)
app.put("/api/taste/update", (req, res) => tasteController.update(req, res));
app.delete("/api/taste/remove/:id", (req, res) =>
  tasteController.remove(req, res)
);
app.get("/api/taste/list", (req, res) => tasteController.list(req, res));
app.post("/api/taste/create", (req, res) => tasteController.create(req, res));

// API สำหรับขนาดอาหาร (foodSize)
app.put("/api/foodSize/update", (req, res) =>
  foodSizeController.update(req, res)
);
app.delete("/api/foodSize/remove/:id", (req, res) =>
  foodSizeController.remove(req, res)
);
app.get("/api/foodSize/list", (req, res) => foodSizeController.list(req, res));
app.post("/api/foodSize/create", (req, res) =>
  foodSizeController.create(req, res)
);

// API สำหรับประเภทอาหาร (foodType)
app.put("/api/foodType/update", (req, res) =>
  foodTypeController.update(req, res)
);
app.delete("/api/foodType/remove/:id", (req, res) =>
  foodTypeController.remove(req, res)
);
app.get("/api/foodType/list", (req, res) => foodTypeController.list(req, res));
app.post("/api/foodType/create", (req, res) =>
  foodTypeController.create(req, res)
);

// API สำหรับผู้ใช้ (user)
app.get("/api/user/getLevelByToken", (req, res) =>
  userController.getLevelByToken(req, res)
);
app.post("/api/user/create", (req, res) => userController.create(req, res));
app.get("/api/user/list", (req, res) => userController.list(req, res));
app.put("/api/user/update", (req, res) => userController.update(req, res));
app.delete("/api/user/remove/:id", (req, res) =>
  userController.remove(req, res)
);
app.post("/api/user/signIn", (req, res) => userController.signIn(req, res));

// เริ่มเซิร์ฟเวอร์ที่พอร์ต 3001
app.listen(3001, () => {
  console.log("API Server Running on Port 3001"); // แสดงข้อความเมื่อเซิร์ฟเวอร์ทำงาน
});
