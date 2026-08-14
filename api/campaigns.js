import express from "express";
const router = express.Router();
export default router;

import requireUser from "#middleware/requireUser";
import requireBody from "#middleware/requireBody";
import {
  getCampaignsByUserId,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
} from "#db/queries/campaigns";

router.use(requireUser);

router
  .route("/")
  .get(async (req, res) => {
    const campaigns = await getCampaignsByUserId(req.user.id);
    res.send(campaigns);
  })
  .post(requireBody(["title"]), async (req, res) => {
    const { title, description, coverImage } = req.body;
    const campaign = await createCampaign(req.user.id, {
      title,
      description,
      coverImage,
    });
    res.status(201).send(campaign);
  });

router
  .route("/:id")
  .get(async (req, res) => {
    const campaign = await getCampaignById(req.params.id);
    if (!campaign) return res.status(404).send("Campaign not found.");
    if (campaign.owner_id !== req.user.id)
      return res.status(403).send("Forbidden.");
    res.send(campaign);
  })
  .patch(async (req, res) => {
    const campaign = await getCampaignById(req.params.id);
    if (!campaign) return res.status(404).send("Campaign not found.");
    if (campaign.owner_id !== req.user.id)
      return res.status(403).send("Forbidden.");
    const updated = await updateCampaign(req.params.id, req.body);
    res.send(updated);
  })
  .delete(async (req, res) => {
    const campaign = await getCampaignById(req.params.id);
    if (!campaign) return res.status(404).send("Campaign not found.");
    if (campaign.owner_id !== req.user.id)
      return res.status(403).send("Forbidden.");
    await deleteCampaign(req.params.id);
    res.status(204).send();
  });
