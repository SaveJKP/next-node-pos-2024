const {PrismaClient} = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
    createForQty: async (req, res) => {
        try {
          const saleTemp = await prisma.saleTemp.findFirst({
            where: {
              id: req.body.saleTempId,
            },
            include: {
              SaleTempDetails: true,
            },
          });
    
          // if saleTempDetails is empty then generate saleTempDetail
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
      create: async (req, res) => {
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
      removeSaleTempDetail: async (req, res) => {
        try {
          const saleTempDetailId = req.body.saleTempDetailId;
          const saleTempDetail = await prisma.saleTempDetail.findFirst({
            where: {
              id: saleTempDetailId,
            },
          });
    
          await prisma.saleTempDetail.delete({
            where: {
              id: saleTempDetailId,
            },
          });
    
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
}