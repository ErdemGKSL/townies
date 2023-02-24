import { BaseRole, Role } from "./lib/BaseRole";
import { Game } from "./lib/Game";
import { Player } from "./lib/Player";

export type RolePack<TNamespace extends string, TPlayerExtra, T extends BaseRole<TNamespace, TPlayerExtra>> = readonly T[];

interface TowniesOptions {
    maxPlayers: number;
    minPlayers: number;
    skippable: boolean;
}


export class Townies<TNamespace extends string, TPlayerExtra, TRoles extends BaseRole<TNamespace, TPlayerExtra>> {
    lastGameId: number = 0;
    games: Map<number, Game<TNamespace, TPlayerExtra, TRoles>>;
    // roleNames: TRoles["name"][];
    readonly roles: Role<TPlayerExtra, TNamespace, TRoles>[];
    onNightStart?: (game: Game<TNamespace, TPlayerExtra, TRoles>) => Promise<void> | void;
    onDayStart?: (game: Game<TNamespace, TPlayerExtra, TRoles>) => Promise<void> | void;
    onEnd?: (game: Game<TNamespace, TPlayerExtra, TRoles>) => Promise<void> | void;
    onStart?: (game: Game<TNamespace, TPlayerExtra, TRoles>) => Promise<void> | void;
    onHang?: (player: Player<TPlayerExtra, TRoles, TNamespace>) => Promise<void> | void;
    onKill?: (player: Player<TPlayerExtra, TRoles, TNamespace>) => Promise<void> | void;

    constructor(
        public namespace: TNamespace,
        roles: RolePack<TNamespace, TPlayerExtra, TRoles>,
        public readonly options: TowniesOptions = {
            maxPlayers: 16,
            minPlayers: 4,
            skippable: true,
        }
    ) {
        this.roles = roles.map(role => new Role(role, this));
        const mainRole = roles.find(role => role.team === namespace);
        if (!mainRole) {
            const nMainRole = roles.find(role => !role.team);
            if (!nMainRole) throw new Error(`No role found for main team (${namespace})`);
            nMainRole.team = namespace;
        }
    };

    createGame(roleFilter?: TRoles["namespace"][]): Game<TNamespace, TPlayerExtra, TRoles> {
        this.lastGameId++;
        const roles = roleFilter ? this.roles.filter(role => roleFilter.includes(role.namespace)) : this.roles;
        const game: Game<TNamespace, TPlayerExtra, TRoles> = new Game(this.lastGameId, this, roles);
        this.games.set(this.lastGameId, game);
        return game;
    }

    on(type: "hang" | "kill", callback: (player: Player<TPlayerExtra, TRoles, TNamespace>) => Promise<void> | void): void;
    on(type: "night" | "day" | "end" | "start", callback: (game: Game<TNamespace, TPlayerExtra, TRoles>) => Promise<void> | void): void;

    on(type: "night" | "day" | "end" | "start" | "hang" | "kill", callback: (data: any) => Promise<void> | void): void {
        switch (type) {
            case "night":
                this.onNightStart = callback;
                break;
            case "day":
                this.onDayStart = callback;
                break;
            case "end":
                this.onEnd = callback;
                break;
            case "start":
                this.onStart = callback;
                break;
            case "hang":
                this.onHang = callback;
                break;
            case "kill":
                this.onKill = callback;
                break;
        }
    }

};

// export function createTownies<TPlayerExtra, TRoles extends BaseRole<TPlayerExtra>>(namespace: string, roles: RolePack<TPlayerExtra, TRoles>, options?: TowniesOptions) {
//     return new Townies(namespace, roles, options);
// }


const townies = new Townies("townies", [
    { name: "Townie", namespace: "townies" },
    { name: "Mafia", namespace: "mafia", team: "mafia" },
] as const);