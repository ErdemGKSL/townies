import { BaseRole } from "./lib/BaseRole";
import { Game } from "./lib/Game";

export type RolePack<T extends BaseRole> = readonly T[];

interface TowniesOptions {
    maxPlayers: number;
    minPlayers: number;
    skippable: boolean;
}


export class Townies<TRoles extends BaseRole> {
    lastGameId: number = 0;
    games: Map<number, Game<TRoles>>;
    roleNames: TRoles["name"][];
    constructor(
        public namespace: string,
        public readonly roles: RolePack<TRoles>,
        public readonly options: TowniesOptions = {
            maxPlayers: 16,
            minPlayers: 4,
            skippable: true,
        }
    ) { };
    createGame(roleFilter?: TRoles["namespace"][]): Game<TRoles> {
        this.lastGameId++;
        const roles = roleFilter ? this.roles.filter(role => roleFilter.includes(role.namespace)) : this.roles;
        const game = new Game(this.lastGameId, roles);
        this.games.set(this.lastGameId, game);
        return game;
    }
};


const townies = new Townies("townies", [
    { name: "Townie", namespace: "townies", vote: () => null },
    { name: "Mafia", namespace: "mafia", kill: () => null },
] as const);