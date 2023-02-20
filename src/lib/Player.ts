import { BaseRole, Role } from "./BaseRole";
import { Game } from "./Game";

export class Player<T, TRoles extends BaseRole<TNamespace, T>, TNamespace extends string> {
    id: string | number;
    voted: string | number;
    extra: T;
    role: Role<T, TNamespace, TRoles>;
    alive: boolean = true;
    data: { [key: string]: any };
    constructor(id: string | number, role: Role<T, TNamespace, TRoles>, extra: T, public game: Game<TNamespace, T, TRoles>) {
        this.id = id;
        this.role = role;
        this.extra = extra;
        this.voted = null;
        this.data = {};
    }

    get voteSize() {
        return this.game.players.filter(x => x.voted === this.id).size;
    }

    get dead() {
        return !this.alive;
    }

    async kill() {
        if (this.dead) throw new Error("Player is already dead");
        this.alive = false;
        this.voted = null;
        await this.role.data.onKill?.(this);
    }

    async hang() {
        if (this.dead) throw new Error("Player is already dead");
        this.alive = false;
        this.voted = null;
        await this.role.data.onHang?.(this);
    }

    async revive() {
        if (this.alive) throw new Error("Player is already alive");
        this.alive = true;
        this.voted = null;
    }

}