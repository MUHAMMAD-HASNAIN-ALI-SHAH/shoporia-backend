const Address = require("../models/address.model");

const updateAddress = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const {
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      phoneNumber,
    } = req.body;
    if (
      !addressLine1 ||
      !city ||
      !state ||
      !postalCode ||
      !country ||
      !phoneNumber
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let address = await Address.findOne({ user: user.email });
    if (!address) {
      address = new Address({
        user: user.email,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        country,
        phoneNumber,
      });
    }

    address.addressLine1 = addressLine1;
    address.addressLine2 = addressLine2;
    address.city = city;
    address.state = state;
    address.postalCode = postalCode;
    address.country = country;
    address.phoneNumber = phoneNumber;
    await address.save();

    res.status(200).json({ message: "Address updated successfully", address });
  } catch (error) {
    console.error("Error updating address:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getMyAddress = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const address = await Address.findOne({ user: user.email });
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    res.status(200).json(address);
  } catch (error) {
    console.error("Error fetching address:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { updateAddress, getMyAddress };
