import { EventParticipation, Invitation } from "@/types/domain";

import { createDocument, listDocuments, updateDocument } from "@/services/firebase/firestore";

export const listInvitations = () => listDocuments<Invitation>("invitations");
export const sendInvitation = (invitation: Invitation) => createDocument("invitations", invitation);
export const respondToInvitation = (id: string, status: Invitation["status"]) =>
  updateDocument<Invitation>("invitations", id, {
    status,
    respondedAt: new Date().toISOString(),
  });

export const createParticipation = (participation: EventParticipation) =>
  createDocument("eventParticipations", participation);
