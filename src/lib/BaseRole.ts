import { Player } from "./BasePlayer";

export interface BaseRole<TPlayerExtra> {
    name: string;
    namespace: string;
    onHang?: (player: Player<TPlayerExtra, this>) => void;
    onKill?: (player: Player<TPlayerExtra, this>) => void;
}

export class Role<TPlayerExtra, TRoles extends BaseRole<TPlayerExtra>> {

    constructor(public name: TRoles["name"], public namespace: TRoles["namespace"], public data: TRoles) {

    }






}