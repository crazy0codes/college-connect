import { sql } from "../config/db.config";

export async function getProfile({ user }: any): Promise<void> {
  return (
    await sql.query(`select stu_dp from users where stu_email = ${user.email}`)
  ).rows[0].stu_dp;
}

export async function getUserRooms({ user }: any): Promise<void> {
  return (
    await sql.query(`select * from rooms where room_id in (select room_id from user_rooms where stu_email = ${user.email})`
  )).rows[0].rooms;
}

async function updatePicture({imgUrl, email}: {imgUrl: string, email: string}): Promise<void> {
  return (await sql.query(`UPDATE users SET stu_dp = ${imgUrl} WHERE stu_email = ${email}`)).rows[0].rowsAffected[0];
}
