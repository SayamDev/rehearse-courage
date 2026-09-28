import {
  Balloon, BaseballCap, Bicycle, Book, Butterfly, Cake, CastleTurret, Cat, Crown, Dog, Fish, Ghost, Guitar, Key, MapTrifold, Moon, Pizza, Robot, Rocket, SoccerBall, Sun, Train, Tree, Umbrella, type Icon,
} from "@phosphor-icons/react";
import type { DiceFace } from "@/lib/games";

/** The picture and words for each dice face (Story dice and Describe it). */
export const FACE: Record<DiceFace, { icon: Icon; word: string }> = {
  cat: { icon: Cat, word: "a cat" }, rocket: { icon: Rocket, word: "a rocket" }, umbrella: { icon: Umbrella, word: "an umbrella" },
  pizza: { icon: Pizza, word: "a pizza" }, tree: { icon: Tree, word: "a tree" }, crown: { icon: Crown, word: "a crown" },
  ghost: { icon: Ghost, word: "a ghost" }, bicycle: { icon: Bicycle, word: "a bike" }, key: { icon: Key, word: "a key" },
  moon: { icon: Moon, word: "the moon" }, book: { icon: Book, word: "a book" }, guitar: { icon: Guitar, word: "a guitar" },
  dog: { icon: Dog, word: "a dog" }, castle: { icon: CastleTurret, word: "a castle" }, fish: { icon: Fish, word: "a fish" },
  cake: { icon: Cake, word: "a cake" }, robot: { icon: Robot, word: "a robot" }, map: { icon: MapTrifold, word: "a map" },
  sun: { icon: Sun, word: "the sun" }, train: { icon: Train, word: "a train" }, balloon: { icon: Balloon, word: "a balloon" },
  football: { icon: SoccerBall, word: "a football" }, cap: { icon: BaseballCap, word: "a cap" }, butterfly: { icon: Butterfly, word: "a butterfly" },
};
