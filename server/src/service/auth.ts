import sql from "../config/db.config";



interface DBUser {
  username: string;
  stu_password: string;
  stu_email: string;
  stu_dp: string;
}

export async function getUser(email: string): Promise<DBUser | undefined> {
  const result = await sql.query(`
      SELECT username, stu_email, stu_password, stu_dp
      FROM users
      WHERE stu_email = ${email}`);

      console.log(result.rows);
  return result.rows[0];
}

export async function isUsernameExists(username: string): Promise<boolean> {
  console.log("Checking if username exists:", username);
  const result = await sql.query(`
    SELECT username
    FROM users
    WHERE username = ${username}`);
  const rows = result.rows;
  console.log(result.rows);
  if (rows.length > 0) {
    return true;
  }
  return false;
}

export async function updatePassword(
  email: string,
  newPassword: string
): Promise<void> {
  await sql.query(`
    UPDATE users
    SET stu_password = ${newPassword}
    WHERE stu_email = ${email}
  `);
}
