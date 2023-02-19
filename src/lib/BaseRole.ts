import { Game } from "./Game";
import { Player } from "./Player";

export interface BaseRole<TNamespace extends string, TPlayerExtra> {
    name: string;
    namespace: string;
    team?: string;
    onHang?: (player: Player<TPlayerExtra, this, TNamespace>) => void;
    onKill?: (player: Player<TPlayerExtra, this, TNamespace>) => void;

}

export class Role<TPlayerExtra, TNamespace extends string, TRoles extends BaseRole<TNamespace, TPlayerExtra>> {
    name: TRoles["name"];
    namespace: TRoles["namespace"];
    team: TRoles["team"] | this["game"]["townies"]["namespace"];
    constructor(public data: TRoles, public game: Game<TNamespace, TPlayerExtra, TRoles>) {
        this.name = data.name;
        this.namespace = data.namespace;
        this.team = data.team ?? this.game.townies.namespace;
    }

}