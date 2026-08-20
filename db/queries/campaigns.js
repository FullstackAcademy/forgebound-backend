import db from "#db/client";
import crypto from "node:crypto";
import { addMember } from "#db/queries/campaignMembers";

export async function getCampaignsByUserId(userId) {
  const sql = `
  SELECT campaigns.*
  FROM campaigns
  JOIN campaign_members ON campaign_members.campaign_id = campaigns.id
  WHERE campaign_members.user_id = $1
  ORDER BY campaigns.created_at DESC
  `;
  const { rows } = await db.query(sql, [userId]);
  return rows;
}

export async function getCampaignById(id) {
  const sql = `SELECT * FROM campaigns WHERE id = $1`;
  const {
    rows: [campaign],
  } = await db.query(sql, [id]);
  return campaign;
}

export async function getCampaignByInviteCode(code) {
  const sql = `SELECT * FROM campaigns WHERE invite_code = $1`;
  const {
    rows: [campaign],
  } = await db.query(sql, [code]);
  return campaign;
}

export async function createCampaign(
  ownerId,
  { title, description, coverImage },
) {
  const inviteCode = crypto.randomBytes(4).toString("hex");
  const sql = `
  INSERT INTO campaigns
    (owner_id, title, description, cover_image, invite_code)
  VALUES
    ($1, $2, $3, $4, $5)
  RETURNING *
  `;
  const {
    rows: [campaign],
  } = await db.query(sql, [
    ownerId,
    title,
    description ?? null,
    coverImage ?? null,
    inviteCode,
  ]);

  await addMember(campaign.id, ownerId, "GM");

  return campaign;
}

export async function updateCampaign(id, { title, description, coverImage }) {
  const sql = `
  UPDATE campaigns
  SET
    title = COALESCE($2, title),
    description = COALESCE($3, description),
    cover_image = COALESCE($4, cover_image),
    updated_at = now()
  WHERE id = $1
  RETURNING *
  `;
  const {
    rows: [campaign],
  } = await db.query(sql, [id, title, description, coverImage]);
  return campaign;
}

export async function deleteCampaign(id) {
  const sql = `DELETE FROM campaigns WHERE id = $1 RETURNING *`;
  const {
    rows: [campaign],
  } = await db.query(sql, [id]);
  return campaign;
}
