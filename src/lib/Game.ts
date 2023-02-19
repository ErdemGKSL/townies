import { Collection } from "@discordjs/collection";
import { RolePack, Townies } from "..";
import { Player } from "./BasePlayer";
import { BaseRole } from "./BaseRole";

export class Game<TPlayerExtra, TRoles extends BaseRole<TPlayerExtra>> {

    players: Collection<number | string, Player<TPlayerExtra, TRoles>>;
    constructor(public id: number, public townies: Townies<TPlayerExtra, TRoles>, public readonly roles: RolePack<TPlayerExtra, TRoles>) {
        this.players = new Collection();
    }

    async addPlayer(id: string | number, extra: TPlayerExtra, role: TRoles = this.roles[0]) {
        if (this.players.has(id)) throw new Error("Player already exists");
        const player = new Player(id, role, extra, this);
        this.players.set(id, player);
    }

    async removePlayer(id: string | number) {
        if (!this.players.has(id)) throw new Error("Player does not exist");
        this.players.delete(id);
    }

    async giveRoles(roleSizes: {
        [key in TRoles["namespace"]]: number;
    }) {
        const players = this.players.map(x => x).sort(() => Math.random() - 0.5);
        const roles = this.roles.filter(role => roleSizes[role.namespace]);
        const roleSizesArray: number[] = Object.values(roleSizes);
        if (players.length < roleSizesArray.reduce((a, b) => a + b)) throw new Error("Invalid role sizes");
        let i = 0;
        for (const role of roles) {
            for (let j = 0; j < roleSizes[role.namespace]; j++) {
                players[i].role = role;
                i++;
            }
        }
    }

    shufflePlayers(): this["players"] {
        const players = this.players.map(x => x).sort(() => Math.random() - 0.5);
        this.players.clear();
        for (const player of players) {
            this.players.set(player.id, player);
        }
        return this.players;
    }

    dispose() {
        this.townies.games.delete(this.id);
    }

}