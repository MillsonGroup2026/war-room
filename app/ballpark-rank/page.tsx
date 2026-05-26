import BallparkRankClient from "./BallparkRankClient";
import { BALLPARKS } from "@/data/ballparks";

export default function BallparkRankPage() {
  return <BallparkRankClient ballparks={BALLPARKS} />;
}
