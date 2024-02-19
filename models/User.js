const { Client } = require('pg');

const client = new Client({
    host: "localhost",
    user: "postgres",
    port: "5432",
    password: "admin",
    database: "user"
})
client.connect()
    .then(() => console.log("Connected to PostgreSQL database"))
    .catch(error => console.error("Error connecting to PostgreSQL database:", error));

async function insertUserData(file1, file2, file3 , keyCloakID) {
    try {
        const query = {
            text: 'INSERT INTO "users" (keycloakid, file1, file2, file3) VALUES ($1, $2, $3, $4) ON CONFLICT (keycloakid) DO UPDATE SET file1 = $2, file2 = $3, file3 = $4 RETURNING *',
            values: [keyCloakID ,file1, file2, file3]
        };
        const insertedUser = await client.query(query);
        return insertedUser.rows[0];
    } catch (error) {
        console.error('Error inserting user data:', error);
        throw error;
    }
}
async function findByID(keyCloakID){
    console.log(keyCloakID);
    try{
        const query = {
            text: 'SELECT * FROM "users" WHERE keyCloakID = $1',
            values: [keyCloakID]
        };
        const userFiles = await client.query(query);
        console.log(userFiles);
        return userFiles.rows[0];
    }catch(error){
        console.error('Error finding user by ID:', error);
        throw error;
    }
}
async function updateUserData(keyCloakID ,reqBody){
    try{
        const setFields = Object.entries(reqBody)
        .map(([key, value], index) => `${key} = $${index + 1}`)
        .join(', ');
        const values = Object.values(reqBody);

        const query = {
            text: `UPDATE users SET ${setFields} WHERE keyCloakID = $${Object.keys(reqBody).length + 1}`,
            values: [...values, keyCloakID]
        }
        const updatedUser = await client.query(query);
        return updatedUser.rows[0];
    }catch(err){
        console.error('Error updating user' , err)
        throw err;
    }
}
module.exports = {
    insertUserData,
    findByID,
    updateUserData
};