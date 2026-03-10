import { AssignmentType, Checkin, DisciplineDefinition, HeatAssignment, HeatOrGroup } from "@/types/domain";

export interface GeneratedHeatBundle {
  heatsOrGroups: HeatOrGroup[];
  assignments: HeatAssignment[];
}

export const distributeBalancedGroups = (totalAthletes: number, maxGroupSize: number) => {
  if (totalAthletes <= 0 || maxGroupSize <= 0) {
    return [];
  }

  const numberOfGroups = Math.ceil(totalAthletes / maxGroupSize);
  const baseSize = Math.floor(totalAthletes / numberOfGroups);
  const remainder = totalAthletes % numberOfGroups;

  return Array.from({ length: numberOfGroups }, (_, index) =>
    index < remainder ? baseSize + 1 : baseSize,
  );
};

export const generateHeatsOrGroups = (
  eventId: string,
  eventDisciplineId: string,
  discipline: DisciplineDefinition,
  checkins: Checkin[],
): GeneratedHeatBundle => {
  const eligible = checkins.filter((item) => item.status === "present" || item.status === "registered");
  const sizes = distributeBalancedGroups(eligible.length, discipline.maxParticipantsPerHeat);
  const type: HeatOrGroup["type"] = discipline.usesHeats ? "heat" : "group";
  const assignmentType: AssignmentType = discipline.usesLanes ? "lane" : "start_order";

  let cursor = 0;

  const heatsOrGroups = sizes.map((size, index) => ({
    id: `${eventDisciplineId}-${type}-${index + 1}`,
    eventId,
    eventDisciplineId,
    name: `${type === "heat" ? "Heat" : "Group"} ${index + 1}`,
    order: index + 1,
    type,
  }));

  const assignments = heatsOrGroups.flatMap((heat, heatIndex) => {
    const slice = eligible.slice(cursor, cursor + sizes[heatIndex]);
    cursor += sizes[heatIndex];

    return slice.map((checkin, assignmentIndex) => ({
      id: `${heat.id}-assignment-${assignmentIndex + 1}`,
      heatOrGroupId: heat.id,
      registrationId: checkin.registrationId,
      athleteId: checkin.athleteId,
      relayTeamId: checkin.relayTeamId,
      assignmentType,
      position: assignmentIndex + 1,
    }));
  });

  return { heatsOrGroups, assignments };
};
