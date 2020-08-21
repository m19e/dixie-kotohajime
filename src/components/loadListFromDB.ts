import db from "./db";

const loadListFromDB = (listname: string, fn: any) => {
    db.table(listname)
        .toArray()
        .then((todos) => {
            fn(todos);
        });
};

export default loadListFromDB;
