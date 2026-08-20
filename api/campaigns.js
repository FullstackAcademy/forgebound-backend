import express from "express";
const router = express.Router();
export default router;

import requireUser from "#middleware/requireUser";
import requireBody from "#middleware/requireBody";
import {
  getCampaignsByUserId,
  getCampaignById,
  getCampaignByInviteCode,
  createCampaign,
  updateCampaign,
  deleteCampaign,
} from "#db/queries/campaigns";
import {
  getMembersByCampaignId,
  getMember,
  addMember,
  removeMember,
} from "#db/queries/campaignMembers";

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

// IMPORTANT: this has to be registered BEFORE "/:id" — otherwise Express
// would treat "join" as an :id value and route it to the wrong handler.
router.route("/join").post(requireBody(["code"]), async (req, res) => {
  const { code } = req.body;
  const campaign = await getCampaignByInviteCode(code);
  if (!campaign) return res.status(404).send("Invalid invite code.");

  const existing = await getMember(campaign.id, req.user.id);
  if (existing)
    return res.status(400).send("You're already a member of this campaign.");

  const member = await addMember(campaign.id, req.user.id, "Player");
  res.status(201).send(member);
});

router
  .route("/:id")
  .get(async (req, res) => {
    const campaign = await getCampaignById(req.params.id);
    if (!campaign) return res.status(404).send("Campaign not found.");
    const member = await getMember(campaign.id, req.user.id);
    if (!member) return res.status(403).send("Forbidden.");
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

router.route("/:id/invite").post(async (req, res) => {
  const campaign = await getCampaignById(req.params.id);
  if (!campaign) return res.status(404).send("Campaign not found.");
  if (campaign.owner_id !== req.user.id)
    return res.status(403).send("Forbidden.");
  res.send({ inviteCode: campaign.invite_code });
});

router.route("/:id/members").get(async (req, res) => {
  const campaign = await getCampaignById(req.params.id);
  if (!campaign) return res.status(404).send("Campaign not found.");
  const requester = await getMember(campaign.id, req.user.id);
  if (!requester) return res.status(403).send("Forbidden.");
  const members = await getMembersByCampaignId(campaign.id);
  res.send(members);
});

router.route("/:id/members/:userId").delete(async (req, res) => {
  const campaign = await getCampaignById(req.params.id);
  if (!campaign) return res.status(404).send("Campaign not found.");
  if (campaign.owner_id !== req.user.id)
    return res.status(403).send("Forbidden.");
  if (Number(req.params.userId) === campaign.owner_id) {
    return res.status(400).send("Can't remove the campaign owner.");
  }
  await removeMember(campaign.id, req.params.userId);
  res.status(204).send();
});
