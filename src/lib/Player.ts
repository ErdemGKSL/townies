import { BaseRole } from "./BaseRole";
import { Game } from "./Game";

export class Player<T, TRoles extends BaseRole<T>> {
    id: string | number;
    voted: string | number;
    extra: T;
    role: TRoles;
    data: { [key: string]: any };
    constructor(id: string | number, role: TRoles, extra: T, public game: Game<T, TRoles>) {
        this.id = id;
        this.role = role;
        this.extra = extra;
        this.voted = null;
        this.data = {};
    }

    get voteSize() {
        return this.game.players.filter(x => x.voted === this.id).size;
    }

}