import db from "#db/client";

export async function getMembersByCampaignId(campaignId) {
  const sql = `
  SELECT campaign_members.*, users.username
  FROM campaign_members
  JOIN users ON users.id = campaign_members.user_id
  WHERE campaign_id = $1
  `;
  const { rows } = await db.query(sql, [campaignId]);
  return rows;
}

export async function getMember(campaignId, userId) {
  const sql = `
  SELECT * FROM campaign_members
  WHERE campaign_id = $1 AND user_id = $2
  `;
  const {
    rows: [member],
  } = await db.query(sql, [campaignId, userId]);
  return member;
}

export async function addMember(campaignId, userId, role) {
  const sql = `
  INSERT INTO campaign_members
    (campaign_id, user_id, role)
  VALUES
    ($1, $2, $3)
  RETURNING *
  `;
  const {
    rows: [member],
  } = await db.query(sql, [campaignId, userId, role]);
  return member;
}

export async function removeMember(campaignId, userId) {
  const sql = `
  DELETE FROM campaign_members
  WHERE campaign_id = $1 AND user_id = $2
  RETURNING *
  `;
  const {
    rows: [member],
  } = await db.query(sql, [campaignId, userId]);
  return member;
}
