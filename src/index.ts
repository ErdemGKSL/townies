import { BaseRole } from "./lib/BaseRole";
import { Game } from "./lib/Game";

export type RolePack<TPlayerExtra, T extends BaseRole<TPlayerExtra>> = readonly T[];

interface TowniesOptions {
    maxPlayers: number;
    minPlayers: number;
    skippable: boolean;
}


export class Townies<TPlayerExtra, TRoles extends BaseRole<TPlayerExtra>> {
    lastGameId: number = 0;
    games: Map<number, Game<TPlayerExtra, TRoles>>;
    // roleNames: TRoles["name"][];

    constructor(
        public namespace: string,
        public readonly roles: RolePack<TPlayerExtra,TRoles>,
        public readonly options: TowniesOptions = {
            maxPlayers: 16,
            minPlayers: 4,
            skippable: true,
        }
    ) { };

    createGame(roleFilter?: TRoles["namespace"][]): Game<TPlayerExtra, TRoles> {
        this.lastGameId++;
        const roles = roleFilter ? this.roles.filter(role => roleFilter.includes(role.namespace)) : this.roles;
        const game: Game<TPlayerExtra, TRoles> = new Game(this.lastGameId, this, roles);
        this.games.set(this.lastGameId, game);
        return game;
    }
};

// export function createTownies<TPlayerExtra, TRoles extends BaseRole<TPlayerExtra>>(namespace: string, roles: RolePack<TPlayerExtra, TRoles>, options?: TowniesOptions) {
//     return new Townies(namespace, roles, options);
// }


const townies = new Townies("townies", [
    { name: "Townie", namespace: "townies", vote: () => null },
    { name: "Mafia", namespace: "mafia", kill: () => null },
] as const);