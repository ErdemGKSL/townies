import { BaseRole } from "./BaseRole";

export class Game<TRoles extends BaseRole> {
    constructor(public id: number, public readonly roles: RolePack<TRoles>) {

    }
}