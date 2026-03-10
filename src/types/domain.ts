export type ID = string;

export type UserRole = "institution_admin" | "coach";
export type InvitationStatus = "pending" | "accepted" | "rejected";
export type CheckinStatus =
  | "registered"
  | "present"
  | "assigned"
  | "absent"
  | "competing"
  | "finished"
  | "dq";
export type DisciplineType = "track_lanes" | "relay" | "field";
export type AssignmentType = "lane" | "start_order";

export interface AuditedEntity {
  id: ID;
  createdAt?: string;
  updatedAt?: string;
}

export interface User extends AuditedEntity {
  email: string;
  institutionId: ID;
  role: UserRole;
  displayName: string;
}

export interface Institution extends AuditedEntity {
  name: string;
  shortName: string;
  type: "school" | "club" | "academy";
  city: string;
  country: string;
  contactEmail: string;
  contactPhone?: string;
  logoUrl?: string;
}

export interface Coach extends AuditedEntity {
  institutionId: ID;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  specialties?: string[];
}

export interface Athlete extends AuditedEntity {
  institutionId: ID;
  firstName: string;
  lastName: string;
  gender: "male" | "female" | "other";
  birthDate: string;
  categoryId: ID;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface Category extends AuditedEntity {
  name: string;
  minAge: number;
  maxAge: number;
  code: string;
}

export interface Event extends AuditedEntity {
  institutionId: ID;
  name: string;
  description?: string;
  venue: string;
  eventDate: string;
  registrationDeadline: string;
  status: "draft" | "published" | "in_progress" | "completed";
}

export interface DisciplineDefinition {
  id: ID;
  name: string;
  disciplineType: DisciplineType;
  usesLanes: boolean;
  usesHeats: boolean;
  usesStartOrder: boolean;
  maxParticipantsPerHeat: number;
  categoryId: ID;
  teamSize?: number;
}

export interface EventDiscipline extends AuditedEntity, DisciplineDefinition {
  eventId: ID;
  isOpen: boolean;
}

export interface Invitation extends AuditedEntity {
  eventId: ID;
  fromInstitutionId: ID;
  toInstitutionId: ID;
  status: InvitationStatus;
  respondedAt?: string;
}

export interface EventParticipation extends AuditedEntity {
  eventId: ID;
  institutionId: ID;
  invitationId: ID;
  status: "active" | "withdrawn";
}

export interface EventRegistration extends AuditedEntity {
  eventId: ID;
  eventDisciplineId: ID;
  institutionId: ID;
  athleteId?: ID;
  relayTeamId?: ID;
  categoryId: ID;
}

export interface RelayTeam extends AuditedEntity {
  eventId: ID;
  institutionId: ID;
  eventDisciplineId: ID;
  athleteIds: ID[];
  teamName: string;
}

export interface Checkin extends AuditedEntity {
  eventId: ID;
  eventDisciplineId: ID;
  registrationId: ID;
  athleteId?: ID;
  relayTeamId?: ID;
  status: CheckinStatus;
}

export interface HeatOrGroup extends AuditedEntity {
  eventId: ID;
  eventDisciplineId: ID;
  name: string;
  order: number;
  type: "heat" | "group";
}

export interface HeatAssignment extends AuditedEntity {
  heatOrGroupId: ID;
  registrationId: ID;
  athleteId?: ID;
  relayTeamId?: ID;
  assignmentType: AssignmentType;
  position: number;
}

export interface AuthSession {
  user: User | null;
  institution: Institution | null;
}
