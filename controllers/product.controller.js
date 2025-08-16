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

// admin controller
// Function to edit a product
const editProduct = async (req, res) => {
  try {
    const admin = req.admin;
    if (!admin) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { productId } = req.params;
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

    // Find the product by ID
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete removed images from Cloudinary
    const existingImages = product.images || [];
    const imagesToDelete = existingImages.filter(
      (img) => !images.includes(img)
    );

    await Promise.all(
      imagesToDelete.map(async (imageUrl) => {
        const parts = imageUrl.split("/upload/")[1];
        const withoutVersion = parts.split("/").slice(1).join("/");
        const publicId = withoutVersion.replace(/\.[^/.]+$/, "");
        const result = await cloudinary.uploader.destroy(publicId);
        if (result.result !== "ok")
          console.error(`Failed to delete image: ${imageUrl}`);
      })
    );

    // Upload new images to Cloudinary and store URLs
    const uploadedImageUrls = await Promise.all(
      images.map(async (image) => {
        const result = await cloudinary.uploader.upload(image, {
          folder: "e-commerce",
        });
        return result.secure_url;
      })
    );

    // Update product details
    product.name = name;
    product.description = description;
    product.price = price;
    product.category = category;
    product.stock = stock;
    product.status = status;
    product.images = uploadedImageUrls;

    // SAVE changes to database
    await product.save();

    res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// admin controller
// delete a product
const deleteProduct = async (req, res) => {
  try {
    const admin = req.admin;
    if (!admin) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { productId } = req.params;

    // Find the product by ID
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete images from Cloudinary
    await Promise.all(
      product.images.map(async (imageUrl) => {
        const parts = imageUrl.split("/upload/")[1];
        const withoutVersion = parts.split("/").slice(1).join("/");
        const publicId = withoutVersion.replace(/\.[^/.]+$/, "");
        await cloudinary.uploader.destroy(publicId);
      })
    );

    // Delete the product from the database
    await Product.findByIdAndDelete(productId);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
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
  editProduct,
  deleteProduct
};
