import Dexie from "dexie";

const db = new Dexie("ReactSampleDB");
db.version(1).stores({ todos: "++id", tree: "++id" });

export default db;
