const express = require('express');


const router = express.Router();
const mongoCRUDs = require('../db/mongoCRUDs');


// GET locations
router.get('/', async (req, res) => {
  try {
    let location = await mongoCRUDs.findAllLocations();
    if (location) {
      res.status(200).json(location);
    } else {
      res.status(404).send('Locations not found!');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Something is not right!!");
  }
});


// POST add new location
router.post('/', async (req, res) => {
  try {
    const locationId = await mongoCRUDs.addLocation(req.body);
    
    // If no error was thrown and locationId is received, send success response
    res.status(201).json({
    message: "Location added successfully",
    locationId: locationId
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to add location");
  }
});

// Get a single post
router.get('/:id', async (req, res) => {
  try {
      const location = await mongoCRUDs.getLocation(req.params.id);
      res.status(200).json(location);
  } catch (err) {
      console.error(err);
      if (err.message === "Location not found") {
          res.status(404).send("Location not found");
      } else if (err.message === "Invalid ID format") {
          res.status(400).send("Invalid ID format. Please use a valid 24-character hex string.");
      } else {
          res.status(500).send("Failed to retrieve location");
      }
  }
});

router.put('/:id', async (req, res) => {
  try {
      const locationId = req.params.id;
      const updateData = req.body;
      const updatedLocation = await mongoCRUDs.updateLocation(locationId, updateData);
      if (updatedLocation) {
          res.status(200).json({ message: "Location updated successfully", location: updatedLocation });
      } else {
          res.status(404).send("Location not found");
      }
  } catch (err) {
      console.error(err);
      res.status(500).send("Failed to update location");
  }
});

router.delete('/:id', async (req, res) => {
  try {
      const locationId = req.params.id;
      const deletionResult = await mongoCRUDs.deleteLocation(locationId);
      if (deletionResult.deletedCount > 0) {
          res.status(200).send({ message: "Location deleted successfully" });
      } else {
          res.status(404).send("No Location to delete");
      }
  } catch (err) {
      console.error(err);
      res.status(500).send("Failed to delete location");
  }
});

module.exports = router;