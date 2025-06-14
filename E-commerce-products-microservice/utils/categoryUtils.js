const Category = require('../models/categoryModel');  

const resolveCategoryName = async (categoryId) => {
  const category = await Category.findById(categoryId).select('name');
  return category ? category.name : null; 
};

module.exports = { resolveCategoryName };
