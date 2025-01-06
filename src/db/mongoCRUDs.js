const { MongoClient, ObjectId } = require("mongodb");


const db_user = 'brandawid_brandon';
const db_pass = 'thoikc5fW';
const db_name = 'brandawid';
const db_collection = 'Users' 
const db_locations_collection = 'Locations';
const dbHostname = "mongodb1.f4.htw-berlin.de"
const dbPort = 27017
const uri = `mongodb://${db_user}:${db_pass}@${dbHostname}:${dbPort}/${db_name}`;

function MongoCRUDs (db_name, uri) {
    this.db_name = db_name;
    this.uri = uri;
} 

MongoCRUDs.prototype.findAllLocations  = async function() {
  const client = new MongoClient(uri);
  try {  
    const database = client.db(db_name);
    const users = database.collection(db_locations_collection);
    const query = {};
    const cursor = users.find(query);
    // Print a message if no documents were found
    if ((await users.countDocuments(query)) === 0) {
      console.log("No documents found!");
      return null;
    }
    let docs = new Array();
    for await (const doc of cursor) {
      docs.push(doc);
    }
    return docs;
  } finally {
    // Ensures that the client will close when finished and on error
    await client.close();
  }
};

MongoCRUDs.prototype.addLocation = async function(locationData) {
  const client = new MongoClient(uri);
  try {
      await client.connect();
      const database = client.db(db_name);
      const locations = database.collection(db_locations_collection);


      // Insert the new location
      const result = await locations.insertOne(locationData);
      console.log("Location added successfully: ", result.insertedId);

      // Directly return the insertedId, assuming the insertOne was successful
      return result.insertedId;
  } catch (error) {
      console.error("Error adding location:", error);
      throw error;  // Rethrow the error for further handling if necessary
  } finally {
      await client.close();  // Ensure the database connection is closed
  }
};

MongoCRUDs.prototype.getLocation = async function(locationId) {
      if (!ObjectId.isValid(locationId)) {
        throw new Error("Invalid ID format");
    }

    const client = new MongoClient(uri);
    try {
        await client.connect();
        const database = client.db(db_name);
        const locations = database.collection(db_locations_collection);

        const query = { _id: new ObjectId(locationId) };
        const location = await locations.findOne(query);
        console.log("LocationID: ", locationId, " retrieved.");
        if (!location) {
            throw new Error("Location not found.");
        }
        return location;
    } catch (error) {
        console.error("Error retrieving location:", error);
        throw error;
    } finally {
        await client.close();
    }
};

MongoCRUDs.prototype.updateLocation = async function(id, updateData) {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const database = client.db(db_name);
    const locations = database.collection(db_locations_collection);
    console.log("Location updated successfully on Location ID: ", id);
    return await locations.updateOne({ _id: new ObjectId(id) }, { $set: updateData });
  } finally {
    await client.close();
  }
};

MongoCRUDs.prototype.deleteLocation = async function(id) {
  const client = new MongoClient(uri);
  try {
      await client.connect();
      const database = client.db(db_name);
      const locations = database.collection(db_locations_collection);
      
      console.log("Location ID: ", id, " has been deleted from Database" );
      // Perform the deletion
      const result = await locations.deleteOne({ _id: new ObjectId(id) });
      return result;
  } catch (error) {
      console.error("Error deleting location:", error);
      throw error;  
  } finally {
      await client.close();
  }
};



MongoCRUDs.prototype.findOneUser  = async function(uNameIn, passwdIn) {
  const client = new MongoClient(uri);
  try {
    const database = client.db(db_name);
    const users = database.collection(db_collection);
    const query = {username: uNameIn, password: passwdIn};
    const doc = await users.findOne(query);
    if (doc) {
      delete doc.password;
    }
    return doc;
  } finally {
    // Ensures that the client will close when finished and on error
    await client.close();
  }
};

MongoCRUDs.prototype.findAllUsers  = async function() {
  const client = new MongoClient(uri);
  try {  
    const database = client.db(db_name);
    const users = database.collection(db_collection);
    const query = {};
    const cursor = users.find(query);
    // Print a message if no documents were found
    if ((await users.countDocuments(query)) === 0) {
      console.log("No documents found!");
      return null;
    }
    let docs = new Array();
    for await (const doc of cursor) {
      delete doc.password;
      docs.push(doc);
    }
    return docs;
  } finally {
    // Ensures that the client will close when finished and on error
    await client.close();
  }
};

const mongoCRUDs = new MongoCRUDs(db_name, uri);

module.exports = mongoCRUDs;
