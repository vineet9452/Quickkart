import slugify from "slugify";
import categoryModel from "../models/categoryModel.js";

export const createCategoryController = async (req, res) => {
  try {
    const { name } = req.body;

    // Name वैलिडेशन
    if (!name) {
      return res.status(400).send({ message: "Name is required" });
    }

    // पहले से मौजूद कैटेगरी चेक करें
    const existingCategory = await categoryModel.findOne({ name });
    if (existingCategory) {
      return res.status(200).send({
        success: true,
        message: "Category Already Exists",
      });
    }
    // नई कैटेगरी बनाएं
    const category =await new categoryModel({
      name,
      slug: slugify(name, { lower: true }), // ✅ सही फॉर्मेट में slug बनाएँ
    }).save()


    res.status(201).send({
      success: true,
      message: "New category created successfully",
      category,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error creating category",
      error: error.message,
    });
  }
};


//update Category Controller
export const updateCategoryController = async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;
    if (!name) {
      return res
        .status(400)
        .send({ success: false, message: "Name is required" });
    }
    const category = await categoryModel.findByIdAndUpdate(
      id,
      { name, slug: slugify(name, { lower: true }) }, // ✅ स्लग को lowercase में कन्वर्ट किया
      { new: true }
    );

    if (!category) {
      return res
        .status(404)
        .send({ success: false, message: "Category not found" });
    }

    res.status(200).send({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error updating category",
      error: error.message,
    });
  }
};

//get All category Controller

export const categoryController = async (req, res) => {
  try {
    // सभी कैटेगरी को MongoDB से लाएं
    const categories = await categoryModel.find({});

    // अगर कोई कैटेगरी नहीं मिली
    if (categories.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No categories found",
      });
    }

    // सफल रिस्पॉन्स
    res.status(200).send({
      success: true,
      message: "All categories list",
      categories,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error fetching categories",
      error: error.message,
    });
  }
};

//single Category Controller
export const singleCategoryController = async (req, res) => {
  try {
    const { slug } = req.params; // Slug प्राप्त करें

    // Slug के आधार पर एक category ढूंढें
    const category = await categoryModel.findOne({ slug });

    // अगर category नहीं मिली
    if (!category) {
      return res.status(404).send({
        success: false,
        message: "Category not found",
      });
    }

    // अगर category मिल गई
    res.status(200).send({
      success: true,
      message: "Get Single Category successfully",
      category,
    });
  } catch (error) {
    // एरर को हैंडल करें और सही response भेजें
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error fetching category",
      error: error.message,
    });
  }
};

// delete Category Controller;

export const deleteCategoryController = async (req, res) => {
  try {
    const { id } = req.params;
    // पहले चेक करें कि Category मौजूद है या नहीं
    const category = await categoryModel.findById(id);
    if (!category) {
      return res.status(404).send({
        success: false,
        message: "Category not found",
      });
    }
    // अगर category मिल गई तो उसे delete करें
    await categoryModel.findByIdAndDelete(id);
    res.status(200).send({
      success: true,
      message: "Category Deleted Successfully",
    });
  } catch (error) {
    console.error(error); // Error को console में दिखाएं
    res.status(500).send({
      success: false,
      message: "Error deleting category",
      error: error.message,
    });
  }
};