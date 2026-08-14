import db from "#db/client";

export async function getCampaignsByUserId(userId) {
  const sql = `
  SELECT *
  FROM campaigns
  WHERE owner_id = $1
  ORDER BY created_at DESC
  `;
  const { rows } = await db.query(sql, [userId]);
  return rows;
}

export async function getCampaignById(id) {
  const sql = `
  SELECT *
  FROM campaigns
  WHERE id = $1
  `;
  const {
    rows: [campaign],
  } = await db.query(sql, [id]);
  return campaign;
}

export async function createCampaign(
  ownerId,
  { title, description, coverImage },
) {
  const sql = `
    INSERT INTO campaigns
        (owner_id, title, description, cover_image)
    VALUES
        ($1, $2, $3, $4)
    RETURNING *
    `;
  const {
    rows: [campaign],
  } = await db.query(sql, [
    ownerId,
    title,
    description ?? null,
    coverImage ?? null,
  ]);
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
  const sql = `
    DELETE
    FROM campaigns
    WHERE id = $1
    RETURNING *
    `;
  const {
    rows: [campaign],
  } = await db.query(sql, [id]);
  return campaign;
}
