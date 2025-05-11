// const db = require("../config/db.config");

// //const { v4: uuidv4 } = require('uuid');

// interface Message {
//     stu_email: string;
//     roomid: string;
//     msg: string;
//     msg_delivered: boolean;
// }

// export async function sendMessage({stu_email, roomid, msg, msg_delivered}: Message) {
//     let check = await db `select * from rooms where roomid = ${roomid}`;

//     if(check.length == 0){
//         await db `insert into rooms(room_admin, roomid) values(${stu_email}, ${roomid})`
//     }

//     try {
//         await db`INSERT INTO MESSAGES_TABLE(stu_email,roomid,msg,msg_delivered) 
//                         VALUES (${stu_email},${roomid},${msg},${msg_delivered})`;
//     }
//     catch(err) {
//         console.error(err);
//         throw err; 
//     }
// }

// export async function globalMessages(){
//     try {
//        let msgsList = await db`SELECT * FROM MESSAGES_TABLE WHERE roomid = 'global'`;
//        return msgsList;
//     }
//     catch(err) {
//         console.error(err);
//         throw err; 
//     }
// }