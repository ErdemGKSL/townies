import { Game } from "./Game";
import { Player } from "./Player";

export interface BaseRole<TPlayerExtra> {
    name: string;
    namespace: string;
    team?: string;
    onHang?: (player: Player<TPlayerExtra, this>) => void;
    onKill?: (player: Player<TPlayerExtra, this>) => void;

}

export class Role<TPlayerExtra, TRoles extends BaseRole<TPlayerExtra>> {
    name: TRoles["name"];
    namespace: TRoles["namespace"];
    team: TRoles["team"];
    constructor(public data: TRoles, public game: Game<TPlayerExtra, TRoles>) {
        this.name = data.name;
        this.namespace = data.namespace;
        this.team = data.team ?? this.game.townies.namespace;
    }

}