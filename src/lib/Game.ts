import { Collection } from "@discordjs/collection";
import { RolePack, Townies } from "..";
import { Player } from "./Player";
import { BaseRole } from "./BaseRole";

export class Game<TNamespace extends string, TPlayerExtra, TRoles extends BaseRole<TNamespace, TPlayerExtra>> {

    players: Collection<number | string, Player<TPlayerExtra, TRoles, TNamespace>>;
    onNight?: (game: this) => Promise<void> | void;
    onDay?: (game: this) => Promise<void> | void;

    turn: number = 0;
    day: boolean = true;

    constructor(public id: number, public townies: Townies<TNamespace, TPlayerExtra, TRoles>, public readonly roles: RolePack<TNamespace, TPlayerExtra, TRoles>) {
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

    clearVotes() {
        for (const player of this.players.values()) {
            player.voted = null;
        }
    }

    private getVotes() {
        const votes: { [key: string]: number } = {};
        for (const player of this.players.values()) {
            if (player.voted) {
                if (!votes[player.voted]) votes[player.voted] = 0;
                votes[player.voted]++;
            }
        }
        return votes;
    }

    /**
     * Returns an object with the following properties:
     *  - data: An object with the player ID as the key and the number of votes as the value
     *  - maxVotes: An array of player IDs with the most votes
     *  - maxVotesCount: The number of votes the player(s) with the most votes have
     */
    getVoteDatas(): { data: { [k: string]: number }, maxVotes: string[], maxVotesCount: number } {
        const votes = this.getVotes();
        const maxVotesCount = Math.max(...Object.values(votes));
        const maxVotes = Object.keys(votes).filter(key => votes[key] === maxVotesCount);
        return {
            data: votes,
            maxVotes,
            maxVotesCount
        };
    }

    get realTurn() {
        return Math.ceil(this.turn / 2);
    }

}