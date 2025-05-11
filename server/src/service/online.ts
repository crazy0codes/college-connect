// import sql from '../config/db.config.js';

// interface User_id {
//     user_id: string;
// }

// export async function isOnline({user_id}: User_id) {
//     try {
//         return await sql`SELECT * FROM ACTIVE`;
//     }
//     catch (err) {
//         console.error(err)
//     }
// }

// export async function offline({user_id}: User_id) {
//     try {
//         return await sql`DELETE FROM ACTIVE WHERE USER_ID = ${user_id} `;
//     }
//     catch (err) {
//         console.error(err)
//     }
// }

// export async function nowActive({user_id}: User_id) {
//     try {
//         return await sql`INSERT INTO ACTIVE (USER_ID) VALUES ${user_id}`;
//     }
//     catch (err) {
//         console.error(err)
//     }
// }
