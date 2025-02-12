import { MongoClient } from "mongodb";

const MONGO_URI = process.env.MONGO_URI ;
const options = { useNewUrlParser: true, useUnifiedTopology: true };

let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(MONGO_URI, options);
  global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise;

export async function connectToDatabase() {
  const client = await clientPromise;
  const db = client.db(); 
  return { db, client };
}
