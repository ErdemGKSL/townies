import { BaseRole } from "./BaseRole";
import { Game } from "./Game";

export class VoteManager<TNamespace extends string, TPlayerExtra, TRoles extends BaseRole<TNamespace, TPlayerExtra>> {

    constructor(public game: Game<TNamespace, TPlayerExtra, TRoles>) { }

    get cache(): { [key: string | number]: { votes: number, voted: string | number } } {
        const alives = [...this.game.players.filter(x => x.alive).values()];
        const votes: { [key: string | number]: { votes: number, voted: string | number } } = {};
        for (const player of alives) {
            if (!votes[player.id]) votes[player.id] = { votes: 0, voted: player.voted };
            else votes[player.id].voted = player.voted;
            if (player.voted) {
                if (!votes[player.voted]) votes[player.voted] = { votes: 0, voted: null };
                votes[player.voted].votes++;
            }
        }
        return votes;
    }

    private getVotes() {
        const votes: { [key: string]: number } = {};
        for (const player of this.game.players.values()) {
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
    calculate(): { data: { [k: string]: number }, maxVotes: string[], maxVotesCount: number } {
        const votes = this.getVotes();
        const maxVotesCount = Math.max(...Object.values(votes));
        const maxVotes = Object.keys(votes).filter(key => votes[key] === maxVotesCount);
        return {
            data: votes,
            maxVotes,
            maxVotesCount
        };
    }

    clear() {
        for (const player of this.game.players.values()) {
            player.voted = null;
        }
    }

}