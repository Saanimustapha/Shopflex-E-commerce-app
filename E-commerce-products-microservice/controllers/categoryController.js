const Category = require("../models/categoryModel"); 

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find(); 
    res.status(200).json({ success: true, data: categories });
  } catch (err) {
    console.error("Error fetching categories:", err.message);
    res.status(500).json({ success: false, error: "Error fetching categories." });
  }
};

// Add a new category
exports.addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const newCategory = new Category({ name });
    await newCategory.save(); // Save the new category to the database
    res.status(201).json({
      success: true,
      message: "Category added successfully.",
      data: newCategory,
    });
  } catch (err) {
    console.error("Error adding category:", err.message);
    res.status(500).json({ success: false, error: "Error adding category." });
  }
};

// Update a category
exports.updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true } 
    );
    if (!updatedCategory) {
      return res
        .status(404)
        .json({ success: false, error: "Category not found." });
    }
    res.status(200).json({
      success: true,
      message: "Category updated successfully.",
      data: updatedCategory,
    });
  } catch (err) {
    console.error("Error updating category:", err.message);
    res.status(500).json({ success: false, error: "Error updating category." });
  }
};

exports.editCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, error: "Category not found." });
    }
    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (err) {
    console.error("Error fetching category:", err.message);
    res.status(500).json({ success: false, error: "Error fetching category." });
  }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCategory = await Category.findByIdAndDelete(id); // Delete the category
    if (!deletedCategory) {
      return res
        .status(404)
        .json({ success: false, error: "Category not found." });
    }
    res.status(200).json({
      success: true,
      message: "Category deleted successfully.",
    });
  } catch (err) {
    console.error("Error deleting category:", err.message);
    res.status(500).json({ success: false, error: "Error deleting category." });
  }
};
