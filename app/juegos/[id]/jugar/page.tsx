import { notFound } from "next/navigation";
import { GAMES } from "@/app/data/games";
import GamePlayerScreen from "@/app/components/GamePlayerScreen";

export default async function GamePlayerPage({ params }: PageProps<"/juegos/[id]/jugar">) {
  const { id } = await params;
  const game = GAMES.find((g) => g.id === id);
  if (!game) notFound();

  return <GamePlayerScreen game={game} />;
}
