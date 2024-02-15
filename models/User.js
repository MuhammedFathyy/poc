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
            text: 'INSERT INTO "users" (file1, file2, file3 , keyCloakID) VALUES ($1, $2, $3 , $4) RETURNING *',
            values: [file1, file2, file3 , keyCloakID]
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
async function updateRevokeReason(keyCloakID , revokeReason){
    try{
        const query = {
            text: 'UPDATE users u SET revokeReason = $1 WHERE keyCloakID = $2',
            values: [revokeReason , keyCloakID]
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
    updateRevokeReason
};