const Product = require("../models/product.model");
const cloudinary = require("../lib/cloudinary");

// admin controller
// Function to add a new product
const addProduct = async (req, res) => {
  try {
    const admin = req.admin;
    if (!admin) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { name, description, price, category, images, stock, status } =
      req.body;

    // Validate required fields
    if (
      !name ||
      !description ||
      !price ||
      !category ||
      !images?.length ||
      !stock ||
      !status
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Upload each image to Cloudinary and store only URLs
    const uploadedImageUrls = await Promise.all(
      images.map(async (image) => {
        const result = await cloudinary.uploader.upload(image, {
          folder: "e-commerce",
        });
        return result.secure_url; // Only store the URL
      })
    );

    // Create the product
    const product = new Product({
      name,
      description,
      price,
      category,
      stock,
      status,
      images: uploadedImageUrls,
      owner: admin._id,
    });

    await product.save();

    res.status(201).json({
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// User or admin controller
// Accessor function to get all products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().select("-owner");
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  addProduct,
  getAllProducts,
};
