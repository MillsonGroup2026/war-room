import TeamWarRoomClient from "./TeamWarRoomClient";
import { MLB_TEAMS } from "@/data/teams";

export default function TeamWarRoomPage() {
  return <TeamWarRoomClient teams={MLB_TEAMS} />;
}
