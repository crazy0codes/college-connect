import sql from "../config/db.config";

interface DBUser {
  username: string;
  stu_password: string;
  stu_email: string;
  stu_dp: string;
}

export async function getUser(email: string): Promise<DBUser | undefined> {
  const result = await sql<DBUser[]>`
      SELECT username, stu_email, stu_password, stu_dp
      FROM users
      WHERE stu_email = ${email}
    `;
  return result[0];
}

export async function isUsernameExists(username: string): Promise<boolean> {
  const result = await sql<{ username: string }[]>`
    SELECT username
    FROM users
    WHERE username = ${username}
  `;
  return result.length > 0;
}

export async function updatePassword(
  email: string,
  newPassword: string
): Promise<void> {
  await sql`
    UPDATE users
    SET stu_password = ${newPassword}
    WHERE stu_email = ${email}
  `;
}
