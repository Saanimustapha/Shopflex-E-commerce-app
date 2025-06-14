//categoryRoutes.js
const express = require("express");
const categoryController = require("../controllers/categoryController");
const router = express.Router();

router.get("/", categoryController.getAllCategories);
router.post("/", categoryController.addCategory);
router.post("/:id", categoryController.updateCategory);
router.get("/:id/edit", categoryController.editCategory);
router.post("/:id/delete", categoryController.deleteCategory);

module.exports = router;
